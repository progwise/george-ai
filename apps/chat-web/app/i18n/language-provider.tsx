import { createServerFn } from '@tanstack/react-start'
import { getCookie } from '@tanstack/react-start/server'
import React, { createContext, use, useMemo, useState } from 'react'

import { Language } from './index'

const LANGUAGE_COOKIE_NAME = 'preferred-language'

export const getLanguage = createServerFn({ method: 'GET' }).handler(() => getCookie(LANGUAGE_COOKIE_NAME) || 'en')

const setLanguageInCookie = (language: Language) =>
  (document.cookie = `${LANGUAGE_COOKIE_NAME}=${language}; path=/; max-age=31536000`)

interface LanguageContextProps {
  language: Language
  setLanguage: (language: Language) => void
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined)

interface LanguageProviderProps {
  initialLanguage: Language
  children: React.ReactNode
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children, initialLanguage }) => {
  const [language, setLanguage] = useState<Language>(initialLanguage)

  const updateLanguage = (newLanguage: Language) => {
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
