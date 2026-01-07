/**
 * useSettings Hook (T078)
 *
 * Custom hook for user settings operations with:
 * - Automatic settings fetch on mount
 * - Optimistic updates
 * - Sync with SettingsContext
 * - Automatic error handling with toast notifications
 *
 * Implements:
 * - getSettings: Fetch user settings (creates defaults if not exists)
 * - updateSettings: Update preferences
 */

import { useState, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import * as api from '../api'

interface UseSettingsReturn {
  settings: api.UserSettings | null
  isLoading: boolean
  error: Error | null
  fetchSettings: () => Promise<void>
  updateSettings: (data: api.UserSettingsUpdateData) => Promise<boolean>
}

export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<api.UserSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchSettings = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const userSettings = await api.getSettings()
      setSettings(userSettings)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch settings')
      setError(error)
      toast.error('Failed to load settings')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Auto-fetch on mount
  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const updateSettings = useCallback(
    async (data: api.UserSettingsUpdateData): Promise<boolean> => {
      // Store original for rollback
      const originalSettings = settings

      try {
        // Optimistic update
        if (settings) {
          setSettings({ ...settings, ...data })
        }

        const updatedSettings = await api.updateSettings(data)

        // Update with server response
        setSettings(updatedSettings)

        toast.success('Settings updated')
        return true
      } catch (err) {
        // Rollback
        setSettings(originalSettings)

        toast.error('Failed to update settings')
        setError(err instanceof Error ? err : new Error('Failed to update settings'))
        return false
      }
    },
    [settings]
  )

  return {
    settings,
    isLoading,
    error,
    fetchSettings,
    updateSettings,
  }
}
