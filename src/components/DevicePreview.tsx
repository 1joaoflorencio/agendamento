"use client";

import { useEffect, useRef } from "react";
import {
    X,
    ChevronLeft,
    ChevronRight,
    Share,
    BookOpen,
    Layers,
} from "lucide-react";

interface DevicePreviewProps {
    /** URL to render inside the device iframe */
    url: string;
    /** Called when the user clicks the close button */
    onClose?: () => void;
}

/**
 * iPhone 17 Pro Max mockup
 * ─ 6.9" display, 2868 × 1320 px, aspect ratio ~2.17:1
 * ─ Scaled to 430 × 932 logical pts (same ratio)
 * ─ Slim Dynamic Island, aluminum chassis
 * ─ iOS 26 Safari with bottom address bar
 */
export default function DevicePreview({ url, onClose }: DevicePreviewProps) {
    const backdropRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose?.();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose]);

    /* inject scrollbar-hide CSS */
    useEffect(() => {
        const style = document.createElement("style");
        style.textContent = `
            .dp-iframe::-webkit-scrollbar { display: none; }
            .dp-iframe { scrollbar-width: none; -ms-overflow-style: none; }
        `;
        document.head.appendChild(style);
        return () => { document.head.removeChild(style); };
    }, []);

    /* touch cursor refs (direct DOM = zero re-renders) */
    const screenRef = useRef<HTMLDivElement>(null);
    const touchRef = useRef<HTMLDivElement>(null);

    const moveTouchTo = (x: number, y: number) => {
        const el = touchRef.current;
        if (!el) return;
        el.style.transform = `translate(${x - 16}px, ${y - 16}px)`;
        el.style.opacity = "1";
    };
    const hideTouchCursor = () => {
        const el = touchRef.current;
        if (el) el.style.opacity = "0";
    };

    const displayUrl = (() => {
        try {
            const u = new URL(url);
            return u.hostname + (u.pathname === "/" ? "" : u.pathname);
        } catch {
            return url;
        }
    })();

    const sf = '-apple-system, "SF Pro Text", "SF Pro Display", system-ui, sans-serif';

    return (
        <div
            ref={backdropRef}
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            style={{ background: "radial-gradient(ellipse at center, rgba(15,15,20,.92) 0%, rgba(0,0,0,.97) 100%)" }}
            onClick={(e) => { if (e.target === backdropRef.current) onClose?.(); }}
        >
            {/* ── Close button ── */}
            <button
                onClick={onClose}
                aria-label="Fechar"
                className="
          absolute top-5 left-5 z-50
          flex h-10 w-10 items-center justify-center
          rounded-full text-white/80
          bg-white/10 backdrop-blur-md border border-white/10
          transition-all duration-200
          hover:scale-110 hover:bg-red-500/80 hover:text-white hover:border-red-400/40
          active:scale-95 cursor-pointer
        "
            >
                <X size={18} strokeWidth={2.5} />
            </button>

            {/* ═════════════════ iPhone 17 Pro Max ═════════════════ */}
            <div className="flex flex-col items-center gap-3">
                {/* ── Device label (above phone) ── */}
                <span className="text-[11px] font-medium tracking-widest uppercase text-white/35" style={{ fontFamily: sf }}>
                    iPhone 17 Pro Max · iOS 26.3.1
                </span>

                <div className="relative" style={{ width: 430, height: 932 }}>

                    {/* ── Outer chassis (aluminum) ── */}
                    <div
                        className="absolute inset-0 rounded-[58px]"
                        style={{
                            background: "linear-gradient(160deg, #e8935a 0%, #d4783e 25%, #c06628 50%, #a8531a 75%, #8c4010 100%)",
                            boxShadow: `
              0 0 0 0.5px rgba(255,180,120,.25),
              inset 0 1px 0 rgba(255,220,180,.3),
              0 30px 100px rgba(0,0,0,.7),
              0 8px 30px rgba(0,0,0,.5),
              0 0 120px rgba(200,130,60,.15)
            `,
                        }}
                    />

                    {/* ── Side buttons ── */}
                    {/* Action button (left) */}
                    <div className="absolute -left-[2.5px] top-[155px] w-[3px] h-[32px] rounded-l-sm" style={{ background: "linear-gradient(180deg, #d8884a, #a85520)" }} />
                    {/* Volume Up */}
                    <div className="absolute -left-[2.5px] top-[215px] w-[3px] h-[58px] rounded-l-sm" style={{ background: "linear-gradient(180deg, #d8884a, #a85520)" }} />
                    {/* Volume Down */}
                    <div className="absolute -left-[2.5px] top-[288px] w-[3px] h-[58px] rounded-l-sm" style={{ background: "linear-gradient(180deg, #d8884a, #a85520)" }} />
                    {/* Power (right) */}
                    <div className="absolute -right-[2.5px] top-[245px] w-[3px] h-[85px] rounded-r-sm" style={{ background: "linear-gradient(180deg, #d8884a, #a85520)" }} />

                    {/* ── Black bezel layer ── */}
                    <div className="absolute inset-[2.5px] rounded-[55.5px] bg-black" />

                    {/* ══════════ Screen ══════════ */}
                    <div
                        className="absolute inset-[4px] rounded-[54px] overflow-hidden flex flex-col"
                        style={{ background: "#f2f2f7" }}
                    >
                        {/* ─── Status Bar ─── */}
                        <div className="relative flex items-center justify-between h-[54px] px-9 bg-white/0">

                            {/* Left: Time */}
                            <span className="text-[16px] font-semibold text-black tracking-[-0.2px]" style={{ fontFamily: sf }}>
                                20:46
                            </span>

                            {/* Center: Dynamic Island (smaller on 17 Pro Max) */}
                            <div className="absolute left-1/2 top-[11px] -translate-x-1/2">
                                <div className="relative">
                                    <div
                                        className="h-[32px] w-[108px] rounded-full bg-black"
                                        style={{ boxShadow: "0 0 0 0.5px rgba(40,40,40,.4)" }}
                                    >
                                        {/* Front camera */}
                                        <div className="absolute right-[16px] top-1/2 -translate-y-1/2 h-[10px] w-[10px] rounded-full bg-[#111118] ring-[1.5px] ring-[#222230]">
                                            <div className="absolute top-[1.5px] left-[2px] h-[2.5px] w-[2.5px] rounded-full bg-[#3a3a60]/30" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Signal + WiFi + Battery */}
                            <div className="flex items-center gap-[6px]">
                                {/* Cellular 5G */}
                                <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
                                    <rect x="0" y="9" width="2.5" height="3" rx="0.6" fill="black" />
                                    <rect x="4" y="6.5" width="2.5" height="5.5" rx="0.6" fill="black" />
                                    <rect x="8" y="4" width="2.5" height="8" rx="0.6" fill="black" />
                                    <rect x="12" y="1.5" width="2.5" height="10.5" rx="0.6" fill="black" />
                                </svg>

                                {/* WiFi 7 */}
                                <svg width="16" height="13" viewBox="0 0 16 13" fill="none">
                                    <path d="M0.8 3.8C4.2 0.4 11.8 0.4 15.2 3.8" stroke="black" strokeWidth="1.6" strokeLinecap="round" />
                                    <path d="M3.6 6.8C5.6 4.8 10.4 4.8 12.4 6.8" stroke="black" strokeWidth="1.6" strokeLinecap="round" />
                                    <path d="M6.2 9.6C7 8.8 9 8.8 9.8 9.6" stroke="black" strokeWidth="1.6" strokeLinecap="round" />
                                    <circle cx="8" cy="12" r="1" fill="black" />
                                </svg>

                                {/* Battery */}
                                <svg width="28" height="13" viewBox="0 0 28 13" fill="none">
                                    <rect x="0.5" y="0.5" width="23" height="12" rx="3.8" stroke="black" strokeWidth="1" />
                                    <rect x="2.5" y="2.5" width="19" height="8" rx="2" fill="#34c759" />
                                    <path d="M25 4.5C26 5 26 8 25 8.5" stroke="black" strokeWidth="1" strokeLinecap="round" />
                                </svg>
                            </div>
                        </div>

                        {/* ─── Page content (iframe) + touch cursor overlay ─── */}
                        <div
                            ref={screenRef}
                            className="dp-screen relative flex-1 overflow-hidden bg-white"
                            style={{ cursor: "none" }}
                            onMouseMove={(e) => {
                                const rect = screenRef.current?.getBoundingClientRect();
                                if (!rect) return;
                                moveTouchTo(e.clientX - rect.left, e.clientY - rect.top);
                            }}
                            onMouseLeave={hideTouchCursor}
                        >
                            <iframe
                                ref={(el) => {
                                    if (!el) return;
                                    el.onload = () => {
                                        try {
                                            const doc = el.contentDocument;
                                            if (!doc) return;
                                            const s = doc.createElement("style");
                                            s.textContent = "*, *::before, *::after { cursor: none !important; }";
                                            doc.head.appendChild(s);
                                            doc.addEventListener("mousemove", (ev: MouseEvent) => {
                                                const rect = screenRef.current?.getBoundingClientRect();
                                                if (!rect) return;
                                                const iframeRect = el.getBoundingClientRect();
                                                moveTouchTo(
                                                    ev.clientX + (iframeRect.left - rect.left),
                                                    ev.clientY + (iframeRect.top - rect.top),
                                                );
                                            });
                                            doc.addEventListener("mouseleave", hideTouchCursor);
                                        } catch { /* cross-origin fallback */ }
                                    };
                                }}
                                src={url}
                                title="Device preview"
                                className="dp-iframe h-full w-full border-0 bg-white"
                                style={{ touchAction: "manipulation" }}
                                allow="fullscreen"
                            />
                            {/* Touch indicator (always mounted, moved via transform) */}
                            <div
                                ref={touchRef}
                                className="pointer-events-none absolute top-0 left-0 z-50"
                                style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: "50%",
                                    background: "rgba(0,0,0,0.12)",
                                    border: "1.5px solid rgba(0,0,0,0.2)",
                                    boxShadow: "0 0 8px rgba(0,0,0,0.08)",
                                    opacity: 0,
                                    willChange: "transform",
                                    transition: "opacity 0.15s",
                                }}
                            />
                        </div>

                        {/* ─── Safari Bottom Bar (iOS style - address bar at bottom) ─── */}
                        <div
                            className="border-t border-[#d1d1d6]"
                            style={{
                                background: "rgba(249,249,249,.92)",
                                backdropFilter: "saturate(180%) blur(20px)",
                                WebkitBackdropFilter: "saturate(180%) blur(20px)",
                            }}
                        >
                            {/* URL / Address bar */}
                            <div className="px-4 pt-2 pb-1.5">
                                <div
                                    className="flex items-center h-[38px] rounded-[12px] px-3"
                                    style={{ background: "rgba(118,118,128,.12)" }}
                                >
                                    {/* aA icon */}
                                    <span className="text-[14px] font-medium text-[#8e8e93] mr-2 select-none" style={{ fontFamily: sf }}>
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="inline-block">
                                            <text x="0" y="14" fontSize="11" fontWeight="600" fill="#8e8e93" style={{ fontFamily: sf }}>A</text>
                                            <text x="8" y="14" fontSize="8" fontWeight="600" fill="#8e8e93" style={{ fontFamily: sf }}>A</text>
                                        </svg>
                                    </span>

                                    {/* Lock + URL */}
                                    <div className="flex-1 flex items-center justify-center gap-1">
                                        <svg width="9" height="11" viewBox="0 0 9 11" fill="none" className="flex-shrink-0">
                                            <rect x="0.5" y="5" width="8" height="5.5" rx="1.5" fill="#8e8e93" />
                                            <path d="M2.2 5V3.5C2.2 2 3.2 1 4.5 1C5.8 1 6.8 2 6.8 3.5V5" stroke="#8e8e93" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                                        </svg>
                                        <span
                                            className="text-[14px] text-[#1c1c1e] truncate select-none"
                                            style={{ fontFamily: sf }}
                                        >
                                            {displayUrl}
                                        </span>
                                    </div>

                                    {/* Reload */}
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0 ml-2">
                                        <path d="M13 8C13 10.76 10.76 13 8 13C5.24 13 3 10.76 3 8C3 5.24 5.24 3 8 3C9.8 3 11.4 4 12.2 5.5" stroke="#8e8e93" strokeWidth="1.4" strokeLinecap="round" fill="none" />
                                        <path d="M12 2.5V5.5H9" stroke="#8e8e93" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                    </svg>
                                </div>
                            </div>

                            {/* Navigation toolbar */}
                            <div className="flex items-center justify-between px-6 h-[42px]">
                                <button className="flex items-center justify-center w-[40px] h-[40px] text-[#007aff] active:opacity-40 transition-opacity">
                                    <ChevronLeft size={22} strokeWidth={2.2} />
                                </button>
                                <button className="flex items-center justify-center w-[40px] h-[40px] text-[#007aff] active:opacity-40 transition-opacity">
                                    <ChevronRight size={22} strokeWidth={2.2} />
                                </button>
                                <button className="flex items-center justify-center w-[40px] h-[40px] text-[#007aff] active:opacity-40 transition-opacity">
                                    <Share size={19} strokeWidth={1.6} />
                                </button>
                                <button className="flex items-center justify-center w-[40px] h-[40px] text-[#007aff] active:opacity-40 transition-opacity">
                                    <BookOpen size={19} strokeWidth={1.6} />
                                </button>
                                <button className="flex items-center justify-center w-[40px] h-[40px] text-[#007aff] active:opacity-40 transition-opacity">
                                    <Layers size={19} strokeWidth={1.6} />
                                </button>
                            </div>

                            {/* Home indicator */}
                            <div className="flex justify-center pb-2">
                                <div className="h-[5px] w-[134px] rounded-full bg-black/20" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
