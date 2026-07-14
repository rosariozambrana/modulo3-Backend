import swaggerJSDoc from 'swagger-jsdoc';
import path from 'path';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'API de Gestión de Clientes, Productos y Pedidos',
      version: '1.0.0',
      description:
        'Backend en Node.js + TypeScript + Express + Prisma para la gestión de Clientes, Productos y Pedidos, con reglas de negocio de stock, totales automáticos y transacciones.',
    },
    servers: [
      {
        url: '/api',
        description: 'Servidor actual',
      },
    ],
    tags: [
      { name: 'Clientes' },
      { name: 'Productos' },
      { name: 'Pedidos' },
    ],
    components: {
      schemas: {
        CreateClienteDto: {
          type: 'object',
          required: ['fullName', 'email'],
          properties: {
            fullName: { type: 'string', example: 'Juan Pérez' },
            email: { type: 'string', format: 'email', example: 'juan.perez@example.com' },
            phone: { type: 'string', example: '+51 999 999 999' },
          },
        },
        UpdateClienteDto: {
          type: 'object',
          properties: {
            fullName: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
          },
        },
        CreateProductoDto: {
          type: 'object',
          required: ['name', 'price'],
          properties: {
            name: { type: 'string', example: 'Teclado mecánico' },
            description: { type: 'string', example: 'Teclado mecánico switch rojo' },
            price: { type: 'number', example: 199.9 },
            stock: { type: 'integer', example: 25 },
          },
        },
        UpdateProductoDto: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            description: { type: 'string' },
          },
        },
        UpdatePrecioStockDto: {
          type: 'object',
          properties: {
            price: { type: 'number', example: 179.9 },
            stock: { type: 'integer', example: 40 },
          },
        },
        CreatePedidoDto: {
          type: 'object',
          required: ['customerId', 'items'],
          properties: {
            customerId: { type: 'string', format: 'uuid' },
            items: {
              type: 'array',
              minItems: 1,
              items: {
                type: 'object',
                required: ['productId', 'quantity'],
                properties: {
                  productId: { type: 'string', format: 'uuid' },
                  quantity: { type: 'integer', example: 2 },
                },
              },
            },
          },
        },
        ChangeStatusDto: {
          type: 'object',
          required: ['status'],
          properties: {
            status: {
              type: 'string',
              enum: ['PENDING', 'CONFIRMED', 'DELIVERED', 'CANCELLED'],
            },
          },
        },
      },
    },
  },
  apis: [path.join(__dirname, '..', 'modules', '**', '*.routes.{ts,js}')],
};

export const swaggerSpec = swaggerJSDoc(options);
