'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMsal } from "@azure/msal-react"
import React from 'react'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { instance } = useMsal()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const account = instance.getActiveAccount()
      if (!account) {
        router.push('/login')
      } else {
        setIsAuthenticated(true)
      }
    }

    checkAuth()
  }, [router, instance])

  if (!isAuthenticated) {
    return null // or a loading spinner
  }

  return <>{children}</>
}
