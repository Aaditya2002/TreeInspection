'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useMsal } from "@azure/msal-react"
import React from 'react'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { instance, accounts } = useMsal()

  useEffect(() => {
    if (accounts.length === 0) {
      router.push('/login')
    }
  }, [router, accounts])

  return <>{children}</>
}

