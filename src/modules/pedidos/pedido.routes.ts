import { Router } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { validate } from '../../common/middlewares/validate';
import { PedidoController } from './pedido.controller';
import {
  changeStatusSchema,
  createPedidoSchema,
  pedidoIdParamSchema,
} from './dto/pedido.dto';

const router = Router();
const controller = new PedidoController();

/**
 * @openapi
 * /api/pedidos:
 *   post:
 *     tags: [Pedidos]
 *     summary: Crear un pedido con sus productos (total calculado automáticamente)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePedidoDto'
 *     responses:
 *       201:
 *         description: Pedido creado
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Cliente o producto no encontrado
 *       409:
 *         description: Cliente inactivo o stock insuficiente
 */
router.post('/', validate({ body: createPedidoSchema }), asyncHandler(controller.create));

/**
 * @openapi
 * /api/pedidos:
 *   get:
 *     tags: [Pedidos]
 *     summary: Listar pedidos
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [PENDING, CONFIRMED, DELIVERED, CANCELLED] }
 *       - in: query
 *         name: customerId
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Lista de pedidos
 */
router.get('/', asyncHandler(controller.list));

/**
 * @openapi
 * /api/pedidos/{id}:
 *   get:
 *     tags: [Pedidos]
 *     summary: Consultar pedido por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Pedido encontrado
 *       404:
 *         description: Pedido no encontrado
 */
router.get('/:id', validate({ params: pedidoIdParamSchema }), asyncHandler(controller.getById));

/**
 * @openapi
 * /api/pedidos/{id}/status:
 *   patch:
 *     tags: [Pedidos]
 *     summary: Cambiar el estado de un pedido (confirmar descuenta stock, cancelar un confirmado lo restituye)
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
 *             $ref: '#/components/schemas/ChangeStatusDto'
 *     responses:
 *       200:
 *         description: Estado actualizado
 *       404:
 *         description: Pedido no encontrado
 *       409:
 *         description: Transición de estado no permitida o stock insuficiente
 */
router.patch(
  '/:id/status',
  validate({ params: pedidoIdParamSchema, body: changeStatusSchema }),
  asyncHandler(controller.changeStatus),
);

export default router;
