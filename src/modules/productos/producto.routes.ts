import { Router } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { validate } from '../../common/middlewares/validate';
import { ProductoController } from './producto.controller';
import {
  createProductoSchema,
  productoIdParamSchema,
  updatePrecioStockSchema,
  updateProductoSchema,
} from './dto/producto.dto';

const router = Router();
const controller = new ProductoController();

/**
 * @openapi
 * /api/productos:
 *   post:
 *     tags: [Productos]
 *     summary: Registrar un nuevo producto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProductoDto'
 *     responses:
 *       201:
 *         description: Producto creado
 *       400:
 *         description: Error de validación
 */
router.post('/', validate({ body: createProductoSchema }), asyncHandler(controller.create));

/**
 * @openapi
 * /api/productos:
 *   get:
 *     tags: [Productos]
 *     summary: Listar productos
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: isActive
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: Lista de productos
 */
router.get('/', asyncHandler(controller.list));

/**
 * @openapi
 * /api/productos/{id}:
 *   get:
 *     tags: [Productos]
 *     summary: Consultar producto por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Producto encontrado
 *       404:
 *         description: Producto no encontrado
 */
router.get('/:id', validate({ params: productoIdParamSchema }), asyncHandler(controller.getById));

/**
 * @openapi
 * /api/productos/{id}:
 *   put:
 *     tags: [Productos]
 *     summary: Actualizar datos generales de un producto (nombre/descripción)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProductoDto'
 *     responses:
 *       200:
 *         description: Producto actualizado
 *       404:
 *         description: Producto no encontrado
 */
router.put(
  '/:id',
  validate({ params: productoIdParamSchema, body: updateProductoSchema }),
  asyncHandler(controller.update),
);

/**
 * @openapi
 * /api/productos/{id}/precio-stock:
 *   patch:
 *     tags: [Productos]
 *     summary: Actualizar precio y/o stock de un producto
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePrecioStockDto'
 *     responses:
 *       200:
 *         description: Producto actualizado
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Producto no encontrado
 */
router.patch(
  '/:id/precio-stock',
  validate({ params: productoIdParamSchema, body: updatePrecioStockSchema }),
  asyncHandler(controller.updatePrecioStock),
);

/**
 * @openapi
 * /api/productos/{id}/deactivate:
 *   patch:
 *     tags: [Productos]
 *     summary: Dar de baja lógica a un producto
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Producto desactivado
 *       404:
 *         description: Producto no encontrado
 */
router.patch(
  '/:id/deactivate',
  validate({ params: productoIdParamSchema }),
  asyncHandler(controller.deactivate),
);

export default router;
