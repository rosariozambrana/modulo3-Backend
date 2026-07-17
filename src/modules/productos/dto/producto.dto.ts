import { z } from 'zod';

export const createProductoSchema = z.object({
  name: z.string().trim().min(1, 'Name es obligatorio'),
  description: z.string().trim().optional(),
  price: z.number({ invalid_type_error: 'Price debe ser numérico' }).positive('Price debe ser mayor que 0'),
  stock: z
    .number({ invalid_type_error: 'Stock debe ser numérico' })
    .int('Stock debe ser un entero')
    .min(0, 'Stock no puede ser negativo')
    .optional()
    .default(0),
});

export const updateProductoSchema = z.object({
  name: z.string().trim().min(1, 'Name es obligatorio').optional(),
  description: z.string().trim().optional(),
  price: z
    .number({ invalid_type_error: 'Price debe ser numérico' })
    .positive('Price debe ser mayor que 0')
    .optional(),
  stock: z
    .number({ invalid_type_error: 'Stock debe ser numérico' })
    .int('Stock debe ser un entero')
    .min(0, 'Stock no puede ser negativo')
    .optional(),
});

export const updatePrecioStockSchema = z
  .object({
    price: z.number().positive('Price debe ser mayor que 0').optional(),
    stock: z.number().int('Stock debe ser un entero').min(0, 'Stock no puede ser negativo').optional(),
  })
  .refine((data) => data.price !== undefined || data.stock !== undefined, {
    message: 'Debe enviar al menos price o stock',
  });

export const productoIdParamSchema = z.object({
  id: z.string().uuid('Id inválido'),
});

export type CreateProductoDto = z.infer<typeof createProductoSchema>;
export type UpdateProductoDto = z.infer<typeof updateProductoSchema>;
export type UpdatePrecioStockDto = z.infer<typeof updatePrecioStockSchema>;
