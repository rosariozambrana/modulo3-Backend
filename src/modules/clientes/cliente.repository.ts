import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';

export class ClienteRepository {
  create(data: Prisma.ClienteCreateInput) {
    return prisma.cliente.create({ data });
  }

  findMany(where: Prisma.ClienteWhereInput, skip: number, take: number) {
    return prisma.cliente.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  count(where: Prisma.ClienteWhereInput) {
    return prisma.cliente.count({ where });
  }

  findById(id: string) {
    return prisma.cliente.findUnique({ where: { id } });
  }

  findByEmail(email: string) {
    return prisma.cliente.findUnique({ where: { email } });
  }

  update(id: string, data: Prisma.ClienteUpdateInput) {
    return prisma.cliente.update({ where: { id }, data });
  }

  deactivate(id: string) {
    return prisma.cliente.update({ where: { id }, data: { isActive: false } });
  }
}
