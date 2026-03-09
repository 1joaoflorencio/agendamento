import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.attendant.findMany().then(r => console.log(r)).finally(() => prisma.$disconnect());
