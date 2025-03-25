import { useRouteContext } from '@tanstack/react-router'
import { useCallback } from 'react'

import de from './de'
import en from './en'

const getTranslatedValue = (key: string, language: 'en' | 'de', values?: Record<string, string | number>): string => {
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
  let translatedValue = currentObject.toString()
  if (values) {
    Object.keys(values).forEach((placeholder) => {
      translatedValue = translatedValue.replace(`{${placeholder}}`, values[placeholder].toString())
    })
  }
  return translatedValue
}

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

export { getTranslatedValue, useTranslation }
