import { Prisma, OrderStatus } from '@prisma/client';
import { prisma } from '../../config/prisma';

type TxClient = Prisma.TransactionClient;

const includeItems = {
  items: {
    include: { producto: true },
  },
  cliente: true,
} satisfies Prisma.PedidoInclude;

export class PedidoRepository {
  runTransaction<T>(fn: (tx: TxClient) => Promise<T>) {
    return prisma.$transaction(fn);
  }

  findClienteById(tx: TxClient, id: string) {
    return tx.cliente.findUnique({ where: { id } });
  }

  findProductoByIdForUpdate(tx: TxClient, id: string) {
    return tx.producto.findUnique({ where: { id } });
  }

  decrementStock(tx: TxClient, productId: string, quantity: number) {
    return tx.producto.update({
      where: { id: productId },
      data: { stock: { decrement: quantity } },
    });
  }

  incrementStock(tx: TxClient, productId: string, quantity: number) {
    return tx.producto.update({
      where: { id: productId },
      data: { stock: { increment: quantity } },
    });
  }

  createPedido(
    tx: TxClient,
    data: {
      customerId: string;
      total: Prisma.Decimal;
      items: { productId: string; quantity: number; unitPrice: Prisma.Decimal; subtotal: Prisma.Decimal }[];
    },
  ) {
    return tx.pedido.create({
      data: {
        customerId: data.customerId,
        total: data.total,
        items: {
          create: data.items,
        },
      },
      include: includeItems,
    });
  }

  findById(id: string) {
    return prisma.pedido.findUnique({ where: { id }, include: includeItems });
  }

  findByIdTx(tx: TxClient, id: string) {
    return tx.pedido.findUnique({ where: { id }, include: includeItems });
  }

  findMany(where: Prisma.PedidoWhereInput, skip: number, take: number) {
    return prisma.pedido.findMany({
      where,
      skip,
      take,
      orderBy: { orderDate: 'desc' },
      include: includeItems,
    });
  }

  count(where: Prisma.PedidoWhereInput) {
    return prisma.pedido.count({ where });
  }

  updateStatus(tx: TxClient, id: string, status: OrderStatus) {
    return tx.pedido.update({ where: { id }, data: { status }, include: includeItems });
  }
}
