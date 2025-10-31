import { createServerOnlyFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'

import { Language } from './index'
import { getTranslatedString } from './use-translation-hook'

const getLanguage = createServerOnlyFn(() => {
  try {
    const headers = getRequestHeaders()
    const acceptLanguage = headers.get('accept-language')
    if (acceptLanguage) {
      const lang = acceptLanguage.split(',')[0].split('-')[0]
      if (lang === 'de') return 'de'
      if (lang === 'en') return 'en'
    }
  } catch {
    // Ignore if not in server context
  }
  return getClientLanguage()
})

// Client-side detection of browser language.
export const getClientLanguage = (): Language => {
  if (typeof navigator !== 'undefined' && navigator.language) {
    const lang = navigator.language.split('-')[0]
    if (lang === 'de') return 'de'
    if (lang === 'en') return 'en'
  }
  return 'en'
}

const translate = (key: string, language: Language) => {
  return getTranslatedString(key, language === 'de' ? 'de' : 'en')
}

export { translate, getLanguage }
