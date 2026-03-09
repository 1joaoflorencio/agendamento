import { getAvailableTimeSlots } from './src/app/book/actions';
import prisma from './src/lib/prisma';
import { format, addDays } from 'date-fns';

async function testAvailability() {
    const tenant = await prisma.establishment.findFirst();
    if (!tenant) {
        console.log("No tenant found");
        return;
    }
    const attendant = await prisma.attendant.findFirst({ where: { tenant_id: tenant.id } });
    const service = await prisma.service.findFirst({ where: { tenant_id: tenant.id } });

    if (!attendant || !service) {
        console.log("Missing attendant or service");
        return;
    }

    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const tomorrowStr = format(addDays(new Date(), 1), 'yyyy-MM-dd');

    console.log(`Checking availability for tenant ${tenant.id}, attendant ${attendant.id}, service ${service.id}`);

    console.log(`\n--- TODAY (${todayStr}) ---`);
    const slotsToday = await getAvailableTimeSlots(tenant.id, attendant.id, service.id, todayStr);
    console.log(slotsToday);

    console.log(`\n--- TOMORROW (${tomorrowStr}) ---`);
    const slotsTomorrow = await getAvailableTimeSlots(tenant.id, attendant.id, service.id, tomorrowStr);
    console.log(slotsTomorrow);
}

testAvailability().catch(console.error).finally(() => prisma.$disconnect());
