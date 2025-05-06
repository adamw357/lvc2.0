'use client'

import { AuthProvider } from '@/contexts/AuthContext'

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
} 