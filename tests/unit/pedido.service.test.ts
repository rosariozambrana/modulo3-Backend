import { Prisma } from '@prisma/client';
import { PedidoService } from '../../src/modules/pedidos/pedido.service';
import { PedidoRepository } from '../../src/modules/pedidos/pedido.repository';
import { AppError } from '../../src/common/errors/AppError';

function buildRepositoryMock(overrides: Partial<Record<keyof PedidoRepository, unknown>> = {}) {
  const base = {
    runTransaction: jest.fn((fn: (tx: unknown) => Promise<unknown>) => fn({})),
    findClienteById: jest.fn(),
    findProductoByIdForUpdate: jest.fn(),
    decrementStock: jest.fn(),
    incrementStock: jest.fn(),
    createPedido: jest.fn(),
    findById: jest.fn(),
    findByIdTx: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    updateStatus: jest.fn(),
  };
  return { ...base, ...overrides } as unknown as PedidoRepository;
}

describe('PedidoService - creación de pedidos', () => {
  it('rechaza el pedido si el cliente no existe', async () => {
    const repository = buildRepositoryMock({
      findClienteById: jest.fn().mockResolvedValue(null),
    });
    const service = new PedidoService(repository);

    await expect(
      service.create({ customerId: 'cliente-1', items: [{ productId: 'prod-1', quantity: 1 }] }),
    ).rejects.toMatchObject<Partial<AppError>>({ statusCode: 404 });
  });

  it('rechaza el pedido si el cliente está inactivo', async () => {
    const repository = buildRepositoryMock({
      findClienteById: jest.fn().mockResolvedValue({ id: 'cliente-1', isActive: false }),
    });
    const service = new PedidoService(repository);

    await expect(
      service.create({ customerId: 'cliente-1', items: [{ productId: 'prod-1', quantity: 1 }] }),
    ).rejects.toMatchObject<Partial<AppError>>({ statusCode: 409 });
  });

  it('rechaza el pedido si el stock es insuficiente', async () => {
    const repository = buildRepositoryMock({
      findClienteById: jest.fn().mockResolvedValue({ id: 'cliente-1', isActive: true }),
      findProductoByIdForUpdate: jest.fn().mockResolvedValue({
        id: 'prod-1',
        name: 'Producto X',
        isActive: true,
        stock: 2,
        price: new Prisma.Decimal(10),
      }),
    });
    const service = new PedidoService(repository);

    await expect(
      service.create({ customerId: 'cliente-1', items: [{ productId: 'prod-1', quantity: 5 }] }),
    ).rejects.toMatchObject<Partial<AppError>>({ statusCode: 409 });

    expect(repository.createPedido).not.toHaveBeenCalled();
  });

  it('calcula el total automáticamente como suma de subtotales', async () => {
    const repository = buildRepositoryMock({
      findClienteById: jest.fn().mockResolvedValue({ id: 'cliente-1', isActive: true }),
      findProductoByIdForUpdate: jest.fn().mockImplementation((_tx: unknown, productId: string) => {
        const productos: Record<string, unknown> = {
          'prod-1': { id: 'prod-1', name: 'A', isActive: true, stock: 10, price: new Prisma.Decimal(10) },
          'prod-2': { id: 'prod-2', name: 'B', isActive: true, stock: 10, price: new Prisma.Decimal(5) },
        };
        return Promise.resolve(productos[productId]);
      }),
      createPedido: jest.fn().mockImplementation((_tx: unknown, data: { total: Prisma.Decimal }) =>
        Promise.resolve({ id: 'pedido-1', total: data.total }),
      ),
    });
    const service = new PedidoService(repository);

    const pedido = (await service.create({
      customerId: 'cliente-1',
      items: [
        { productId: 'prod-1', quantity: 2 }, // 2 * 10 = 20
        { productId: 'prod-2', quantity: 3 }, // 3 * 5 = 15
      ],
    })) as unknown as { total: Prisma.Decimal };

    expect(pedido.total.toString()).toBe('35');
  });
});

describe('PedidoService - cambio de estado', () => {
  it('descuenta stock al confirmar un pedido pendiente', async () => {
    const items = [{ productId: 'prod-1', quantity: 2 }];
    const repository = buildRepositoryMock({
      findByIdTx: jest.fn().mockResolvedValue({ id: 'pedido-1', status: 'PENDING', items }),
      findProductoByIdForUpdate: jest.fn().mockResolvedValue({ id: 'prod-1', stock: 10 }),
      updateStatus: jest.fn().mockResolvedValue({ id: 'pedido-1', status: 'CONFIRMED' }),
    });
    const service = new PedidoService(repository);

    await service.changeStatus('pedido-1', { status: 'CONFIRMED' });

    expect(repository.decrementStock).toHaveBeenCalledWith(expect.anything(), 'prod-1', 2);
  });

  it('restituye stock al cancelar un pedido confirmado', async () => {
    const items = [{ productId: 'prod-1', quantity: 2 }];
    const repository = buildRepositoryMock({
      findByIdTx: jest.fn().mockResolvedValue({ id: 'pedido-1', status: 'CONFIRMED', items }),
      updateStatus: jest.fn().mockResolvedValue({ id: 'pedido-1', status: 'CANCELLED' }),
    });
    const service = new PedidoService(repository);

    await service.changeStatus('pedido-1', { status: 'CANCELLED' });

    expect(repository.incrementStock).toHaveBeenCalledWith(expect.anything(), 'prod-1', 2);
  });

  it('rechaza transición de estado no permitida', async () => {
    const repository = buildRepositoryMock({
      findByIdTx: jest.fn().mockResolvedValue({ id: 'pedido-1', status: 'DELIVERED', items: [] }),
    });
    const service = new PedidoService(repository);

    await expect(
      service.changeStatus('pedido-1', { status: 'CANCELLED' }),
    ).rejects.toMatchObject<Partial<AppError>>({ statusCode: 409 });
  });
});
