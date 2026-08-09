'use client'

import { useEffect } from 'react'
import { Toaster } from 'sonner'
import { useAuth } from '@/store/auth'
import { useImpersonation } from '@/store/impersonation'
import { ThemeProvider } from '@/components/theme-provider'

export function Providers({ children }: { children: React.ReactNode }) {
  const bootstrap = useAuth((s) => s.bootstrap)
  const hydrateImpersonation = useImpersonation((s) => s.hydrate)
  useEffect(() => {
    bootstrap()
    hydrateImpersonation()
  }, [bootstrap, hydrateImpersonation])

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'bg-surface border border-border-subtle text-text',
          style: {
            backdropFilter: 'blur(20px)',
          },
        }}
      />
    </ThemeProvider>
  )
}
