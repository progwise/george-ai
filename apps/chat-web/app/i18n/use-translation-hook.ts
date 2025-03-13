import { useRouteContext } from '@tanstack/react-router'
import { useCallback } from 'react'

import de from './de'
import en from './en'

type TranslationObject = {
  [key: string]: string | TranslationObject
}

const getTranslatedValue = (key: string, language: 'en' | 'de', values?: Record<string, string | number>): string => {
  const keys = key.split('.')
  let currentObject: TranslationObject | string = language === 'de' ? de : en
  keys.forEach((key) => {
    currentObject = (currentObject as TranslationObject)[key]
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
      } catch (event) {
        console.error(`Translation key not found: ${event}`, language)
        return key
      }
    },
    [language],
  )
  return { t, language }
}

export { useTranslation, getTranslatedValue }
