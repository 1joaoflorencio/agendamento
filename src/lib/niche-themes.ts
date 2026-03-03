export type NicheType = 'Barbearia' | 'Clinica' | 'Salao de Beleza'

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
        buttonActive: 'bg-indigo-600 text-white'
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
        buttonActive: 'bg-slate-900 text-white'
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
        buttonActive: 'bg-rose-500 text-white'
    }
}

export function getTheme(niche?: string): NicheTheme {
    if (!niche || !NICHE_THEMES[niche]) {
        return NICHE_THEMES['Clinica']
    }
    return NICHE_THEMES[niche]
}
