import { getAvailableTimeSlots } from './src/app/book/actions';
import prisma from './src/lib/prisma';
import { format, addDays } from 'date-fns';

async function testAllDays() {
    const tenant = await prisma.establishment.findFirst();
    const attendant = await prisma.attendant.findFirst({ where: { tenant_id: tenant!.id }});
    const service = await prisma.service.findFirst({ where: { tenant_id: tenant!.id }});

    for(let i=0; i<7; i++) {
        const d = addDays(new Date(), i);
        const dayStr = format(d, 'yyyy-MM-dd');
        const slots = await getAvailableTimeSlots(tenant!.id, attendant!.id, service!.id, dayStr);
        console.log(`${dayStr}: ${slots.length} available slots`);
    }
}
testAllDays().catch(console.error).finally(() => prisma.$disconnect());
