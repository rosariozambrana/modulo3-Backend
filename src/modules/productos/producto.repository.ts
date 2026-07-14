import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';

export class ProductoRepository {
  create(data: Prisma.ProductoCreateInput) {
    return prisma.producto.create({ data });
  }

  findMany(where: Prisma.ProductoWhereInput, skip: number, take: number) {
    return prisma.producto.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  count(where: Prisma.ProductoWhereInput) {
    return prisma.producto.count({ where });
  }

  findById(id: string) {
    return prisma.producto.findUnique({ where: { id } });
  }

  update(id: string, data: Prisma.ProductoUpdateInput) {
    return prisma.producto.update({ where: { id }, data });
  }

  deactivate(id: string) {
    return prisma.producto.update({ where: { id }, data: { isActive: false } });
  }
}
