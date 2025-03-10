import { useRouteContext } from '@tanstack/react-router'
import { useCallback } from 'react'

import de from './de'
import en from './en'

const getTranslatedValue = (key: string, language: 'en' | 'de'): string => {
  const keys = key.split('.')
  let currentObject = language === 'de' ? de : en
  keys.forEach((k) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    currentObject = currentObject[k]
  })
  if (currentObject === undefined) {
    return key
  }
  return currentObject.toString()
}

const useTranslation = () => {
  const ctx = useRouteContext({ strict: false })
  const language: 'de' | 'en' = ctx.language === 'de' ? 'de' : 'en'
  const t = useCallback(
    (key: string) => {
      try {
        return getTranslatedValue(key, language)
      } catch (e) {
        console.error(`Translation key not found: ${e}`, language)
        return key
      }
    },
    [language],
  )
  return { t, language }
}

export { useTranslation, getTranslatedValue }
