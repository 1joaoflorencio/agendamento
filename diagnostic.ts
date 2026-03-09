import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
    const appointments = await prisma.appointment.findMany({
        include: { attendant: true },
        orderBy: { created_at: 'desc' },
        take: 5
    });
    console.log(JSON.stringify(appointments, null, 2));
}

run().finally(() => prisma.$disconnect());
