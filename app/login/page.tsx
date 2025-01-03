'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { useToast } from "../../components/ui/use-toast"
import { useMsal } from "@azure/msal-react"
import { loginRequest } from "../../lib/msal-config"
import { Scale } from 'lucide-react'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { instance, accounts } = useMsal()

  useEffect(() => {
    // Check if user is already logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"
    if (isLoggedIn && accounts.length > 0) {
      router.push("/")
    }
  }, [router, accounts])

  const handleLogin = async () => {
    setLoading(true)

    try {
      const response = await instance.loginPopup(loginRequest)
      if (response?.account) {
        localStorage.setItem("isLoggedIn", "true")
        router.push("/")
      }
    } catch (error) {
      console.error(error)
      localStorage.removeItem("isLoggedIn")
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
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-purple-100 to-white">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-purple-100 p-3">
              <Scale className="w-12 h-12 text-purple-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Tree Inspection App
          </CardTitle>
          <CardDescription className="text-center">
            Sign in with your Microsoft account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            className="w-full mt-6 bg-purple-600 hover:bg-purple-700" 
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

