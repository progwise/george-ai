import { Link, useRouteContext } from '@tanstack/react-router'

import { useTranslation } from '../../i18n/use-translation-hook'
import AcademicCapIcon from '../../icons/academic-cap-icon'
import { ArrowRightIcon } from '../../icons/arrow-right-icon'
import BotIcon from '../../icons/bot-icon'
import LibraryIcon from '../../icons/library-icon'
import SparklesIcon from '../../icons/sparkles-icon'
import { HeroBadge } from './hero-badge'
import { HomeChat } from './home-chat'

export const Hero = () => {
  const { user } = useRouteContext({ from: '/' })
  const { t, language } = useTranslation()

  const now = new Date()
  const year = now.getFullYear()
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')
  const assistantVersion = `${year}.${month}.${day}`

  const formatter = new Intl.NumberFormat(language)

  return (
    <>
      <div className="mx-auto my-5 flex w-full max-w-3xl flex-col gap-5 lg:my-10">
        <span className="badge badge-primary badge-lg badge-soft">
          <SparklesIcon />
          {t('hero.badge')}
        </span>
        <h1 className="text-pretty text-4xl font-bold md:text-6xl lg:text-7xl">
          {t('hero.title.part1')}
          <br />
          <span className="from-base-content to-primary bg-gradient-to-r bg-clip-text text-transparent print:text-black">
            {t('hero.title.part2')}
          </span>
        </h1>
        <p className="text-base-content/60 text-xl md:text-2xl">{t('hero.description')}</p>
        <div className="flex gap-2">
          <a
            href="https://calendly.com/michael-vogt-progwise/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-neutral"
          >
            {t('hero.meeting')}
            <ArrowRightIcon />
          </a>
          <Link to="/about" className="btn btn-outline">
            {t('hero.more')}
          </Link>
        </div>
        <ul className="text-base-content/60 flex flex-wrap gap-6 *:flex *:items-center *:gap-2">
          <li>
            <BotIcon /> {t('hero.features.customAssistants')}
          </li>
          <li>
            <LibraryIcon /> {t('hero.features.knowledgeLibraries')}
          </li>
          <li>
            <AcademicCapIcon /> {t('hero.features.selfLearning')}
          </li>
        </ul>
      </div>

      <div className="mx-auto w-full max-w-5xl px-6 py-16">
        <div className="mockup-browser bg-base-300 overflow-visible! relative text-sm shadow-2xl">
          <div className="mockup-browser-toolbar justify-between">
            <span>{t('hero.chat.title')}</span>
            <div className="w-20" />
          </div>
          <div className="bg-base-100 *:py-4! p-6">
            <div className="chat chat-start animate-fade-right">
              <div className="chat-image avatar avatar-placeholder">
                <div className="bg-neutral text-neutral-content size-8 rounded-full">
                  <span className="text-xs">G</span>
                </div>
              </div>
              <div className="chat-bubble">
                <p>{t('hero.chat.message.greeting')}</p>
                <p>{t('hero.chat.message.info')}</p>
              </div>
            </div>
            <div className="chat chat-end animate-fade-left animate-delay-500">
              <div className="chat-bubble w-full">
                <HomeChat user={user ?? undefined} />
              </div>
            </div>
          </div>

          <HeroBadge
            speed="fast"
            color="success"
            className="absolute -right-6 -top-6"
            icon={<BotIcon />}
            title={`Homepage ${t('labels.assistant')}`}
            text={`${t('labels.version')} ${assistantVersion}`}
          />

          <HeroBadge
            speed="slow"
            color="primary"
            className="animate-duration-[3000ms] absolute -bottom-6 -left-6"
            icon={<LibraryIcon />}
            title={`23 ${t('labels.libraries')}`}
            text={`${formatter.format(3723)} ${t('labels.files')}`}
          />
        </div>
      </div>
    </>
  )
}
