import { createFileRoute } from '@tanstack/react-router'

import { HomeDe } from '../components/home/home-de'
import { HomeEn } from '../components/home/home-en'

const Home = () => {
  const { user, language } = Route.useRouteContext()
  if (language === 'de') {
    return <HomeDe user={user ?? null} />
  }
  return <HomeEn user={user ?? null} />
}

export const Route = createFileRoute('/')({
  component: Home,
})
