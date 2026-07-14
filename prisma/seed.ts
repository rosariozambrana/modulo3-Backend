import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const cliente = await prisma.cliente.upsert({
    where: { email: 'cliente.demo@example.com' },
    update: {},
    create: {
      fullName: 'Cliente Demo',
      email: 'cliente.demo@example.com',
      phone: '+51 999 999 999',
    },
  });

  await prisma.producto.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Producto Demo A',
      description: 'Producto de ejemplo para pruebas',
      price: 25.5,
      stock: 100,
    },
  });

  await prisma.producto.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'Producto Demo B',
      description: 'Segundo producto de ejemplo',
      price: 10,
      stock: 50,
    },
  });

  console.log('Seed completado. Cliente demo:', cliente.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
