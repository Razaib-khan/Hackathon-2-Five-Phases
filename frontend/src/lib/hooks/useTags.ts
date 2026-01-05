/**
 * useTags Hook (T076)
 *
 * Custom hook for tag operations with:
 * - Optimistic updates for instant UI feedback
 * - Automatic error handling with toast notifications
 * - 100 tag limit enforcement (FR-106)
 *
 * Implements:
 * - getTags: Fetch all user tags
 * - createTag: Create new tag
 * - updateTag: Update tag name/color
 * - deleteTag: Delete tag (CASCADE removes from tasks)
 */

import { useState, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import * as api from '../api'
import { Tag, TagCreateRequest, TagUpdateRequest, TagListResponse } from '@/models/tag'

interface UseTagsReturn {
  tags: Tag[]
  total: number
  isLoading: boolean
  error: Error | null
  fetchTags: (userId: string) => Promise<void>
  createTag: (data: TagCreateRequest) => Promise<Tag | null>
  updateTag: (tagId: string, data: TagUpdateRequest) => Promise<Tag | null>
  deleteTag: (tagId: string) => Promise<boolean>
}

export function useTags(): UseTagsReturn {
  const [tags, setTags] = useState<Tag[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchTags = useCallback(async (userId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      if (!userId) {
        throw new Error('User not authenticated');
      }
      const response = await api.getTags(userId)
      setTags(response.tags)
      setTotal(response.total)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch tags')
      setError(error)
      toast.error('Failed to load tags')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Auto-fetch on mount - userId should be passed when calling this function
  // Components will call fetchTags with userId when needed

  const createTag = useCallback(
    async (data: TagCreateRequest): Promise<Tag | null> => {
      // Check 100 tag limit (FR-106)
      if (tags.length >= 100) {
        toast.error('Maximum 100 tags allowed')
        return null
      }

      try {
        const newTag = await api.createTag(data)

        // Optimistic update
        setTags((prev) => [...prev, newTag])
        setTotal((prev) => prev + 1)

        toast.success('Tag created')
        return newTag
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to create tag'

        // Check for 403 (limit) or 409 (duplicate name)
        if (errorMsg.includes('403') || errorMsg.includes('limit')) {
          toast.error('Maximum 100 tags reached')
        } else if (errorMsg.includes('409') || errorMsg.includes('exists')) {
          toast.error('Tag name already exists')
        } else {
          toast.error('Failed to create tag')
        }

        setError(err instanceof Error ? err : new Error('Failed to create tag'))
        return null
      }
    },
    [tags]
  )

  const updateTag = useCallback(
    async (tagId: string, data: TagUpdateRequest): Promise<Tag | null> => {
      // Store original for rollback
      const originalTag = tags.find((t) => t.id === tagId)

      try {
        // Optimistic update
        setTags((prev) =>
          prev.map((t) => (t.id === tagId ? { ...t, ...data } : t))
        )

        const updatedTag = await api.updateTag(tagId, data)

        // Update with server response
        setTags((prev) =>
          prev.map((t) => (t.id === tagId ? updatedTag : t))
        )

        toast.success('Tag updated')
        return updatedTag
      } catch (err) {
        // Rollback
        if (originalTag) {
          setTags((prev) =>
            prev.map((t) => (t.id === tagId ? originalTag : t))
          )
        }

        const errorMsg = err instanceof Error ? err.message : 'Failed to update tag'

        if (errorMsg.includes('409') || errorMsg.includes('exists')) {
          toast.error('Tag name already exists')
        } else {
          toast.error('Failed to update tag')
        }

        setError(err instanceof Error ? err : new Error('Failed to update tag'))
        return null
      }
    },
    [tags]
  )

  const deleteTag = useCallback(
    async (tagId: string): Promise<boolean> => {
      // Store original for rollback
      const originalTags = [...tags]

      try {
        // Optimistic update
        setTags((prev) => prev.filter((t) => t.id !== tagId))
        setTotal((prev) => prev - 1)

        await api.deleteTag(tagId)

        toast.success('Tag deleted')
        return true
      } catch (err) {
        // Rollback
        setTags(originalTags)
        setTotal(originalTags.length)

        toast.error('Failed to delete tag')
        setError(err instanceof Error ? err : new Error('Failed to delete tag'))
        return false
      }
    },
    [tags]
  )

  return {
    tags,
    total,
    isLoading,
    error,
    fetchTags,
    createTag,
    updateTag,
    deleteTag,
  }
}
