import { useRouteContext } from '@tanstack/react-router'
import { useCallback } from 'react'

import { getTranslatedValue } from './translation-utils'

const useTranslation = () => {
  const ctx = useRouteContext({ strict: false })
  const language: 'de' | 'en' = ctx.language === 'de' ? 'de' : 'en'
  const t = useCallback(
    (key: string, values?: Record<string, string | number>) => {
      try {
        return getTranslatedValue(key, language, values)
      } catch (e) {
        console.error(`Translation key not found: ${e}`, language)
        return key
      }
    },
    [language],
  )
  return { t, language }
}

export { useTranslation }
