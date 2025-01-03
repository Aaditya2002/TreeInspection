'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMsal } from "@azure/msal-react"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { instance, accounts } = useMsal()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"
      if (isLoggedIn) {
        setIsAuthenticated(true)
      } else if (accounts.length === 0) {
        router.push('/login')
      } else {
        setIsAuthenticated(true)
      }
    }

    checkAuth()
  }, [router, accounts])

  if (!isAuthenticated) {
    return null // Don't render anything until authentication is confirmed
  }

  return <>{children}</>
}

