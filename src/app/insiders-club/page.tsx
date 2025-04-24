import Image from 'next/image'
import Link from 'next/link'

export default function InsidersClub() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-[#0071bc] to-[#002855] text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              Join the Insiders Club
            </h1>
            <p className="text-2xl mb-8">
              Unlock exclusive travel benefits and enhanced savings for just $19/month
            </p>
            <div className="bg-white text-[#002855] p-8 rounded-lg">
              <div className="text-3xl font-bold mb-4">Member Benefits:</div>
              <ul className="text-xl space-y-4 mb-8">
                <li>✓ Additional savings on all bookings</li>
                <li>✓ Priority access to special offers</li>
                <li>✓ Exclusive member-only rates</li>
                <li>✓ Dedicated concierge service</li>
                <li>✓ Flexible booking options</li>
              </ul>
              <div className="text-4xl font-bold text-[#0071bc] mb-8">$19/month</div>
              <Link 
                href="/signup/insiders" 
                className="bg-[#ffc20e] text-[#002855] px-8 py-4 rounded-full font-semibold text-xl hover:bg-opacity-90 transition inline-block"
              >
                Become a Member
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Savings Examples */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-[#002855]">Compare Your Savings</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="border rounded-lg p-6">
              <h3 className="text-2xl font-semibold mb-4 text-[#002855]">Standard Booking</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Cancun Resort</span>
                  <span className="line-through">$1,299</span>
                </div>
                <div className="flex justify-between">
                  <span>Caribbean Cruise</span>
                  <span className="line-through">$899</span>
                </div>
                <div className="flex justify-between">
                  <span>Hawaii Package</span>
                  <span className="line-through">$2,499</span>
                </div>
              </div>
            </div>
            <div className="border-4 border-[#0071bc] rounded-lg p-6 relative">
              <div className="absolute top-0 right-0 bg-[#ffc20e] text-[#002855] px-4 py-1 rounded-bl-lg font-semibold">
                Member Price
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-[#002855]">Insiders Club Price</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Cancun Resort</span>
                  <span className="font-bold text-[#0071bc]">$498</span>
                </div>
                <div className="flex justify-between">
                  <span>Caribbean Cruise</span>
                  <span className="font-bold text-[#0071bc]">$599</span>
                </div>
                <div className="flex justify-between">
                  <span>Hawaii Package</span>
                  <span className="font-bold text-[#0071bc]">$1,699</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-[#002855]">Exclusive Member Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <h3 className="text-2xl font-semibold mb-4 text-[#002855]">Priority Booking</h3>
              <p className="text-gray-600">Get first access to new properties and special offers before they're available to the public</p>
            </div>
            <div className="text-center p-6">
              <h3 className="text-2xl font-semibold mb-4 text-[#002855]">Concierge Service</h3>
              <p className="text-gray-600">Personal assistance with booking, trip planning, and special requests</p>
            </div>
            <div className="text-center p-6">
              <h3 className="text-2xl font-semibold mb-4 text-[#002855]">Flexible Options</h3>
              <p className="text-gray-600">More choices for dates, room types, and destinations with member-only inventory</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#0071bc] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Start Saving Today!</h2>
          <p className="text-xl mb-8">Join the Insiders Club and unlock exclusive travel benefits</p>
          <Link 
            href="/signup/insiders" 
            className="bg-[#ffc20e] text-[#002855] px-8 py-3 rounded-full font-semibold hover:bg-opacity-90 transition inline-block"
          >
            Become a Member
          </Link>
        </div>
      </section>
    </div>
  )
} 