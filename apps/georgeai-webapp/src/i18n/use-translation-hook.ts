import React, { JSX, createElement, useCallback } from 'react'

import { logger } from '../common'
import de from './de'
import en from './en'
import { Language } from './index'
import { useLanguage } from './use-language-hook'

function applyPlaceholders(text: string, placeholders: Record<string, string | number>): string
function applyPlaceholders(
  text: string,
  placeholders: Record<string, string | number | JSX.Element>,
): string | JSX.Element
function applyPlaceholders(
  text: string,
  placeholders: Record<string, string | number | JSX.Element>,
): string | JSX.Element {
  let parts: Array<string | JSX.Element> = [text]
  Object.entries(placeholders).forEach(([placeholder, value]) => {
    const pattern = `{${placeholder}}`

    parts = parts.flatMap((part) => {
      if (typeof part !== 'string' || !part.includes(pattern)) {
        return [part]
      }
      if (typeof value === 'string' || typeof value === 'number') {
        return [part.replaceAll(pattern, String(value))]
      }

      const splitText = part.split(pattern)
      const newParts: Array<string | JSX.Element> = []
      splitText.forEach((segment, i) => {
        if (segment.length > 1) {
          newParts.push(segment)
        }
        // Do not add value after the last segment
        if (i < splitText.length - 1) {
          newParts.push(value)
        }
      })
      return newParts
    })
  })

  const hasJSX = parts.some((part) => typeof part !== 'string')

  if (hasJSX) {
    return createElement(
      React.Fragment,
      {},
      ...parts.map((part) => {
        if (typeof part === 'string') {
          return createElement(React.Fragment, { key: `text-${part}` }, part)
        }
        return part
      }),
    )
  }

  return parts.join('')
}

const getTranslationEntry = (key: string | string[], language: Language) => {
  const keys = Array.isArray(key) ? key : key.split('.')
  if (keys.length < 1) {
    logger.error('Empty key cannot be translated')
    throw new Error('Empty key cannot be translated')
  }
  let currentObject: object | null = language === 'de' ? de : en
  let currentKeyIndex = 0
  let translatedText: string | undefined = undefined
  while (
    currentKeyIndex < keys.length &&
    typeof currentObject === 'object' &&
    !!currentObject &&
    keys[currentKeyIndex] in currentObject
  ) {
    const currentKey = keys[currentKeyIndex++]
    const next: unknown = currentObject[currentKey as keyof typeof currentObject]
    if (typeof next === 'string') {
      translatedText = next
      break
    }
    if (typeof next === 'object') {
      currentObject = next
      continue
    }
    logger.error('Unsupported translation object type', { type: typeof next, key, language })
    throw new Error(`Error translating ${keys.join('.')} into ${language}`)
  }

  return {
    translatedText,
    path: keys.join('.'),
  }
}

const getTranslatedString = (
  key: string | string[],
  language: Language,
  values?: Record<string, string | number>,
): string => {
  const { translatedText, path } = getTranslationEntry(key, language)

  if (!translatedText) {
    return path
  }

  if (values) {
    return applyPlaceholders(translatedText, values)
  }
  return translatedText
}

const getTranslatedJSX = (
  key: string | string[],
  language: Language,
  values?: Record<string, string | number | JSX.Element>,
): string | JSX.Element => {
  const { translatedText, path } = getTranslationEntry(key, language)
  if (!translatedText) {
    return path
  }

  if (!values) {
    return translatedText
  }

  return applyPlaceholders(translatedText, values)
}

const useTranslation = () => {
  const { language } = useLanguage()

  const t = useCallback(
    (key: string | string[], values?: Record<string, string | number>) => {
      return getTranslatedString(key, language, values)
    },
    [language],
  )

  const tx = (key: string | string[], values?: Record<string, string | number | JSX.Element>) => {
    return getTranslatedJSX(key, language, values)
  }

  return { t, tx, language }
}

export { getTranslatedString, getTranslatedJSX, useTranslation }
