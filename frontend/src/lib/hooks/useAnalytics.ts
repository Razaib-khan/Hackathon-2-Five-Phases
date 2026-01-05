/**
 * useAnalytics Hook (T079)
 *
 * Custom hook for analytics and dashboard statistics with:
 * - Dashboard analytics with period filtering
 * - Completion streak tracking
 * - Automatic error handling with toast notifications
 *
 * Implements:
 * - getDashboard: Fetch dashboard analytics
 * - getStreak: Fetch completion streak
 */

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import * as api from '../api'
import { DashboardAnalytics, StreakData } from '@/models/analytics'

interface UseAnalyticsReturn {
  dashboard: DashboardAnalytics | null
  streak: StreakData | null
  isLoadingDashboard: boolean
  isLoadingStreak: boolean
  error: Error | null
  fetchDashboard: (period?: 'week' | 'month' | 'year' | 'all') => Promise<void>
  fetchStreak: () => Promise<void>
}

export function useAnalytics(): UseAnalyticsReturn {
  const [dashboard, setDashboard] = useState<DashboardAnalytics | null>(null)
  const [streak, setStreak] = useState<StreakData | null>(null)
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false)
  const [isLoadingStreak, setIsLoadingStreak] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchDashboard = useCallback(
    async (period: 'week' | 'month' | 'year' | 'all' = 'all') => {
      setIsLoadingDashboard(true)
      setError(null)
      try {
        const analytics = await api.getDashboardAnalytics(period)
        setDashboard(analytics)
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch analytics')
        setError(error)
        toast.error('Failed to load dashboard analytics')
      } finally {
        setIsLoadingDashboard(false)
      }
    },
    []
  )

  const fetchStreak = useCallback(async () => {
    setIsLoadingStreak(true)
    setError(null)
    try {
      const streakData = await api.getStreakData()
      setStreak(streakData)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch streak')
      setError(error)
      toast.error('Failed to load completion streak')
    } finally {
      setIsLoadingStreak(false)
    }
  }, [])

  return {
    dashboard,
    streak,
    isLoadingDashboard,
    isLoadingStreak,
    error,
    fetchDashboard,
    fetchStreak,
  }
}
