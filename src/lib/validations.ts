import { z } from 'zod';

// Public Booking Schema
export const createPublicAppointmentSchema = z.object({
    tenant_id: z.string().uuid("ID de estabelecimento inválido"),
    attendant_id: z.string().uuid("ID de profissional inválido"),
    service_id: z.string().uuid("ID de serviço inválido"),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data em formato inválido"),
    time: z.string().regex(/^\d{2}:\d{2}$/, "Hora em formato inválido"),
    client_name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres").max(100, "O nome é muito longo"),
    client_phone: z.string().min(10, "Telefone muito curto").max(20, "Telefone muito longo"),
    client_email: z.union([z.literal(""), z.string().email("E-mail inválido").max(100)]),
});

// Admin: Services
export const serviceSchema = z.object({
    name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres").max(100, "O nome é muito longo"),
    description: z.string().max(500, "A descrição é muito longa").optional(),
    duration: z.number().int().positive("A duração deve ser um número positivo"),
    price: z.number().nonnegative("O preço não pode ser negativo"),
    attendant_ids: z.array(z.string().uuid()).optional().default([]),
});

export const serviceUpdateSchema = serviceSchema.extend({
    id: z.string().uuid("ID de serviço inválido"),
});

// Admin: Team (Attendants)
export const attendantSchema = z.object({
    name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres").max(100),
    email: z.union([z.literal(""), z.string().email("E-mail inválido").max(100)]),
    phone: z.union([z.literal(""), z.string().max(20, "Telefone longo demais")]),
});

export const attendantUpdateSchema = attendantSchema.extend({
    id: z.string().uuid("ID de profissional inválido"),
});

// Admin: Settings
export const whatsappSettingsSchema = z.object({
    apiUrl: z.union([z.literal(""), z.string().url("URL da API inválida").max(255)]),
    instanceName: z.string().max(100).optional(),
    apiKey: z.string().max(255).optional(),
    enabled: z.boolean(),
});

export const businessHourSchema = z.object({
    day_of_week: z.number().int().min(0).max(6),
    open_time: z.string().regex(/^\d{2}:\d{2}$/, "Formato inválido"),
    close_time: z.string().regex(/^\d{2}:\d{2}$/, "Formato inválido"),
    is_closed: z.boolean(),
});

export const businessHoursArraySchema = z.array(businessHourSchema);

export const establishmentProfileSchema = z.object({
    name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres").max(100),
});

export const establishmentSlugSchema = z.object({
    slug: z.string().min(3, "O link deve ter no mínimo 3 caracteres").max(50, "O link deve ter no máximo 50 caracteres").regex(/^[a-z0-9-]+$/, "O link deve conter apenas letras minúsculas, números e hífens."),
});
