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
      if (accounts.length > 0) {
        setIsAuthenticated(true)
      } else {
        const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"
        if (!isLoggedIn) {
          router.push('/login')
        } else {
          try {
            const result = await instance.ssoSilent({
              scopes: ["openid", "profile", "User.Read"],
              loginHint: localStorage.getItem("loginHint")
            })
            if (result) {
              setIsAuthenticated(true)
            }
          } catch (error) {
            console.error("SSO error:", error)
            localStorage.removeItem("isLoggedIn")
            router.push('/login')
          }
        }
      }
    }

    checkAuth()
  }, [router, accounts, instance])

  if (!isAuthenticated) {
    return null // Don't render anything until authentication is confirmed
  }

  return <>{children}</>
}

