import { createFileRoute } from '@tanstack/react-router'

import { HomeDe } from '../components/home/home-de'
import { HomeEn } from '../components/home/home-en'
import { useTranslation } from '../i18n/use-translation-hook'

const Home = () => {
  const { language } = useTranslation()
  if (language === 'de') {
    return <HomeDe />
  }
  return <HomeEn />
}

export const Route = createFileRoute('/')({
  component: Home,
})
