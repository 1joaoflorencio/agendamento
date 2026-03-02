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
        <div className="min-h-screen bg-muted/20 py-12 px-4 sm:px-6">
            <div className="max-w-3xl mx-auto space-y-6 text-center">
                <h1 className="text-4xl font-extrabold tracking-tight text-primary">
                    {establishment.name}
                </h1>
                <p className="text-muted-foreground text-lg uppercase tracking-widest">
                    {establishment.niche}
                </p>
            </div>

            <div className="mt-8">
                <BookingForm establishment={establishment} />
            </div>
        </div>
    )
}
