import { Link } from '@tanstack/react-router'

import { User } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { HomeChat } from './home-chat'

interface HeroEnProps {
  user: Pick<User, 'email' | 'id' | 'name'> | null
}
export const HeroEn = ({ user }: HeroEnProps) => {
  const { t } = useTranslation()
  return (
    <section className="grid items-center bg-gradient-to-r from-cyan-900 to-sky-700 text-white sm:grid-cols-2">
      <div className="animate-fade-up p-10">
        <h1 className="mb-4 text-5xl font-bold">Knowledge Saver.</h1>
        <h2 className="mb-6 text-2xl font-medium text-blue-200">
          Protect your business – save money, time, and nerves
        </h2>
        <p className="mb-8 text-xl">
          George-AI assistants remember what others forget. They support key personnel, learn along the way – and pass
          their knowledge on seamlessly to colleagues and customers.
        </p>
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
          <a
            href="https://calendly.com/michael-vogt-progwise/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="animate-fade-up rounded-md bg-blue-600 px-8 py-3 text-center font-medium transition animate-delay-300 hover:bg-blue-700"
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
      <div className="animate-fade justify-items-end p-10 animate-delay-200">
        <HomeChat user={user} />
      </div>
    </section>
  )
}
