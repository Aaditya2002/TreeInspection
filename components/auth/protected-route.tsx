'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useMsal } from "@azure/msal-react"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { instance, accounts } = useMsal()

  useEffect(() => {
    const checkAuth = async () => {
      if (accounts.length === 0) {
        router.push('/login')
      }
    }

    checkAuth()
  }, [router, accounts, instance])

  if (accounts.length === 0) {
    return null // Don't render anything until authentication is confirmed
  }

  return <>{children}</>
}

