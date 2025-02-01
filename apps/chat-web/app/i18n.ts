import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

const resources = {
  en: {
    translation: {
      brand: 'George Ai',
      chat: 'Chat',
      assistants: 'Assistants',
      signIn: 'Sign in',
      signOut: 'Sign out',
      flowSequential: 'Flow: Sequential',
      flowParallel: 'Flow: Parallel',
      flowLocal: 'Flow: Only Local',
      flowWeb: 'Flow: Only Web',
      resetConversation: 'Reset conversation',
    },
  },
  de: {
    translation: {
      brand: 'George Ai',
      chat: 'Chat',
      assistants: 'Assistenten',
      signIn: 'Anmelden',
      signOut: 'Abmelden',
      flowSequential: 'Ablauf: Sequenziell',
      flowParallel: 'Ablauf: Parallel',
      flowLocal: 'Ablauf: Nur Lokal',
      flowWeb: 'Ablauf: Nur Web',
      resetConversation: 'Konversation zurücksetzen',
    },
  },
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'de',
    interpolation: {
      escapeValue: false, // React already does XSS protection
    },
    detection: {
      // optional config for i18next-browser-languagedetector
      order: [
        'navigator',
        'htmlTag',
        'cookie',
        'localStorage',
        'path',
        'subdomain',
      ],
      caches: ['cookie'],
    },
  })

export default i18n
