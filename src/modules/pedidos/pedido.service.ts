import { OrderStatus, Prisma } from '@prisma/client';
import { AppError } from '../../common/errors/AppError';
import { parsePagination, buildPaginationMeta, PaginationQuery } from '../../common/utils/pagination';
import { PedidoRepository } from './pedido.repository';
import { ChangeStatusDto, CreatePedidoDto } from './dto/pedido.dto';

interface ListPedidosQuery extends PaginationQuery {
  status?: OrderStatus;
  customerId?: string;
}

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
};

export class PedidoService {
  constructor(private readonly repository: PedidoRepository = new PedidoRepository()) {}

  async create(dto: CreatePedidoDto) {
    return this.repository.runTransaction(async (tx) => {
      const cliente = await this.repository.findClienteById(tx, dto.customerId);
      if (!cliente) throw AppError.notFound('El cliente indicado no existe');
      if (!cliente.isActive) throw AppError.conflict('El cliente indicado no está activo');

      // Consolida cantidades si el mismo producto aparece más de una vez
      const quantitiesByProduct = new Map<string, number>();
      for (const item of dto.items) {
        quantitiesByProduct.set(
          item.productId,
          (quantitiesByProduct.get(item.productId) ?? 0) + item.quantity,
        );
      }

      const orderItems: {
        productId: string;
        quantity: number;
        unitPrice: Prisma.Decimal;
        subtotal: Prisma.Decimal;
      }[] = [];
      let total = new Prisma.Decimal(0);

      for (const [productId, quantity] of quantitiesByProduct.entries()) {
        const producto = await this.repository.findProductoByIdForUpdate(tx, productId);
        if (!producto) throw AppError.notFound(`El producto ${productId} no existe`);
        if (!producto.isActive) throw AppError.conflict(`El producto ${producto.name} no está activo`);
        if (producto.stock < quantity) {
          throw AppError.conflict(
            `Stock insuficiente para el producto "${producto.name}". Disponible: ${producto.stock}, solicitado: ${quantity}`,
          );
        }

        const unitPrice = producto.price;
        const subtotal = unitPrice.mul(quantity);
        total = total.add(subtotal);

        orderItems.push({ productId, quantity, unitPrice, subtotal });
      }

      return this.repository.createPedido(tx, {
        customerId: dto.customerId,
        total,
        items: orderItems,
      });
    });
  }

  async list(query: ListPedidosQuery) {
    const { skip, take, page, limit } = parsePagination(query);
    const where: Prisma.PedidoWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.customerId ? { customerId: query.customerId } : {}),
    };

    const [items, total] = await Promise.all([
      this.repository.findMany(where, skip, take),
      this.repository.count(where),
    ]);

    return {
      items: Array.isArray(items) ? items : [],
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  async getById(id: string) {
    const pedido = await this.repository.findById(id);
    if (!pedido) throw AppError.notFound('Pedido no encontrado');
    return pedido;
  }

  async changeStatus(id: string, dto: ChangeStatusDto) {
    return this.repository.runTransaction(async (tx) => {
      const pedido = await this.repository.findByIdTx(tx, id);
      if (!pedido) throw AppError.notFound('Pedido no encontrado');

      const nextStatus = dto.status;
      if (nextStatus === pedido.status) return pedido;

      const allowed = VALID_TRANSITIONS[pedido.status];
      if (!allowed.includes(nextStatus)) {
        throw AppError.conflict(
          `Transición de estado no permitida: ${pedido.status} -> ${nextStatus}`,
        );
      }

      if (nextStatus === 'CONFIRMED') {
        for (const item of pedido.items) {
          const producto = await this.repository.findProductoByIdForUpdate(tx, item.productId);
          if (!producto || producto.stock < item.quantity) {
            throw AppError.conflict(
              `Stock insuficiente para confirmar el pedido. Producto: ${item.productId}`,
            );
          }
        }
        for (const item of pedido.items) {
          await this.repository.decrementStock(tx, item.productId, item.quantity);
        }
      }

      if (nextStatus === 'CANCELLED' && pedido.status === 'CONFIRMED') {
        for (const item of pedido.items) {
          await this.repository.incrementStock(tx, item.productId, item.quantity);
        }
      }

      return this.repository.updateStatus(tx, id, nextStatus);
    });
  }
}
