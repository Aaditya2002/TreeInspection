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
import { usePathname } from 'next/navigation'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isNavbarOpen, setIsNavbarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const isLoginPage = pathname === '/login'

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <ProtectedRoute>
            <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
              {!isLoginPage && (
                <BottomNav isOpen={isNavbarOpen} setIsOpen={setIsNavbarOpen} isMobile={isMobile} />
              )}
              <div 
                className={`
                  flex-1 
                  transition-all 
                  duration-300 
                  ease-in-out 
                  ${!isLoginPage && !isMobile ? (isNavbarOpen ? 'md:pl-64' : 'md:pl-20') : ''}
                  ${!isLoginPage && isMobile ? 'pb-16' : ''}
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

