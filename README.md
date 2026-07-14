# Backend — Gestión de Clientes, Productos y Pedidos

API REST (solo backend, sin interfaz de usuario) construida con **Node.js + TypeScript + Express + PostgreSQL + Prisma**, siguiendo una arquitectura en capas (`Controller → Service → Repository`), validación de DTOs con **Zod**, manejo centralizado de errores y documentación **Swagger/OpenAPI**.

## Stack

- Node.js + TypeScript
- Express.js
- PostgreSQL
- Prisma ORM (migraciones + tipado)
- Zod (validación de DTOs)
- Swagger (swagger-jsdoc + swagger-ui-express)
- Jest + Supertest (tests)

## Estructura del proyecto

```
back/
├── prisma/
│   ├── schema.prisma        # Modelos: Cliente, Producto, Pedido, OrderItem
│   ├── seed.ts               # Datos de ejemplo
│   └── migrations/           # Migraciones generadas por Prisma
├── src/
│   ├── app.ts                 # Configuración de Express (middlewares, rutas, swagger)
│   ├── server.ts               # Arranque del servidor HTTP
│   ├── config/
│   │   ├── env.ts              # Variables de entorno
│   │   ├── prisma.ts           # Cliente Prisma singleton
│   │   └── swagger.ts          # Configuración OpenAPI
│   ├── common/
│   │   ├── errors/AppError.ts         # Clase de error con código HTTP
│   │   ├── middlewares/errorHandler.ts # Middleware centralizado de errores
│   │   ├── middlewares/validate.ts     # Middleware de validación con Zod
│   │   └── utils/                      # asyncHandler, paginación
│   └── modules/
│       ├── clientes/    # Controller, Service, Repository, DTOs
│       ├── productos/   # Controller, Service, Repository, DTOs
│       └── pedidos/     # Controller, Service, Repository, DTOs (transaccional)
└── tests/unit/           # Tests de reglas de negocio críticas
```

## Requisitos previos

- Node.js 18 o superior
- PostgreSQL 13 o superior (local o remoto)
- npm

## Instalación

```bash
npm install
```

## Configuración

1. Copia el archivo de variables de entorno de ejemplo:

   ```bash
   cp .env.example .env
   ```

2. Edita `.env` y ajusta `DATABASE_URL` con tus credenciales de PostgreSQL:

   ```
   DATABASE_URL="postgresql://usuario:password@localhost:5432/gestion_pedidos?schema=public"
   ```

## Migraciones de base de datos

Generar el cliente de Prisma y aplicar las migraciones:

```bash
npm run prisma:generate
npm run prisma:migrate
```

Esto crea las tablas `clientes`, `productos`, `pedidos` y `order_items` en PostgreSQL.

### Datos de ejemplo (opcional)

```bash
npm run prisma:seed
```

## Ejecución

### Modo desarrollo (hot reload)

```bash
npm run dev
```

### Compilar y ejecutar en producción

```bash
npm run build
npm start
```

El servidor arranca por defecto en `http://localhost:3000`.

## Documentación de la API (Swagger)

Con el servidor corriendo, la documentación interactiva está disponible en:

```
http://localhost:3000/api/docs
```

## Endpoints principales

### Clientes (`/api/clientes`)

| Método | Ruta                        | Descripción                     |
|--------|-----------------------------|----------------------------------|
| POST   | `/api/clientes`              | Registrar cliente                |
| GET    | `/api/clientes`              | Listar clientes (paginado)       |
| GET    | `/api/clientes/:id`          | Consultar cliente por ID         |
| PUT    | `/api/clientes/:id`          | Actualizar datos del cliente     |
| PATCH  | `/api/clientes/:id/deactivate` | Baja lógica del cliente        |

### Productos (`/api/productos`)

| Método | Ruta                              | Descripción                    |
|--------|------------------------------------|----------------------------------|
| POST   | `/api/productos`                    | Registrar producto              |
| GET    | `/api/productos`                    | Listar productos (paginado)     |
| GET    | `/api/productos/:id`                | Consultar producto por ID       |
| PUT    | `/api/productos/:id`                | Actualizar nombre/descripción    |
| PATCH  | `/api/productos/:id/precio-stock`   | Actualizar precio y/o stock      |
| PATCH  | `/api/productos/:id/deactivate`     | Baja lógica del producto         |

### Pedidos (`/api/pedidos`)

| Método | Ruta                       | Descripción                                              |
|--------|-----------------------------|------------------------------------------------------------|
| POST   | `/api/pedidos`               | Crear pedido (total calculado automáticamente, transaccional) |
| GET    | `/api/pedidos`               | Listar pedidos (filtros: status, customerId)               |
| GET    | `/api/pedidos/:id`           | Consultar pedido por ID                                     |
| PATCH  | `/api/pedidos/:id/status`    | Cambiar estado (descuenta o restituye stock según reglas)    |

## Reglas de negocio implementadas

**Clientes**
- Email único (409 si está duplicado).
- `FullName` obligatorio, `Phone` opcional.
- No hay borrado físico, solo baja lógica (`isActive`).

**Productos**
- `Price` debe ser mayor que 0.
- `Stock` no puede ser negativo.
- `Name` obligatorio.
- No hay borrado físico, solo baja lógica (`isActive`).

**Pedidos**
- El cliente debe existir y estar activo, si no: 404/409.
- El pedido requiere al menos 1 producto.
- La cantidad de cada ítem debe ser mayor que 0.
- Se valida stock suficiente por producto antes de crear el pedido (409 si no alcanza).
- El total se calcula en el backend como suma de subtotales (`unitPrice * quantity`); nunca se recibe del cliente.
- Toda la creación del pedido corre dentro de una **transacción de Prisma** (`$transaction`), garantizando atomicidad entre validación de stock y creación de registros.
- Al **confirmar** (`PENDING → CONFIRMED`) se descuenta el stock de cada producto.
- Al **cancelar un pedido ya confirmado** (`CONFIRMED → CANCELLED`) se restituye el stock.
- Transiciones de estado válidas:
  - `PENDING → CONFIRMED | CANCELLED`
  - `CONFIRMED → DELIVERED | CANCELLED`
  - `DELIVERED` y `CANCELLED` son estados finales.

## Manejo de errores

Middleware centralizado (`src/common/middlewares/errorHandler.ts`) que traduce:

- Errores de validación de Zod → **400**
- `AppError.notFound` → **404**
- `AppError.conflict` (email duplicado, stock insuficiente, transición inválida) → **409**
- Errores conocidos de Prisma (`P2002` duplicado, `P2025` no encontrado) como respaldo → **409/404**
- Cualquier otro error no controlado → **500**

## Tests

Tests unitarios de las reglas de negocio críticas (mockeando los repositorios, sin necesidad de base de datos):

- Rechazo por email de cliente duplicado.
- Rechazo por stock insuficiente al crear un pedido.
- Cálculo automático del total como suma de subtotales.
- Descuento de stock al confirmar un pedido.
- Restitución de stock al cancelar un pedido confirmado.
- Rechazo de transiciones de estado no permitidas.

Ejecutar:

```bash
npm test
```

## Notas de diseño

- Se usó **Prisma** por su tipado fuerte end-to-end y su sistema de migraciones declarativo.
- Se usó **Zod** para validar los DTOs de entrada (en vez de `class-validator`) por ser más ligero en un proyecto Express sin decoradores, integrándose directamente como middleware (`validate`).
- El `unitPrice` se guarda como **snapshot** en `OrderItem` en el momento de creación del pedido, de modo que cambios posteriores en el precio del producto no alteran pedidos ya creados.
