import { getTranslatedValue } from './use-translation-hook'

const getLanguage = async () => {
  if (typeof window !== 'undefined') {
    return window.navigator.language === 'de' ? 'de' : 'en'
  }
  try {
    const vinxiModule = await import('vinxi/http')
    const headers = vinxiModule.getHeaders()
    const languages = headers['accept-language']
    const language = languages?.split(',')[0] || 'en'
    return language === 'de' ? 'de' : 'en'
  } catch (e) {
    console.log('error', e)
    throw new Error('Could not determine language')
  }
}

const translate = (key: string, language: 'en' | 'de') => {
  return getTranslatedValue(key, language === 'de' ? 'de' : 'en')
}

export { translate, getLanguage }
