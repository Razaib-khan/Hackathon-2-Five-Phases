import type { Metadata } from 'next'
import '@/styles/globals.css'
import { AuthProvider } from '@/lib/auth-context'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { SettingsProvider } from '@/contexts/SettingsContext'
import { ViewProvider } from '@/contexts/ViewContext'
import { FilterProvider } from '@/contexts/FilterContext'
import { Toaster } from 'sonner'

export async function generateMetadata(): Promise<Metadata> {
  const basePath = process.env.GITHUB_PAGES ? '/Hackathon-2-Five-Phases' : '';
  const iconPath = `${basePath}/favicon-32x32.png`;

  return {
    title: 'AIDO Todo',
    description: 'A modern task management application with JWT authentication',
    icons: {
      icon: iconPath,
    },
  };
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
