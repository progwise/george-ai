import { queryOptions, useQuery, useQueryClient } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { getCookie, getRequestHeaders } from '@tanstack/react-start/server'
import { useCallback, useEffect } from 'react'

import { queryKeys } from '../query-keys'
import { getClientLanguage } from './get-language'
import { Language } from './index'

const LANGUAGE_COOKIE_NAME = 'preferred-language'
const FALLBACK_LANGUAGE: Language = 'en'

const getLanguage = createServerFn({ method: 'GET' }).handler(() => {
  // First check for stored cookie preference
  const cookieLanguage = getCookie(LANGUAGE_COOKIE_NAME) as Language | undefined
  if (cookieLanguage) {
    return cookieLanguage
  }

  // If no cookie, check Accept-Language header to match browser language
  // This prevents hydration mismatch between SSR and client
  try {
    const headers = getRequestHeaders()
    const acceptLanguage = headers.get('accept-language')
    if (acceptLanguage) {
      const lang = acceptLanguage.split(',')[0].split('-')[0]
      if (lang === 'de') return 'de'
      if (lang === 'en') return 'en'
    }
  } catch {
    // Ignore if headers not available
  }

  return FALLBACK_LANGUAGE
})

const setLanguageInCookie = (language: Language) =>
  (document.cookie = `${LANGUAGE_COOKIE_NAME}=${language}; path=/; max-age=31536000`)

export const getLanguageQueryOptions = () =>
  queryOptions({
    queryKey: [queryKeys.Language],
    queryFn: () => getLanguage(),
    staleTime: Infinity,
  })

export const useLanguage = () => {
  const { data: language } = useQuery(getLanguageQueryOptions())
  const queryClient = useQueryClient()

  const setLanguage = useCallback(
    (newLanguage: Language) => {
      setLanguageInCookie(newLanguage)
      queryClient.setQueryData(getLanguageQueryOptions().queryKey, newLanguage)
    },
    [queryClient],
  )

  // Set cookie and cache to browser language if not set
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cookieSet = document.cookie.includes(`${LANGUAGE_COOKIE_NAME}=`)
      if (!cookieSet) {
        const browserLang = getClientLanguage()
        setLanguage(browserLang)
      }
    }
  }, [setLanguage])

  return { language: language ?? FALLBACK_LANGUAGE, setLanguage }
}
