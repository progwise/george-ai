import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

const resources = {
  en: {
    translation: {
      brand: 'George-Ai',
      chat: 'Chat',
      assistants: 'Assistants',
      signIn: 'Sign in',
      signOut: 'Sign out',
      flowSequential: 'Flow: Sequential',
      flowParallel: 'Flow: Parallel',
      flowLocal: 'Flow: Only Local',
      flowWeb: 'Flow: Only Web',
      resetConversation: 'Reset conversation',
      greeting: 'Hello, I am your travel assistant. How can I help you?',
      library: 'Library',

      home: {
        title: 'Your AI. Your Data. Your Rules.',
        paragraph: `Meet George-AI: a custom-trained AI assistant tailored to your 
        business needs. Create unique content, handle customer interactions, 
        and streamline workflows — all powered by your own data sources and 
        fully compliant with European data protection standards.`,
        btnText: 'Start Training Your AI',
        altImage: 'George AI',
      },
    },
  },
  de: {
    translation: {
      brand: 'George-Ai',
      chat: 'Chat',
      assistants: 'Assistenten',
      signIn: 'Anmelden',
      signOut: 'Abmelden',
      flowSequential: 'Ablauf: Sequenziell',
      flowParallel: 'Ablauf: Parallel',
      flowLocal: 'Ablauf: Nur Lokal',
      flowWeb: 'Ablauf: Nur Web',
      resetConversation: 'Konversation zurücksetzen',
      greeting: 'Hallo, ich bin Ihr Reiseassistent. Wie kann ich Ihnen helfen?',
      library: 'Bibliothek',

      home: {
        title: 'Ihre KI. Ihre Daten. Ihre Regeln.',
        paragraph: `Lernen Sie George-AI kennen: Ein maßgeschneiderter KI-Assistent, 
            zugeschnitten auf Ihre Geschäftsanforderungen. Erstellen Sie einzigartige 
            Inhalte, verwalten Sie Kundeninteraktionen und optimieren Sie Workflows — 
            alles basierend auf Ihren eigenen Datenquellen und vollständig konform mit 
            europäischen Datenschutzbestimmungen.`,
        btnText: 'KI-Training starten',
        altImage: 'George KI',
      },
    },
  },
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
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
