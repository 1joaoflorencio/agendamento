import { getEstablishmentForBooking } from "../actions"
import BookingForm from "./BookingForm"
import { notFound } from "next/navigation"

export default async function BookingPage({ params }: { params: { slug: string } }) {
    // O Next.js 15 Server Components passa as params via Promise if async
    const { slug } = await params

    let establishment;
    try {
        establishment = await getEstablishmentForBooking(slug)
    } catch (error) {
        return notFound()
    }

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden">
            {/* Background Decorativo e Elegante */}
            <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3">
                <div className="w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
            </div>
            <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/4">
                <div className="w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-3xl opacity-50" />
            </div>

            <div className="relative z-10 w-full min-h-screen flex items-start justify-center pt-10 pb-6 px-4">

                <div className="w-full max-w-2xl">
                    <BookingForm establishment={establishment} />
                </div>
            </div>
        </div>
    )
}
