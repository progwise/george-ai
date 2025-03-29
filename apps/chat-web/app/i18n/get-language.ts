import { getTranslatedValue } from './use-translation-hook'

const getLanguageString = (languages: readonly string[]) => {
  return languages.find((language) => language.startsWith('de')) || 'en'
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

export { translate, getLanguage }
