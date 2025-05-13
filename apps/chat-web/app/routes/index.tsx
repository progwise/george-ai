import { createFileRoute } from '@tanstack/react-router'

import { HomeDe } from '../components/home/home-de'
import { HomeEn } from '../components/home/home-en'

const Home = () => {
  const { language } = Route.useRouteContext()
  if (language === 'de') {
    return <HomeDe />
  }
  return <HomeEn />
}

export const Route = createFileRoute('/')({
  component: Home,
})
