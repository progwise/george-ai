import { getTranslatedValue, getTranslatedValue as getTranslatedValueServer } from './translation-utils'

const getLanguageString = (languages: readonly string[]) => {
  for (const language of languages) {
    if (language.startsWith('de')) {
      return 'de'
    }
    if (language.startsWith('en')) {
      return 'en'
    }
  }
  return 'en'
}

const getLanguage = async () => {
  if (typeof window !== 'undefined') {
    const languageString = getLanguageString(window.navigator.languages)
    return languageString
  }
  try {
    const vinxiModule = await import('vinxi/http')
    const headers = vinxiModule.getHeaders()
    const languages = headers['accept-language']?.split(',')
    const language = getLanguageString(languages || [])
    return language
  } catch (e) {
    console.log('error', e)
    throw new Error('Could not determine language')
  }
}

const translate = (key: string, language: 'en' | 'de') => {
  return getTranslatedValue(key, language === 'de' ? 'de' : 'en')
}

export { translate, getLanguage, getTranslatedValueServer }
