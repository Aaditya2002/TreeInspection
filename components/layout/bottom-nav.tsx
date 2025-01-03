'use client'

import { Home, Map, FileText, Bell, Settings, LogOut, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '../../lib/utils'
import { useToast } from "../../components/ui/use-toast"
import { useState } from 'react'
import { Sheet, SheetContent } from "../../components/ui/sheet"
import { useMsal, useIsAuthenticated } from "@azure/msal-react"

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Map', href: '/map', icon: Map },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Settings', href: '/settings', icon: Settings },
]

interface BottomNavProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isMobile: boolean;
}

export function BottomNav({ isOpen, setIsOpen, isMobile }: BottomNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const { instance } = useMsal()
  const isAuthenticated = useIsAuthenticated()

  const handleLogout = async () => {
    try {
      localStorage.removeItem('isLoggedIn')
      if (isAuthenticated) {
        await instance.logoutRedirect({
          onRedirectNavigate: () => false
        })
      }
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      })
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      router.push('/login')
    }
  }

  const NavLinks = () => (
    <>
      {navigation.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={() => setIsSheetOpen(false)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
              isActive
                ? 'bg-purple-100 text-purple-600'
                : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {isOpen && <span className="truncate">{item.name}</span>}
          </Link>
        )
      })}
    </>
  )

  return (
    <>
      {isMobile ? (
        <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-200">
          <div className="grid h-full max-w-lg grid-cols-5 mx-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <item.icon className="w-5 h-5 mb-2 text-gray-500 dark:text-gray-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <nav 
          className={cn(
            "fixed left-0 top-0 z-40 h-full bg-white border-r shadow-sm transition-all duration-300 ease-in-out",
            isOpen ? "w-64" : "w-20"
          )}
        >
          <div className="flex justify-end p-4">
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
          <div className="flex flex-col h-[calc(100vh-5rem)] overflow-y-auto px-4 space-y-2">
            <NavLinks />
            <button
              onClick={handleLogout}
              className={cn(
                "mt-auto mb-4 flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg w-full transition-colors",
                !isOpen && "justify-center"
              )}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {isOpen && <span>Logout</span>}
            </button>
          </div>
        </nav>
      )}

      <button
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        onClick={() => setIsSheetOpen(!isSheetOpen)}
      >
        {isSheetOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex flex-col h-full">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
            </div>
            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
              <NavLinks />
            </nav>
            <div className="p-4 border-t">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 w-full text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

