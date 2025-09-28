import { createFileRoute } from '@tanstack/react-router'

import { AboutDe } from '../components/home/about_de'
import { AboutEn } from '../components/home/about_en'
import { useTranslation } from '../i18n/use-translation-hook'

const About = () => {
  const { language } = useTranslation()
  if (language === 'de') {
    return <AboutDe />
  }
  return <AboutEn />
}

export const Route = createFileRoute('/about')({
  component: About,
})
