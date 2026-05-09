import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: Number.POSITIVE_INFINITY
    }
  }
})

export const queryKeys = {
  sessions: ['sessions'] as const,
  settings: ['settings'] as const
}
