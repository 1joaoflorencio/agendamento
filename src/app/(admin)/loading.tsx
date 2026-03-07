import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-48 sm:w-64 rounded-xl" />
                    <Skeleton className="h-4 w-64 sm:w-96 rounded-lg" />
                </div>
                <Skeleton className="h-12 w-full sm:w-40 rounded-full" />
            </div>

            <div className="mb-4">
                <Skeleton className="h-12 w-full max-w-sm rounded-[1rem]" />
            </div>

            <div className="hidden sm:grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="rounded-[2.5rem] border-none shadow-lg shadow-slate-200/50 bg-white/70 overflow-hidden">
                        <div className="p-8 pb-6 flex flex-col items-center">
                            <Skeleton className="w-24 h-24 rounded-[2.2rem] mb-4" />
                            <Skeleton className="h-6 w-32 rounded-lg mb-2" />
                            <Skeleton className="h-3 w-20 rounded-md" />
                        </div>
                        <div className="px-8 pb-8 space-y-3">
                            <Skeleton className="h-12 w-full rounded-2xl" />
                            <Skeleton className="h-12 w-full rounded-2xl" />
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex flex-col gap-3 sm:hidden mt-6">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl p-4 flex items-center gap-3">
                        <Skeleton className="w-12 h-12 rounded-xl flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-32 rounded-md" />
                            <Skeleton className="h-3 w-24 rounded-md" />
                        </div>
                        <Skeleton className="w-9 h-9 rounded-lg flex-shrink-0" />
                    </div>
                ))}
            </div>
        </div>
    )
}
