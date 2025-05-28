import { queryOptions, useQuery, useQueryClient } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { useCallback, useEffect } from 'react'
import { getCookie } from 'vinxi/http'

import { queryKeys } from '../query-keys'

type Theme = 'light' | 'dark' | 'system'
const THEME_KEY = 'theme'
const FALLBACK_THEME: Theme = 'system'

export const getThemeFromCookie = createServerFn({ method: 'GET' }).handler(
  () => getCookie(THEME_KEY) as Theme | undefined,
)

const setThemeCookie = (newTheme: Theme) => (document.cookie = `${THEME_KEY}=${newTheme}; path=/; max-age=31536000`)

const applyTheme = (theme: Theme) => {
  const html = document.documentElement
  if (theme === 'system') {
    // Remove explicit theme, use prefers-color-scheme
    html.removeAttribute('data-theme')
    // Optionally, set data-theme to match system for DaisyUI
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    html.setAttribute('data-theme', systemTheme)
  } else {
    html.setAttribute('data-theme', theme)
  }
}

export const getThemeQueryOptions = () =>
  queryOptions({
    queryKey: [queryKeys.Theme],
    queryFn: () => getThemeFromCookie(),
    staleTime: Infinity,
  })

export const useTheme = () => {
  const { data: theme } = useQuery(getThemeQueryOptions())
  const queryClient = useQueryClient()

  // Apply theme on mount and when theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return
    const currentTheme = theme ?? FALLBACK_THEME
    applyTheme(currentTheme)
    if (currentTheme === 'system') {
      // Listen for system theme changes
      const mql = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = () => applyTheme('system')
      mql.addEventListener('change', handler)
      return () => mql.removeEventListener('change', handler)
    }
  }, [theme])

  const setTheme = useCallback(
    (newTheme: Theme) => {
      setThemeCookie(newTheme)
      queryClient.setQueryData(getThemeQueryOptions().queryKey, newTheme)
      if (typeof window !== 'undefined') {
        applyTheme(newTheme)
      }
    },
    [queryClient],
  )

  return [theme ?? FALLBACK_THEME, setTheme] as const
}
