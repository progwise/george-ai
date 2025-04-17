import de from './de'
import en from './en'

export const getTranslatedValue = (
  key: string,
  language: 'en' | 'de',
  values?: Record<string, string | number>,
): string => {
  const keys = key.split('.')
  let currentObject: Record<string, unknown> | undefined = language === 'de' ? de : en
  keys.forEach((k) => {
    if (typeof currentObject === 'object' && currentObject !== null && k in currentObject) {
      currentObject = (currentObject as Record<string, unknown>)[k] as Record<string, unknown>
    } else {
      currentObject = undefined
    }
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
