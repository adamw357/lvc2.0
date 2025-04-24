import Navigation from '@/components/Navigation'
import BookingWidget from '@/components/BookingWidget'
import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <>
      <Navigation />
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-[#0071bc] to-[#002855] text-white py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl font-bold mb-6">
                Save Up to 30% on Your Dream Vacations
              </h1>
              <p className="text-xl mb-12">
                Access exclusive wholesale travel rates and unlock incredible savings compared to traditional booking sites.
              </p>
              <BookingWidget />
            </div>
          </div>
        </section>

        {/* Value Propositions */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6 rounded-lg shadow-lg">
                <h3 className="text-2xl font-semibold mb-4 text-[#002855]">Wholesale Rates</h3>
                <p className="text-gray-600">Save up to 30% compared to Expedia and Booking.com</p>
              </div>
              <div className="text-center p-6 rounded-lg shadow-lg">
                <h3 className="text-2xl font-semibold mb-4 text-[#002855]">RCI Inventory</h3>
                <p className="text-gray-600">Access to 67,000 week combinations with up to 60% savings</p>
              </div>
              <div className="text-center p-6 rounded-lg shadow-lg">
                <h3 className="text-2xl font-semibold mb-4 text-[#002855]">Cancun Special</h3>
                <p className="text-gray-600">$498 all-inclusive package with property tour</p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Destinations */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-[#002855]">Featured Destinations</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="relative h-48">
                  <Image
                    src="/destinations/cancun.jpg"
                    alt="Cancun"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2">Cancun</h3>
                  <p className="text-gray-600 mb-4">All-inclusive resorts from $498</p>
                  <Link href="/destinations/cancun" className="text-[#0071bc] hover:underline">
                    Learn More →
                  </Link>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="relative h-48">
                  <Image
                    src="/destinations/hawaii.jpg"
                    alt="Hawaii"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2">Hawaii</h3>
                  <p className="text-gray-600 mb-4">Oceanfront condos from $899</p>
                  <Link href="/destinations/hawaii" className="text-[#0071bc] hover:underline">
                    Learn More →
                  </Link>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="relative h-48">
                  <Image
                    src="/destinations/orlando.jpg"
                    alt="Orlando"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2">Orlando</h3>
                  <p className="text-gray-600 mb-4">Theme park packages from $699</p>
                  <Link href="/destinations/orlando" className="text-[#0071bc] hover:underline">
                    Learn More →
                  </Link>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="relative h-48">
                  <Image
                    src="/destinations/caribbean.jpg"
                    alt="Caribbean"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2">Caribbean</h3>
                  <p className="text-gray-600 mb-4">Island hopping from $799</p>
                  <Link href="/destinations/caribbean" className="text-[#0071bc] hover:underline">
                    Learn More →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Insiders Club CTA */}
        <section className="py-16 bg-[#0071bc] text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Join the Insiders Club</h2>
            <p className="text-xl mb-8">Get enhanced savings and exclusive benefits for just $19/month</p>
            <Link 
              href="/insiders-club" 
              className="bg-[#ffc20e] text-[#002855] px-8 py-3 rounded-full font-semibold hover:bg-opacity-90 transition inline-block"
            >
              Learn More
            </Link>
          </div>
        </section>
      </div>
    </>
  )
} 