'use client'

import './globals.css'
import { Inter } from 'next/font/google'
import { BottomNav } from '../components/layout/bottom-nav'
import { NotificationToast } from '../components/notifications/notification-toast'
import { ProtectedRoute } from '../components/auth/protected-route'
import { InstallPrompt } from '../components/pwa/install-prompt'
import { Providers } from './providers'
import { ServiceWorkerRegister } from './service-worker-register'
import { useState, useEffect } from 'react'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isNavbarOpen, setIsNavbarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="application-name" content="Tree Inspections" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icons-192.png" />
      </head>
      <body className={inter.className}>
        <Providers>
          <ProtectedRoute>
            <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
              <BottomNav isOpen={isNavbarOpen} setIsOpen={setIsNavbarOpen} isMobile={isMobile} />
              <div 
                className={`
                  flex-1 
                  transition-all 
                  duration-300 
                  ease-in-out 
                  ${!isMobile ? (isNavbarOpen ? 'md:pl-64' : 'md:pl-20') : ''}
                  ${isMobile ? 'pb-16' : ''}
                `}
              >
                <main className="min-h-screen w-full">
                  {children}
                </main>
              </div>
              <NotificationToast />
              <InstallPrompt />
              <ServiceWorkerRegister />
            </div>
          </ProtectedRoute>
        </Providers>
      </body>
    </html>
  )
}

