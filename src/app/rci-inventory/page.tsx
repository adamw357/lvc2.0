import Image from 'next/image'
import Link from 'next/link'

export default function RCIInventory() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-[#0071bc] to-[#002855] text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              RCI Vacation Inventory
            </h1>
            <p className="text-2xl mb-8">
              Access 67,000 week combinations with up to 60% savings
            </p>
            <div className="bg-white text-[#002855] p-8 rounded-lg">
              <div className="text-3xl font-bold mb-4">Exclusive Access To:</div>
              <ul className="text-xl space-y-4 mb-8">
                <li>✓ 67,000+ Available Weeks</li>
                <li>✓ Up to 60% Off Regular Rates</li>
                <li>✓ Premium Resort Properties</li>
                <li>✓ Worldwide Destinations</li>
              </ul>
              <Link 
                href="/booking/rci" 
                className="bg-[#ffc20e] text-[#002855] px-8 py-4 rounded-full font-semibold text-xl hover:bg-opacity-90 transition inline-block"
              >
                View Available Properties
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-[#002855]">Popular Destinations</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="rounded-lg overflow-hidden shadow-lg">
              <div className="h-48 bg-gray-300">
                {/* Add destination image */}
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-semibold mb-2 text-[#002855]">Caribbean Islands</h3>
                <p className="text-gray-600 mb-4">Explore pristine beaches and crystal-clear waters</p>
                <div className="text-[#0071bc] font-semibold">From $599/week</div>
              </div>
            </div>
            <div className="rounded-lg overflow-hidden shadow-lg">
              <div className="h-48 bg-gray-300">
                {/* Add destination image */}
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-semibold mb-2 text-[#002855]">European Getaways</h3>
                <p className="text-gray-600 mb-4">Discover historic cities and cultural landmarks</p>
                <div className="text-[#0071bc] font-semibold">From $799/week</div>
              </div>
            </div>
            <div className="rounded-lg overflow-hidden shadow-lg">
              <div className="h-48 bg-gray-300">
                {/* Add destination image */}
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-semibold mb-2 text-[#002855]">Mountain Retreats</h3>
                <p className="text-gray-600 mb-4">Experience scenic views and outdoor adventures</p>
                <div className="text-[#0071bc] font-semibold">From $699/week</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-[#002855]">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-[#0071bc] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
              <h3 className="text-xl font-semibold mb-2 text-[#002855]">Browse</h3>
              <p className="text-gray-600">Explore our extensive inventory of vacation properties</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#0071bc] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
              <h3 className="text-xl font-semibold mb-2 text-[#002855]">Select</h3>
              <p className="text-gray-600">Choose your preferred destination and dates</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#0071bc] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
              <h3 className="text-xl font-semibold mb-2 text-[#002855]">Book</h3>
              <p className="text-gray-600">Secure your vacation with our exclusive rates</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#0071bc] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">4</div>
              <h3 className="text-xl font-semibold mb-2 text-[#002855]">Enjoy</h3>
              <p className="text-gray-600">Experience your dream vacation for less</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#0071bc] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Saving?</h2>
          <p className="text-xl mb-8">Browse our extensive inventory of vacation properties and find your perfect getaway</p>
          <Link 
            href="/booking/rci" 
            className="bg-[#ffc20e] text-[#002855] px-8 py-3 rounded-full font-semibold hover:bg-opacity-90 transition inline-block"
          >
            View Properties
          </Link>
        </div>
      </section>
    </div>
  )
} 