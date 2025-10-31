import React, { JSX, createElement, useCallback } from 'react'

import de from './de'
import en from './en'
import { Language } from './index'
import { useLanguage } from './use-language-hook'

const getTranslatedString = (key: string, language: Language, values?: Record<string, string | number>): string => {
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
  let translatedText = currentObject.toString()
  if (values) {
    const availablePlaceholders = Object.keys(values)

    availablePlaceholders.forEach((placeholder) => {
      translatedText = translatedText.replace(`{${placeholder}}`, values[placeholder].toString())
    })
  }
  return translatedText
}

const getTranslatedJSX = (
  key: string,
  language: Language,
  values?: Record<string, string | number | JSX.Element>,
): string | JSX.Element => {
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
  const translatedText = currentObject.toString()
  const childElements: Array<JSX.Element> = []
  if (values) {
    const availablePlaceholders = Object.keys(values)
    let remainingText = translatedText

    availablePlaceholders.forEach((placeholder) => {
      const [before, after] = remainingText.split(`{${placeholder}}`)
      childElements.push(createElement(React.Fragment, {}, before))
      if (typeof values[placeholder] === 'string' || typeof values[placeholder] === 'number') {
        childElements.push(createElement(React.Fragment, {}, values[placeholder].toString()))
      } else if (typeof values[placeholder] === 'object') {
        const value = values[placeholder] as JSX.Element
        childElements.push(value)
      }

      remainingText = after || ''
    })

    if (remainingText) {
      childElements.push(createElement(React.Fragment, {}, remainingText))
    }

    return createElement(React.Fragment, {}, ...childElements)
  } else {
    return translatedText
  }
}

const useTranslation = () => {
  const { language } = useLanguage()

  const t = useCallback(
    (key: string, values?: Record<string, string | number>) => {
      try {
        return getTranslatedString(key, language, values)
      } catch (e) {
        console.error(`Translation key not found: ${e}`, language)
        return key
      }
    },
    [language],
  )

  const tx = (key: string, values?: Record<string, string | number | JSX.Element>) => {
    return getTranslatedJSX(key, language, values)
  }

  return { t, tx, language }
}

export { getTranslatedString, getTranslatedJSX, useTranslation }
