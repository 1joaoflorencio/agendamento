"use client";

import { useState } from "react";
import DevicePreview from "@/components/DevicePreview";

type PreviewMode = "book" | "admin" | null;

export default function PreviewPage() {
    const [mode, setMode] = useState<PreviewMode>(null);

    // ── Configure aqui ──
    const SLUG = "clinica-estetica-";               // slug do seu estabelecimento
    const BASE = "http://localhost:3000";

    const urls: Record<"book" | "admin", string> = {
        book: `${BASE}/book/${SLUG}`,              // página de agendamento do cliente
        admin: `${BASE}/dashboard`,                // painel administrativo
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 gap-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-black text-white tracking-tight">
                    Modo Apresentação
                </h1>
                <p className="text-sm text-slate-400 font-medium">
                    Visualize o sistema como se estivesse no celular do cliente ou do administrador.
                </p>
            </div>

            <div className="flex gap-4">
                {/* Botão: Visão do Cliente */}
                <button
                    onClick={() => setMode("book")}
                    className="group relative flex flex-col items-center gap-3 rounded-2xl bg-white/5 border border-white/10 px-8 py-6 backdrop-blur-sm transition-all hover:bg-emerald-500/10 hover:border-emerald-400/30 hover:scale-105 active:scale-95"
                >
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 transition-colors group-hover:bg-emerald-500/30">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                    </div>
                    <span className="text-sm font-bold text-white">Visão do Cliente</span>
                    <span className="text-[11px] text-slate-500">Página de Agendamento</span>
                </button>

                {/* Botão: Visão do Admin */}
                <button
                    onClick={() => setMode("admin")}
                    className="group relative flex flex-col items-center gap-3 rounded-2xl bg-white/5 border border-white/10 px-8 py-6 backdrop-blur-sm transition-all hover:bg-blue-500/10 hover:border-blue-400/30 hover:scale-105 active:scale-95"
                >
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 transition-colors group-hover:bg-blue-500/30">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20V10" />
                            <path d="M18 20V4" />
                            <path d="M6 20v-4" />
                        </svg>
                    </div>
                    <span className="text-sm font-bold text-white">Visão do Admin</span>
                    <span className="text-[11px] text-slate-500">Painel Administrativo</span>
                </button>
            </div>

            {mode && (
                <DevicePreview
                    url={urls[mode]}
                    onClose={() => setMode(null)}
                />
            )}
        </div>
    );
}