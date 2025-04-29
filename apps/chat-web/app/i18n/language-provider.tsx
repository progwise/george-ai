import React, { createContext, use, useEffect, useMemo, useState } from 'react'

const LANGUAGE_COOKIE_NAME = 'preferred-language'

const getLanguageFromCookie = (): 'en' | 'de' => {
  if (typeof document === 'undefined') {
    return 'en'
  }
  const match = document.cookie.match(new RegExp(`(^| )${LANGUAGE_COOKIE_NAME}=([^;]+)`))
  return match ? (match[2] as 'en' | 'de') : 'en'
}

const setLanguageInCookie = (language: 'en' | 'de') => {
  document.cookie = `${LANGUAGE_COOKIE_NAME}=${language}; path=/; max-age=31536000`
}

interface LanguageContextProps {
  language: 'en' | 'de'
  setLanguage: (language: 'en' | 'de') => void
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined)

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<'en' | 'de'>(() => getLanguageFromCookie())

  const updateLanguage = (newLanguage: 'en' | 'de') => {
    setLanguage(newLanguage)
    setLanguageInCookie(newLanguage)
  }

  useEffect(() => {
    setLanguageInCookie(language)
  }, [language])

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
