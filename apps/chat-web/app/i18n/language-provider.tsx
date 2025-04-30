import React, { createContext, use, useMemo, useState } from 'react'

const LANGUAGE_COOKIE_NAME = 'preferred-language'

const getLanguageFromCookie = (): 'en' | 'de' => {
  const cookies = Object.fromEntries(document.cookie.split('; ').map((cookie) => cookie.split('=') as [string, string]))
  return (cookies[LANGUAGE_COOKIE_NAME] as 'en' | 'de') || 'en'
}

const setLanguageInCookie = (language: 'en' | 'de') =>
  (document.cookie = `${LANGUAGE_COOKIE_NAME}=${language}; path=/; max-age=31536000`)

interface LanguageContextProps {
  language: 'en' | 'de'
  setLanguage: (language: 'en' | 'de') => void
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined)

interface LanguageProviderProps {
  initialLanguage?: 'en' | 'de'
  children: React.ReactNode
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children, initialLanguage }) => {
  const [language, setLanguage] = useState<'en' | 'de'>(() => initialLanguage ?? getLanguageFromCookie())

  const updateLanguage = (newLanguage: 'en' | 'de') => {
    setLanguage(newLanguage)
    setLanguageInCookie(newLanguage)
  }

  const contextValue = useMemo(() => ({ language, setLanguage: updateLanguage }), [language])
  return <LanguageContext value={contextValue}>{children}</LanguageContext>
}

export const useLanguage = () => {
  const context = use(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
