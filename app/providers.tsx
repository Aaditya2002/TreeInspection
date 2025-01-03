'use client'

import { ReactNode } from 'react'
import { MsalProvider } from "@azure/msal-react"
import { PublicClientApplication } from "@azure/msal-browser"
import { msalConfig } from "../lib/msal-config"
import { ThemeProvider } from '../components/theme-provider'

const msalInstance = new PublicClientApplication(msalConfig)

export function Providers({ children }: { children: ReactNode }) {
  return (
    <MsalProvider instance={msalInstance}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </MsalProvider>
  )
}

