'use client'

import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { useToast } from '../ui/use-toast'

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      // Store the event for later use
      setDeferredPrompt(e)
      setIsInstallable(true)
      showInstallPrompt()
    }

    // Check if the app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstallable(false)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const showInstallPrompt = () => {
    if (isInstallable) {
      toast({
        title: "Install Tree Inspection App",
        description: "Install our app for a better experience!",
        action: (
          <Button variant="outline" onClick={handleInstallClick}>
            Install
          </Button>
        ),
        duration: 10000, // Show for 10 seconds
      })
    }
  }

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    try {
      // Show the install prompt
      const promptResult = await deferredPrompt.prompt()
      
      // Wait for the user to respond to the prompt
      const choiceResult = await deferredPrompt.userChoice
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt')
        setIsInstallable(false)
      } else {
        console.log('User dismissed the install prompt')
      }
    } catch (err) {
      console.error('Error during installation:', err)
    } finally {
      // Clear the deferredPrompt as it can only be used once
      setDeferredPrompt(null)
    }
  }

  // This component doesn't render anything directly
  return null
}

