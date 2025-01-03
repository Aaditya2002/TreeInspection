'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { useToast } from "../../components/ui/use-toast"
import Image from "next/image"
import { useMsal } from "@azure/msal-react"
import { loginRequest } from "../../lib/msal-config"
import React from "react"

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { instance } = useMsal()

  useEffect(() => {
    // Check if user is already logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn")
    if (isLoggedIn === "true") {
      router.push("/")
    }
  }, [router])

  const handleLogin = async () => {
    setLoading(true)

    try {
      const response = await instance.loginPopup(loginRequest)
      if (response) {
        localStorage.setItem("isLoggedIn", "true")
        router.push("/")
      }
    } catch (error) {
      console.error(error)
      toast({
        title: "Login Failed",
        description: "An error occurred during login. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-purple-100 to-white px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
          <svg
              className="w-12 h-12 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
              />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Tree Inspection App</CardTitle>
          <CardDescription className="text-center">
            Sign in with your Microsoft account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            className="w-full mt-6" 
            onClick={handleLogin} 
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in with Microsoft"}
          </Button>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-center w-full text-gray-600">
            Use your organization's Microsoft account to log in
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

