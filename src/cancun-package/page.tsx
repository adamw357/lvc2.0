import Image from 'next/image'
import Link from 'next/link'

export default function CancunPackage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-[#0071bc] to-[#002855] text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              Exclusive Cancun All-Inclusive Package
            </h1>
            <p className="text-2xl mb-8">
              Experience luxury for just $498
            </p>
            <div className="bg-white text-[#002855] p-8 rounded-lg">
              <div className="text-3xl font-bold mb-4">Package Includes:</div>
              <ul className="text-xl space-y-4 mb-8">
                <li>✓ 8 Days / 7 Nights Accommodation</li>
                <li>✓ All-Inclusive Resort Access</li>
                <li>✓ Property Tour and Presentation</li>
                <li>✓ Access to Resort Amenities</li>
              </ul>
              <div className="text-2xl font-bold mb-2">Regular Price: <span className="line-through">$1,299</span></div>
              <div className="text-4xl font-bold text-[#0071bc] mb-8">Your Price: $498</div>
              <Link 
                href="/booking/cancun" 
                className="bg-[#ffc20e] text-[#002855] px-8 py-4 rounded-full font-semibold text-xl hover:bg-opacity-90 transition inline-block"
              >
                Book Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-[#002855]">What You'll Experience</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <h3 className="text-2xl font-semibold mb-4 text-[#002855]">Luxury Accommodations</h3>
              <p className="text-gray-600">Stay in a premium resort with world-class amenities and stunning ocean views</p>
            </div>
            <div className="text-center p-6">
              <h3 className="text-2xl font-semibold mb-4 text-[#002855]">All-Inclusive Benefits</h3>
              <p className="text-gray-600">Enjoy unlimited dining, drinks, and resort activities throughout your stay</p>
            </div>
            <div className="text-center p-6">
              <h3 className="text-2xl font-semibold mb-4 text-[#002855]">Exclusive Access</h3>
              <p className="text-gray-600">Learn about our exclusive membership benefits during a brief presentation</p>
            </div>
          </div>
        </div>
      </section>

      {/* Terms Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-[#002855]">Terms & Conditions</h2>
          <div className="max-w-2xl mx-auto">
            <ul className="space-y-4 text-gray-600">
              <li>• Package is available for married couples aged 30-65</li>
              <li>• Combined household income of $60,000+ required</li>
              <li>• Valid credit card required for booking</li>
              <li>• Attendance at a 90-minute property presentation is required</li>
              <li>• Limited time offer, subject to availability</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#0071bc] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Don't Miss This Exclusive Offer!</h2>
          <p className="text-xl mb-8">Book your dream Cancun vacation today at this incredible price</p>
          <Link 
            href="/booking/cancun" 
            className="bg-[#ffc20e] text-[#002855] px-8 py-3 rounded-full font-semibold hover:bg-opacity-90 transition inline-block"
          >
            Book Now
          </Link>
        </div>
      </section>
    </div>
  )
} 