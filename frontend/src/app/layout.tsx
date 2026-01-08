import type { Metadata } from 'next'
import '@/styles/globals.css'
import { AuthProvider } from '@/lib/auth-context'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { SettingsProvider } from '@/contexts/SettingsContext'
import { ViewProvider } from '@/contexts/ViewContext'
import { FilterProvider } from '@/contexts/FilterContext'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'AIDO Todo',
  description: 'A modern task management application with JWT authentication',
  icons: {
    icon: 'favicon-32x32.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <ThemeProvider>
          <AuthProvider>
            <SettingsProvider>
              <ViewProvider>
                <FilterProvider>
                  {children}
                  <Toaster position="top-right" richColors />
                </FilterProvider>
              </ViewProvider>
            </SettingsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
