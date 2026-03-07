"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      richColors
      expand={false}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-slate-950 group-[.toaster]:border-slate-100 group-[.toaster]:shadow-2xl shadow-indigo-500/10 rounded-2xl font-bold sm:p-5 sm:text-base border-2 h-auto",
          description: "group-[.toast]:text-slate-500 text-sm font-medium",
          actionButton:
            "group-[.toast]:bg-slate-900 group-[.toast]:text-slate-50",
          cancelButton:
            "group-[.toast]:bg-slate-100 group-[.toast]:text-slate-500",
          success: "group-[.toaster]:bg-emerald-500 group-[.toaster]:text-white group-[.toaster]:border-emerald-600",
          error: "group-[.toaster]:bg-red-500 group-[.toaster]:text-white group-[.toaster]:border-red-600",
        },
      }}
      icons={{
        success: <CircleCheckIcon className="size-5 mr-1" />,
        info: <InfoIcon className="size-5 mr-1" />,
        warning: <TriangleAlertIcon className="size-5 mr-1" />,
        error: <OctagonXIcon className="size-5 mr-1" />,
        loading: <Loader2Icon className="size-5 mr-1 animate-spin" />,
      }}
      {...props}
    />
  )
}

export { Toaster }
