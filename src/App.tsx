import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { onAuthStateChanged, auth } from '@/lib/firebase'
import { useAuthStore } from '@/store/authStore'
import { queryClient } from '@/lib/queryClient'
import { router } from '@/lib/router'

export default function App() {
  const { setUser, setLoading } = useAuthStore()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })
    return unsubscribe
  }, [setUser, setLoading])

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}
