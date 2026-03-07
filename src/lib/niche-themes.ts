export type NicheType = 'Barbearia' | 'Clinica' | 'Salao de Beleza'

export interface NichePlaceholders {
    serviceName: string
    serviceDescription: string
    serviceDuration: string
    servicePrice: string
    professionalName: string
    professionalEmail: string
    professionalPhone: string
}

export interface NicheTheme {
    primary: string
    secondary: string
    accent: string
    gradient: string
    shadow: string
    label: string
    // Full classes to avoid dynamic string interpolation issues with Tailwind
    bgMuted: string
    textPrimary: string
    borderMuted: string
    buttonActive: string
    placeholders: NichePlaceholders
}

export const NICHE_THEMES: Record<string, NicheTheme> = {
    'Clinica': {
        primary: 'blue-600',
        secondary: 'indigo-600',
        accent: 'blue-500',
        gradient: 'from-blue-600 to-indigo-600',
        shadow: 'shadow-blue-600/20',
        label: 'Clínica / Saúde',
        bgMuted: 'bg-blue-50/80',
        textPrimary: 'text-blue-600',
        borderMuted: 'border-blue-100',
        buttonActive: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200',
        placeholders: {
            serviceName: 'Ex: Consulta Dermatológica',
            serviceDescription: 'Ex: Avaliação completa da pele',
            serviceDuration: '30',
            servicePrice: '150.00',
            professionalName: 'Ex: Dra. Maria Silva',
            professionalEmail: 'dra.maria@clinica.com',
            professionalPhone: '(11) 99999-9999'
        }
    },
    'Barbearia': {
        primary: 'zinc-900',
        secondary: 'orange-600',
        accent: 'zinc-800',
        gradient: 'from-zinc-900 to-zinc-700',
        shadow: 'shadow-zinc-900/20',
        label: 'Barbearia Clássica',
        bgMuted: 'bg-zinc-100/80',
        textPrimary: 'text-zinc-900',
        borderMuted: 'border-zinc-200',
        buttonActive: 'bg-zinc-900 hover:bg-black text-white shadow-lg shadow-zinc-200',
        placeholders: {
            serviceName: 'Ex: Corte Moderno + Barba',
            serviceDescription: 'Ex: Combo completo com toalha quente',
            serviceDuration: '45',
            servicePrice: '60.00',
            professionalName: 'Ex: João Barbeiro',
            professionalEmail: 'joao@barbearia.com',
            professionalPhone: '(11) 99999-9999'
        }
    },
    'Salao de Beleza': {
        primary: 'pink-600',
        secondary: 'rose-500',
        accent: 'pink-500',
        gradient: 'from-pink-600 to-rose-500',
        shadow: 'shadow-pink-600/20',
        label: 'Estética & Beleza',
        bgMuted: 'bg-pink-50/80',
        textPrimary: 'text-pink-600',
        borderMuted: 'border-pink-100',
        buttonActive: 'bg-pink-600 hover:bg-pink-700 text-white shadow-lg shadow-pink-200',
        placeholders: {
            serviceName: 'Ex: Escova Progressiva',
            serviceDescription: 'Ex: Alisamento com hidratação profunda',
            serviceDuration: '120',
            servicePrice: '200.00',
            professionalName: 'Ex: Ana Estilista',
            professionalEmail: 'ana@salao.com',
            professionalPhone: '(11) 99999-9999'
        }
    }
}

export function getTheme(niche?: string): NicheTheme {
    if (!niche || !NICHE_THEMES[niche]) {
        return NICHE_THEMES['Clinica']
    }
    return NICHE_THEMES[niche]
}
