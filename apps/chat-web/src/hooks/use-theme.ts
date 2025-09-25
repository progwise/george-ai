import { queryOptions, useQuery, useQueryClient } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { useCallback, useEffect } from 'react'

import { queryKeys } from '../query-keys'
import { getCookie } from '@tanstack/react-start/server'

type Theme = 'light' | 'dark' | 'system'
const THEME_KEY = 'theme'
const FALLBACK_THEME: Theme = 'system'

export const getThemeFromCookie = createServerFn({ method: 'GET' }).handler(
  () => getCookie(THEME_KEY) as Theme | undefined,
)

const setThemeCookie = (newTheme: Theme) => (document.cookie = `${THEME_KEY}=${newTheme}; path=/; max-age=31536000`)

const getSystemTheme = () => (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')

const applyTheme = (theme: Theme) => {
  const html = document.documentElement
  let newTheme: string
  if (theme === 'system') {
    newTheme = getSystemTheme()
  } else {
    newTheme = theme
  }
  if (html.getAttribute('data-theme') !== newTheme) {
    html.setAttribute('data-theme', newTheme)
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
    if (currentTheme !== 'system') return

    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyTheme('system')
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
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
