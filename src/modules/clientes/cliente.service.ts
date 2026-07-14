import { AppError } from '../../common/errors/AppError';
import { parsePagination, buildPaginationMeta, PaginationQuery } from '../../common/utils/pagination';
import { ClienteRepository } from './cliente.repository';
import { CreateClienteDto, UpdateClienteDto } from './dto/cliente.dto';

interface ListClientesQuery extends PaginationQuery {
  isActive?: string;
}

export class ClienteService {
  constructor(private readonly repository: ClienteRepository = new ClienteRepository()) {}

  async create(dto: CreateClienteDto) {
    const existing = await this.repository.findByEmail(dto.email);
    if (existing) {
      throw AppError.conflict('Ya existe un cliente registrado con ese email');
    }

    return this.repository.create({
      fullName: dto.fullName,
      email: dto.email,
      phone: dto.phone,
    });
  }

  async list(query: ListClientesQuery) {
    const { skip, take, page, limit } = parsePagination(query);
    const where = query.isActive !== undefined ? { isActive: query.isActive === 'true' } : {};

    const [items, total] = await Promise.all([
      this.repository.findMany(where, skip, take),
      this.repository.count(where),
    ]);

    return { items, meta: buildPaginationMeta(total, page, limit) };
  }

  async getById(id: string) {
    const cliente = await this.repository.findById(id);
    if (!cliente) {
      throw AppError.notFound('Cliente no encontrado');
    }
    return cliente;
  }

  async update(id: string, dto: UpdateClienteDto) {
    const cliente = await this.repository.findById(id);
    if (!cliente) {
      throw AppError.notFound('Cliente no encontrado');
    }

    if (dto.email && dto.email !== cliente.email) {
      const existing = await this.repository.findByEmail(dto.email);
      if (existing) {
        throw AppError.conflict('Ya existe un cliente registrado con ese email');
      }
    }

    return this.repository.update(id, dto);
  }

  async deactivate(id: string) {
    const cliente = await this.repository.findById(id);
    if (!cliente) {
      throw AppError.notFound('Cliente no encontrado');
    }
    if (!cliente.isActive) {
      return cliente;
    }
    return this.repository.deactivate(id);
  }
}
