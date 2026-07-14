import { z } from 'zod';

export const orderItemInputSchema = z.object({
  productId: z.string().uuid('productId inválido'),
  quantity: z.number({ invalid_type_error: 'Quantity debe ser numérico' }).int('Quantity debe ser un entero').positive('Quantity debe ser mayor que 0'),
});

export const createPedidoSchema = z.object({
  customerId: z.string().uuid('customerId inválido'),
  items: z.array(orderItemInputSchema).min(1, 'El pedido debe tener al menos 1 producto'),
});

export const pedidoIdParamSchema = z.object({
  id: z.string().uuid('Id inválido'),
});

export const changeStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'DELIVERED', 'CANCELLED'], {
    errorMap: () => ({ message: 'Status debe ser PENDING, CONFIRMED, DELIVERED o CANCELLED' }),
  }),
});

export const listPedidosQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.enum(['PENDING', 'CONFIRMED', 'DELIVERED', 'CANCELLED']).optional(),
  customerId: z.string().uuid().optional(),
});

export type CreatePedidoDto = z.infer<typeof createPedidoSchema>;
export type ChangeStatusDto = z.infer<typeof changeStatusSchema>;
