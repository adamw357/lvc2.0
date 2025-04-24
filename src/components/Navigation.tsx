'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image 
              src="/LVC_logo_Official.png"
              alt="Lifestyle Vacation Clubs Logo" 
              width={259}
              height={50}
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/destinations" className="text-gray-600 hover:text-[#0071bc]">
              Destinations
            </Link>
            <Link href="/deals" className="text-gray-600 hover:text-[#0071bc]">
              Deals
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-[#0071bc]">
              About Us
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-[#0071bc]">
              Contact
            </Link>
            <Link 
              href="/insiders-club" 
              className="btn-primary"
            >
              Join Insiders Club
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4">
            <div className="flex flex-col space-y-4">
              <Link 
                href="/destinations" 
                className="text-gray-600 hover:text-[#0071bc] px-4"
                onClick={() => setIsMenuOpen(false)}
              >
                Destinations
              </Link>
              <Link 
                href="/deals" 
                className="text-gray-600 hover:text-[#0071bc] px-4"
                onClick={() => setIsMenuOpen(false)}
              >
                Deals
              </Link>
              <Link 
                href="/about" 
                className="text-gray-600 hover:text-[#0071bc] px-4"
                onClick={() => setIsMenuOpen(false)}
              >
                About Us
              </Link>
              <Link 
                href="/contact" 
                className="text-gray-600 hover:text-[#0071bc] px-4"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <Link 
                href="/insiders-club" 
                className="btn-primary mx-4"
                onClick={() => setIsMenuOpen(false)}
              >
                Join Insiders Club
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
} 