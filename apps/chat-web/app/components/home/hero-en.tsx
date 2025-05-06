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
    <section
      className="grid items-center rounded-box bg-gradient-to-r from-cyan-900 to-sky-700 text-white sm:grid-cols-2"
      data-theme="dark"
    >
      <div className="animate-fade-up px-10 py-8">
        <h1 className="mb-4 text-3xl font-bold lg:text-5xl">Knowledge Saver.</h1>
        <h2 className="large:text-2xl mb-6 text-xl font-medium text-blue-200">
          Protect your business – save money, time, and nerves
        </h2>
        <p className="large:text-xl mb-8 text-lg">
          George-AI assistants remember what others forget. They support key personnel, learn along the way – and pass
          their knowledge on seamlessly to colleagues and customers.
        </p>
        <div className="flex flex-col flex-wrap gap-4 sm:flex-row">
          <a
            href="https://calendly.com/michael-vogt-progwise/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-info animate-fade-up transition animate-delay-300"
          >
            {t('hero.meeting')}
          </a>
          <Link
            to="/blog"
            className="animate-delay-400 btn btn-outline btn-neutral animate-fade-up transition"
            // This will changed in daisyui 5
            style={{ '--fallback-bc': 'white' } as React.CSSProperties}
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
