'use client'

import { useEffect, useState } from 'react'
import { SettingsIcon, Moon, Sun, Bell, Database, Wifi, WifiOff, MapPin } from 'lucide-react'
import { Card } from '../../components/ui/card'
import { Label } from '../../components/ui/label'
import { Switch } from '../../components/ui/switch'
import { Button } from '../../components/ui/button'
import { useTheme } from 'next-themes'
import { useNotificationStore } from '../../lib/stores/notification-store'
import { useToast } from '../../components/ui/use-toast'
import React from 'react'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' && navigator.onLine)
  const { addNotification } = useNotificationStore()
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [locationEnabled, setLocationEnabled] = useState(false)
  const { toast } = useToast()

  // Handle hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    setIsOnline(typeof window !== 'undefined' && navigator.onLine)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Handle notifications permission
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted')
    }
  }, [])

  // Handle location permission
  useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setLocationEnabled(result.state === 'granted')
      })
    }
  }, [])

  const handleNotificationToggle = async (checked: boolean) => {
    if (!('Notification' in window)) {
      toast({
        title: "Not Supported",
        description: "Notifications are not supported in this browser.",
        variant: "destructive",
      })
      return
    }

    if (checked) {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        setNotificationsEnabled(true)
        toast({
          title: "Notifications Enabled",
          description: "You will now receive notifications for new inspections.",
        })
      } else {
        setNotificationsEnabled(false)
        toast({
          title: "Permission Denied",
          description: "Please enable notifications in your browser settings.",
          variant: "destructive",
        })
      }
    } else {
      setNotificationsEnabled(false)
    }
  }

  const handleLocationToggle = async (checked: boolean) => {
    if (!('geolocation' in navigator)) {
      toast({
        title: "Not Supported",
        description: "Geolocation is not supported in this browser.",
        variant: "destructive",
      })
      return
    }

    if (checked) {
      try {
        await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject)
        })
        setLocationEnabled(true)
        toast({
          title: "Location Enabled",
          description: "You can now use location services for inspections.",
        })
      } catch (error) {
        setLocationEnabled(false)
        toast({
          title: "Permission Denied",
          description: "Please enable location services in your browser settings.",
          variant: "destructive",
        })
      }
    } else {
      setLocationEnabled(false)
    }
  }

  const clearCache = async () => {
    try {
      if ('caches' in window) {
        const keys = await caches.keys()
        await Promise.all(keys.map(key => caches.delete(key)))
        
        // Clear IndexedDB
        const dbName = 'tree-inspection-db'
        const req = indexedDB.deleteDatabase(dbName)
        req.onsuccess = () => {
          toast({
            title: "Cache Cleared",
            description: "Application cache and data have been cleared successfully.",
          })
          // Reload to reinitialize the database
          window.location.reload()
        }
        req.onerror = () => {
          throw new Error('Failed to delete IndexedDB')
        }
      } else {
        throw new Error('Cache API not supported')
      }
    } catch (error) {
      console.error('Error clearing cache:', error)
      toast({
        title: "Error",
        description: "Failed to clear application cache and data.",
        variant: "destructive",
      })
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <main className="pb-16 md:pb-0">
      <header className="border-b p-4 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-5 w-5 text-purple-600" />
          <h1 className="text-xl font-bold">Settings</h1>
        </div>
      </header>

      <div className="p-4 space-y-4">
        <Card className="p-4">
          <h2 className="font-medium mb-4">Appearance</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {theme === 'dark' ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
              <Label htmlFor="dark-mode">Dark Mode</Label>
            </div>
            <Switch
              id="dark-mode"
              checked={theme === 'dark'}
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
            />
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="font-medium mb-4">Notifications</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <Label htmlFor="notifications">Push Notifications</Label>
            </div>
            <Switch
              id="notifications"
              checked={notificationsEnabled}
              onCheckedChange={handleNotificationToggle}
            />
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="font-medium mb-4">Location Services</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <Label htmlFor="location">Enable Location</Label>
            </div>
            <Switch
              id="location"
              checked={locationEnabled}
              onCheckedChange={handleLocationToggle}
            />
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="font-medium mb-4">Network Status</h2>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="font-medium mb-4">Storage</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span>Cached Data</span>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={clearCache}
            >
              Clear Cache & Data
            </Button>
          </div>
        </Card>

        <div className="text-center text-sm text-gray-500 mt-8">
          <p>Tree Inspection App v1.0.0</p>
          <p>© 2024 All rights reserved</p>
        </div>
      </div>
    </main>
  )
}
