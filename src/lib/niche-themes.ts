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
        primary: 'indigo-600',
        secondary: 'violet-600',
        accent: 'indigo-500',
        gradient: 'from-indigo-600 to-violet-600',
        shadow: 'shadow-indigo-600/20',
        label: 'Clínica / Saúde',
        bgMuted: 'bg-indigo-50',
        textPrimary: 'text-indigo-600',
        borderMuted: 'border-indigo-100',
        buttonActive: 'bg-indigo-600 text-white',
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
        primary: 'slate-900',
        secondary: 'amber-600',
        accent: 'amber-500',
        gradient: 'from-slate-900 to-slate-700',
        shadow: 'shadow-slate-900/20',
        label: 'Barbearia Clássica',
        bgMuted: 'bg-slate-100',
        textPrimary: 'text-slate-900',
        borderMuted: 'border-slate-200',
        buttonActive: 'bg-slate-900 text-white',
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
        primary: 'rose-500',
        secondary: 'fuchsia-600',
        accent: 'rose-400',
        gradient: 'from-rose-500 to-fuchsia-600',
        shadow: 'shadow-rose-500/20',
        label: 'Estética & Beleza',
        bgMuted: 'bg-rose-50',
        textPrimary: 'text-rose-600',
        borderMuted: 'border-rose-100',
        buttonActive: 'bg-rose-500 text-white',
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
