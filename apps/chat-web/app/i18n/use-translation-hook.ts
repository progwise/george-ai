import de from './de'
import en from './en'
import { Language } from './index'
import { useLanguage } from './use-language-hook'

const getTranslatedValue = (key: string, language: Language, values?: Record<string, string | number>): string => {
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
  const { language } = useLanguage()

  const t = (key: string, values?: Record<string, string | number>) => {
    try {
      return getTranslatedValue(key, language, values)
    } catch (e) {
      console.error(`Translation key not found: ${e}`, language)
      return key
    }
  }

  return { t, language }
}

export { getTranslatedValue, useTranslation }
