import prisma from './src/lib/prisma'

async function run() {
    const establishmentId = "some-tenant-id"
    console.log("Fetching attendants...")
    const attendants = await prisma.attendant.findMany({
        where: { tenant_id: establishmentId },
        orderBy: { name: 'asc' },
        select: { id: true, name: true }
    })
    console.log("Attendants:", attendants)

    const now = new Date()
    const startDate = new Date(now)
    startDate.setDate(now.getDate() - 7)
    startDate.setHours(0, 0, 0, 0)
    const endDate = new Date(now)
    endDate.setDate(now.getDate() + 15)
    endDate.setHours(23, 59, 59, 999)

    console.log("Fetching appointments...")
    const appointments = await prisma.appointment.findMany({
        where: {
            tenant_id: establishmentId,
            date_time: { gte: startDate, lte: endDate }
        },
        include: {
            service: true,
            attendant: true
        },
        orderBy: {
            date_time: 'asc'
        }
    })
    console.log("Appointments:", appointments.length)
}

run().catch(console.error).finally(() => prisma.$disconnect())
