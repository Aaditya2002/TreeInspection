'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useMsal } from "@azure/msal-react"
import React from 'react'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { instance, accounts, inProgress } = useMsal()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      // Skip authentication check for login page
      if (pathname === '/login') {
        setIsAuthenticated(true)
        setIsLoading(false)
        return
      }

      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
      
      // If MSAL is still initializing, wait
      if (inProgress !== 'none') {
        return
      }

      // Check both MSAL accounts and localStorage
      if (!isLoggedIn || accounts.length === 0) {
        // Clear localStorage if MSAL has no accounts
        localStorage.removeItem('isLoggedIn')
        router.push('/login')
      } else {
        setIsAuthenticated(true)
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [router, accounts, inProgress, pathname])

  // Show loading state while checking authentication
  if (isLoading) {
    return <div>Loading...</div>
  }

  // Show nothing if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}

