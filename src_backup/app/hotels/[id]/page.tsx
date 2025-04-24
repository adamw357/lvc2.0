import { notFound } from 'next/navigation'
import { Hotel } from '@/services/hotelService'
import { HotelDetails } from '@/components/HotelDetails'

async function getHotelDetails(id: string): Promise<Hotel> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hotels/${id}`, {
    cache: 'no-store'
  })
  
  if (!response.ok) {
    if (response.status === 404) {
      notFound()
    }
    throw new Error('Failed to fetch hotel details')
  }
  
  return response.json()
}

export default async function HotelPage({ params }: { params: { id: string } }) {
  const hotel = await getHotelDetails(params.id)

  return (
    <main className="container mx-auto px-4 py-8">
      <HotelDetails hotel={hotel} />
    </main>
  )
} 