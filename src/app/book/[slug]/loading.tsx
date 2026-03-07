import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50/50 via-white to-white pt-10 pb-12 px-4 flex flex-col items-center">

            <div className="flex flex-col items-center w-full max-w-md space-y-3 mb-8">
                <Skeleton className="h-12 w-64 rounded-2xl" />
                <Skeleton className="h-4 w-72 rounded-lg" />
            </div>

            <Skeleton className="h-14 w-full max-w-md rounded-[1.5rem] mb-6" />

            <div className="w-full max-w-2xl space-y-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="p-4 bg-white/50 backdrop-blur-sm border-2 border-slate-100 rounded-[1rem] flex items-center justify-between">
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-5 w-48 rounded-md" />
                            <Skeleton className="h-3 w-full max-w-[200px] rounded-md" />
                        </div>
                        <Skeleton className="w-8 h-8 rounded-full ml-4 flex-shrink-0" />
                    </div>
                ))}
            </div>
        </div>
    )
}
