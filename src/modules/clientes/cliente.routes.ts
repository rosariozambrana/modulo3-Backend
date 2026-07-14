import { Router } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { validate } from '../../common/middlewares/validate';
import { ClienteController } from './cliente.controller';
import { clienteIdParamSchema, createClienteSchema, updateClienteSchema } from './dto/cliente.dto';

const router = Router();
const controller = new ClienteController();

/**
 * @openapi
 * /api/clientes:
 *   post:
 *     tags: [Clientes]
 *     summary: Registrar un nuevo cliente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateClienteDto'
 *     responses:
 *       201:
 *         description: Cliente creado
 *       400:
 *         description: Error de validación
 *       409:
 *         description: Email duplicado
 */
router.post('/', validate({ body: createClienteSchema }), asyncHandler(controller.create));

/**
 * @openapi
 * /api/clientes:
 *   get:
 *     tags: [Clientes]
 *     summary: Listar clientes
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
 *         description: Lista de clientes
 */
router.get('/', asyncHandler(controller.list));

/**
 * @openapi
 * /api/clientes/{id}:
 *   get:
 *     tags: [Clientes]
 *     summary: Consultar cliente por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Cliente encontrado
 *       404:
 *         description: Cliente no encontrado
 */
router.get('/:id', validate({ params: clienteIdParamSchema }), asyncHandler(controller.getById));

/**
 * @openapi
 * /api/clientes/{id}:
 *   put:
 *     tags: [Clientes]
 *     summary: Actualizar datos de un cliente
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
 *             $ref: '#/components/schemas/UpdateClienteDto'
 *     responses:
 *       200:
 *         description: Cliente actualizado
 *       404:
 *         description: Cliente no encontrado
 *       409:
 *         description: Email duplicado
 */
router.put(
  '/:id',
  validate({ params: clienteIdParamSchema, body: updateClienteSchema }),
  asyncHandler(controller.update),
);

/**
 * @openapi
 * /api/clientes/{id}/deactivate:
 *   patch:
 *     tags: [Clientes]
 *     summary: Dar de baja lógica a un cliente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Cliente desactivado
 *       404:
 *         description: Cliente no encontrado
 */
router.patch(
  '/:id/deactivate',
  validate({ params: clienteIdParamSchema }),
  asyncHandler(controller.deactivate),
);

export default router;
