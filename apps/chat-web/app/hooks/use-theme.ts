import { queryOptions, useQuery, useQueryClient } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { useCallback } from 'react'
import { getCookie } from 'vinxi/http'

import { queryKeys } from '../query-keys'

type Theme = 'light' | 'dark'
const THEME_KEY = 'theme'
const FALLBACK_THEME: Theme = 'light'

export const getThemeFromCookie = createServerFn({ method: 'GET' }).handler(
  () => getCookie(THEME_KEY) as Theme | undefined,
)

const setThemeCookie = (newTheme: Theme) => (document.cookie = `${THEME_KEY}=${newTheme}; path=/; max-age=31536000`)

export const getThemeQueryOptions = () =>
  queryOptions({
    queryKey: [queryKeys.Theme],
    queryFn: () => getThemeFromCookie(),
    staleTime: Infinity,
  })

export const useTheme = () => {
  const { data: theme } = useQuery(getThemeQueryOptions())
  const queryClient = useQueryClient()

  const setTheme = useCallback(
    (newTheme: Theme) => {
      setThemeCookie(newTheme)
      queryClient.setQueryData(getThemeQueryOptions().queryKey, newTheme)
    },
    [queryClient],
  )

  return [theme ?? FALLBACK_THEME, setTheme] as const
}
