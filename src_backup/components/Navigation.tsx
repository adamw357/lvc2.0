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
          <Link href="/" className="flex items-center space-x-2">
            <Image 
              src="/LifeStyleVacationClubs-Logo_compass_only.png" 
              alt="Lifestyle Vacation Clubs Logo" 
              width={40} 
              height={40}
              className="h-10 w-auto"
            />
            <span className="text-2xl font-bold text-[#002855]">Lifestyle Vacation Clubs</span>
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
            className="md:hidden p-2 text-gray-600 hover:text-[#0071bc]"
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
          <div className="md:hidden py-4 bg-white shadow-lg rounded-lg mt-2">
            <div className="flex flex-col space-y-4 px-4">
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