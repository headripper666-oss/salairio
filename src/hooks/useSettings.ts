import { useQuery, useMutation } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { getSettings, setSettings } from '@/services/firestore/settings'
import { queryClient } from '@/lib/queryClient'
import { DEFAULT_SETTINGS } from '@/engine/constants'
import type { UserSettings } from '@/types/firestore'

export function useSettings() {
  const uid = useAuthStore(s => s.user?.uid) ?? null

  const query = useQuery({
    queryKey: ['settings', uid],
    queryFn: async (): Promise<UserSettings> => {
      if (!uid) throw new Error('Non authentifié')
      let settings = await getSettings(uid)
      if (!settings) {
        // Premier accès : on seed les valeurs par défaut
        await setSettings(uid, DEFAULT_SETTINGS)
        settings = await getSettings(uid)
      }
      return settings!
    },
    enabled: !!uid,
    staleTime: 1000 * 60 * 5,
  })

  const mutation = useMutation({
    mutationFn: (updates: Partial<Omit<UserSettings, 'updatedAt'>>) => {
      if (!uid) throw new Error('Non authentifié')
      return setSettings(uid, updates)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', uid] })
    },
  })

  return {
    settings:       query.data ?? null,
    isLoading:      query.isLoading,
    isError:        query.isError,
    updateSettings: mutation.mutate,
    isSaving:       mutation.isPending,
    saveError:      mutation.error,
  }
}
