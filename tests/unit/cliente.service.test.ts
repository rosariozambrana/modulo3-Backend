import { ClienteService } from '../../src/modules/clientes/cliente.service';
import { ClienteRepository } from '../../src/modules/clientes/cliente.repository';
import { AppError } from '../../src/common/errors/AppError';

describe('ClienteService - email duplicado', () => {
  it('lanza AppError 409 si el email ya está registrado', async () => {
    const repository = {
      findByEmail: jest.fn().mockResolvedValue({ id: '1', email: 'test@example.com' }),
      create: jest.fn(),
    } as unknown as ClienteRepository;

    const service = new ClienteService(repository);

    await expect(
      service.create({ fullName: 'Juan Pérez', email: 'test@example.com' }),
    ).rejects.toMatchObject<Partial<AppError>>({ statusCode: 409 });

    expect(repository.create).not.toHaveBeenCalled();
  });

  it('crea el cliente si el email no existe', async () => {
    const repository = {
      findByEmail: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: '1', email: 'nuevo@example.com' }),
    } as unknown as ClienteRepository;

    const service = new ClienteService(repository);
    const result = await service.create({ fullName: 'Ana Ruiz', email: 'nuevo@example.com' });

    expect(repository.create).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ id: '1', email: 'nuevo@example.com' });
  });
});
