import { PrismaClient } from '@prisma/client';
import { addHours } from 'date-fns';

const prisma = new PrismaClient();

async function runTest() {
  const tenantId = await prisma.establishment.findFirst({
    where: { whatsapp_enabled: true }
  });

  if (!tenantId) {
    console.log('No tenant found');
    return;
  }

  const attendant = await prisma.attendant.findFirst({ where: { tenant_id: tenantId.id } });
  const service = await prisma.service.findFirst({ where: { tenant_id: tenantId.id } });

  const appt = await prisma.appointment.create({
    data: {
      tenant_id: tenantId.id,
      client_name: "João (Teste Robô API)",
      client_phone: "556186080866",
      service_id: service!.id,
      attendant_id: attendant!.id,
      date_time: addHours(new Date(), 1), // 1 hour from now
      status: "SCHEDULED",
      reminder_sent: false
    }
  });

  console.log("Mock appointment created!", appt.id);
}

runTest().catch(console.error).finally(() => prisma.$disconnect());
