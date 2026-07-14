import { AppError } from '../../common/errors/AppError';
import { parsePagination, buildPaginationMeta, PaginationQuery } from '../../common/utils/pagination';
import { ProductoRepository } from './producto.repository';
import { CreateProductoDto, UpdatePrecioStockDto, UpdateProductoDto } from './dto/producto.dto';

interface ListProductosQuery extends PaginationQuery {
  isActive?: string;
}

export class ProductoService {
  constructor(private readonly repository: ProductoRepository = new ProductoRepository()) {}

  async create(dto: CreateProductoDto) {
    return this.repository.create({
      name: dto.name,
      description: dto.description,
      price: dto.price,
      stock: dto.stock ?? 0,
    });
  }

  async list(query: ListProductosQuery) {
    const { skip, take, page, limit } = parsePagination(query);
    const where = query.isActive !== undefined ? { isActive: query.isActive === 'true' } : {};

    const [items, total] = await Promise.all([
      this.repository.findMany(where, skip, take),
      this.repository.count(where),
    ]);

    return { items, meta: buildPaginationMeta(total, page, limit) };
  }

  async getById(id: string) {
    const producto = await this.repository.findById(id);
    if (!producto) {
      throw AppError.notFound('Producto no encontrado');
    }
    return producto;
  }

  async update(id: string, dto: UpdateProductoDto) {
    const producto = await this.repository.findById(id);
    if (!producto) {
      throw AppError.notFound('Producto no encontrado');
    }
    return this.repository.update(id, dto);
  }

  async updatePrecioStock(id: string, dto: UpdatePrecioStockDto) {
    const producto = await this.repository.findById(id);
    if (!producto) {
      throw AppError.notFound('Producto no encontrado');
    }
    return this.repository.update(id, dto);
  }

  async deactivate(id: string) {
    const producto = await this.repository.findById(id);
    if (!producto) {
      throw AppError.notFound('Producto no encontrado');
    }
    if (!producto.isActive) {
      return producto;
    }
    return this.repository.deactivate(id);
  }
}
