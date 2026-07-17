import { z } from 'zod';

export const createClienteSchema = z.object({
  fullName: z.string().trim().min(1, 'FullName es obligatorio'),
  email: z.string().trim().email('Email inválido'),
  phone: z.string().trim().nullable().optional(),
});

export const updateClienteSchema = z.object({
  fullName: z.string().trim().min(1, 'FullName es obligatorio').optional(),
  email: z.string().trim().email('Email inválido').optional(),
  phone: z.string().trim().nullable().optional(),
});

export const clienteIdParamSchema = z.object({
  id: z.string().uuid('Id inválido'),
});

export const listClientesQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  isActive: z.enum(['true', 'false']).optional(),
});

export type CreateClienteDto = z.infer<typeof createClienteSchema>;
export type UpdateClienteDto = z.infer<typeof updateClienteSchema>;
