'use client'

import { useEffect, useState } from 'react'
import { Bell, CheckCircle2, Clock } from 'lucide-react'
import { Card } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { ScrollArea } from '../../components/ui/scroll-area'
import { useNotificationStore } from '../../lib/stores/notification-store'
import React from 'react'

export default function NotificationsPage() {
  const { notifications, clearNotifications } = useNotificationStore()

  return (
    <main className="pb-16 md:pb-0">
      <header className="border-b p-4 bg-white sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-purple-600" />
            <h1 className="text-xl font-bold">Notifications</h1>
          </div>
          {notifications.length > 0 && (
            <button
              onClick={clearNotifications}
              className="text-sm text-purple-600"
            >
              Clear all
            </button>
          )}
        </div>
      </header>

      <ScrollArea className="h-[calc(100vh-4rem)]">
        <div className="p-4 space-y-4">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <Card key={notification.id} className="p-4">
                <div className="flex gap-3">
                  {notification.type === 'success' && (
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                  )}
                  {notification.type === 'info' && (
                    <Bell className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
                  )}
                  <div className="space-y-1 flex-1">
                    <p className="font-medium">{notification.title}</p>
                    <p className="text-sm text-gray-600">{notification.message}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <time>
                        {new Date(notification.createdAt).toLocaleString()}
                      </time>
                    </div>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    {notification.type}
                  </Badge>
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </main>
  )
}

