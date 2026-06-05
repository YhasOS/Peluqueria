import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.bookingBlock.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.servicePhase.deleteMany({});
  await prisma.service.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.professional.deleteMany({});
  await prisma.resource.deleteMany({});

  // Categories
  const hair = await prisma.category.create({
    data: {
      name: 'Peluquería',
      description: 'Servicios de corte, peinado y coloración',
    },
  });
  const nails = await prisma.category.create({
    data: {
      name: 'Manicura y Pedicura',
      description: 'Cuidado de manos y pies',
    },
  });
  const facial = await prisma.category.create({
    data: {
      name: 'Estética Facial',
      description: 'Tratamientos faciales y maquillaje',
    },
  });

  // Services with phases
  const corteCorte = await prisma.service.create({
    data: {
      name: 'Corte de pelo clásico',
      description: 'Corte de pelo personalizado según tus gustos',
      price: 25.0,
      totalDuration: 45,
      exclusive: true,
      preparationTime: 5,
      categoryId: hair.id,
      phases: {
        create: [
          { order: 1, name: 'Consulta y preparación', duration: 10, exclusive: true },
          { order: 2, name: 'Corte y estilizado', duration: 30, exclusive: true },
          { order: 3, name: 'Limpieza y acabado', duration: 5, exclusive: true },
        ],
      },
    },
  });

  const coloracion = await prisma.service.create({
    data: {
      name: 'Coloración completa',
      description: 'Aplicación de color en todo el cabello',
      price: 60.0,
      totalDuration: 120,
      exclusive: false,
      preparationTime: 10,
      categoryId: hair.id,
      phases: {
        create: [
          { order: 1, name: 'Consulta y mezcla de color', duration: 15, exclusive: true },
          { order: 2, name: 'Aplicación del color', duration: 20, exclusive: true },
          { order: 3, name: 'Tiempo de exposición', duration: 45, exclusive: false },
          { order: 4, name: 'Lavado y acabado', duration: 30, exclusive: true },
        ],
      },
    },
  });

  const manicuraBasica = await prisma.service.create({
    data: {
      name: 'Manicura básica',
      description: 'Limpieza, limado y esmaltado de uñas',
      price: 20.0,
      totalDuration: 60,
      exclusive: true,
      preparationTime: 5,
      categoryId: nails.id,
      phases: {
        create: [
          { order: 1, name: 'Preparación y limpieza', duration: 10, exclusive: true },
          { order: 2, name: 'Corte y limado', duration: 20, exclusive: true },
          { order: 3, name: 'Esmaltado', duration: 30, exclusive: true },
        ],
      },
    },
  });

  const limpiezaFacial = await prisma.service.create({
    data: {
      name: 'Limpieza facial profunda',
      description: 'Limpieza y tratamiento de la piel',
      price: 35.0,
      totalDuration: 75,
      exclusive: false,
      preparationTime: 5,
      categoryId: facial.id,
      phases: {
        create: [
          { order: 1, name: 'Diagnóstico y preparación', duration: 10, exclusive: true },
          { order: 2, name: 'Limpieza y exfoliación', duration: 25, exclusive: true },
          { order: 3, name: 'Mascarilla y reposo', duration: 25, exclusive: false },
          { order: 4, name: 'Hidratación y masaje', duration: 15, exclusive: true },
        ],
      },
    },
  });

  // Professionals
  const pro1 = await prisma.professional.create({
    data: {
      name: 'Laura',
      bio: 'Especialista en corte y color',
      specialties: ['Peluquería'],
    },
  });
  const pro2 = await prisma.professional.create({
    data: {
      name: 'Marta',
      bio: 'Manicura y tratamientos faciales',
      specialties: ['Manicura y Pedicura', 'Estética Facial'],
    },
  });

  // Resources
  const chair1 = await prisma.resource.create({ data: { name: 'Sillón 1', description: 'Sillón de peluquería principal' } });
  const chair2 = await prisma.resource.create({ data: { name: 'Sillón 2', description: 'Segundo sillón de peluquería' } });
  const nailsStation = await prisma.resource.create({ data: { name: 'Mesa de manicura', description: 'Mesa equipada para manicura' } });
  const facialRoom = await prisma.resource.create({ data: { name: 'Cabina estética', description: 'Sala privada para tratamientos faciales' } });

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });