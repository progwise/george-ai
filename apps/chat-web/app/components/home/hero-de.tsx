import { Link } from '@tanstack/react-router'

import { User } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { HomeChat } from './home-chat'

interface HeroDeProps {
  user: Pick<User, 'email' | 'id' | 'name'> | null
}
export const HeroDe = ({ user }: HeroDeProps) => {
  const { t } = useTranslation()
  return (
    <section className="grid items-center bg-gradient-to-r from-cyan-900 to-sky-700 text-white sm:grid-cols-2">
      <div className="animate-fade-up px-10 py-8">
        <h1 className="mb-4 text-3xl font-bold lg:text-5xl">Wissensretter.</h1>
        <h2 className="large:text-2xl mb-6 text-xl font-medium text-blue-200">
          Unternehmen sichern - Geld, Zeit und Nerven sparen
        </h2>
        <p className="large:text-xl mb-8 text-lg">
          George-AI Assistenten speichern, was andere vergessen. Sie begleiten Schlüsselpersonen, lernen mit – und geben
          ihr Wissen nahtlos an Kollegen und Kunden weiter.
        </p>
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
          <a
            href="https://calendly.com/michael-vogt-progwise/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="animate-fade-up animate-delay-300 rounded-md bg-blue-600 px-8 py-3 text-center font-medium transition hover:bg-blue-700"
          >
            {t('hero.meeting')}
          </a>
          <Link
            to="/blog"
            className="animate-delay-400 animate-fade-up rounded-md border border-white px-8 py-3 text-center font-medium transition hover:bg-white hover:text-blue-800"
          >
            {t('hero.more')}
          </Link>
        </div>
      </div>
      <div className="animate-fade animate-delay-200 justify-items-end p-10">
        <HomeChat user={user} />{' '}
      </div>
    </section>
  )
}
