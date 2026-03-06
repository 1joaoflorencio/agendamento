// ─── Database Model Types ───
// Shared types derived from the Prisma schema for use in client components.
// These replace scattered `any` types across the codebase.

export type Establishment = {
    id: string
    slug: string
    name: string
    niche: string
    status: string
    trial_ends_at: string | Date | null
    created_at: string | Date
    whatsapp_enabled: boolean
    whatsapp_api_url: string | null
    whatsapp_instance_name: string | null
    whatsapp_api_key: string | null
    services: Service[]
    attendants: AttendantWithServices[]
}

export type Service = {
    id: string
    tenant_id: string
    name: string
    description: string | null
    duration_minutes: number
    price: number
}

export type Attendant = {
    id: string
    tenant_id: string
    name: string
    email: string | null
    phone: string | null
}

export type AttendantWithServices = Attendant & {
    services: { service_id: string; attendant_id: string }[]
}

export type Appointment = {
    id: string
    tenant_id: string
    client_name: string
    client_phone: string
    client_email: string | null
    service_id: string
    attendant_id: string
    date_time: Date | string
    status: AppointmentStatus
    created_at: string
    service: Pick<Service, 'name' | 'price' | 'duration_minutes'>
    attendant: Pick<Attendant, 'name' | 'id'>
}

export type AppointmentStatus = 'SCHEDULED' | 'CANCELED' | 'COMPLETED'

export type TimeSlot = {
    time: string
    available: boolean
}

// ─── Theme Types ───

export type NicheTheme = {
    textPrimary: string
    bgMuted: string
    gradient: string
    shadow: string
}

// ─── Component Prop Types ───

export type BookingFormProps = {
    establishment: Establishment
}
