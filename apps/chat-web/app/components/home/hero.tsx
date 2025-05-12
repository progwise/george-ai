import { Link, useRouteContext } from '@tanstack/react-router'

import { useTranslation } from '../../i18n/use-translation-hook'
import { ArrowRight } from '../../icons/arrow-right'
import BotIcon from '../../icons/bot-icon'
import LibraryIcon from '../../icons/library-icon'
import SparklesIcon from '../../icons/sparkles-icon'
import { HeroBadge } from './hero-badge'
import { HomeChat } from './home-chat'

export const Hero = () => {
  const { user } = useRouteContext({ from: '/' })
  const { t } = useTranslation()

  return (
    <>
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
        <span className="badge badge-primary badge-lg badge-soft">
          <SparklesIcon />
          {t('hero.badge')}
        </span>
        <h1 className="text-4xl font-bold md:text-6xl lg:text-7xl">
          {t('hero.title.part1')}
          <br />
          <span className="from-base-content to-primary bg-gradient-to-r bg-clip-text text-transparent">
            {t('hero.title.part2')}
          </span>
        </h1>
        <p className="text-base-content/60 text-xl md:text-2xl">{t('hero.description')}</p>
        <div className="flex gap-2">
          <Link to="/conversations/$" className="btn btn-neutral">
            {t('hero.meeting')}
            <ArrowRight />
          </Link>
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
                <HomeChat user={user ?? null} />
              </div>
            </div>
          </div>

          <HeroBadge
            speed="fast"
            color="success"
            className="absolute -right-6 -top-6"
            icon={<BotIcon />}
            title={t('labels.assistant')}
            text={t('labels.active')}
          />

          <HeroBadge
            speed="slow"
            color="primary"
            className="animate-duration-[3000ms] absolute -bottom-6 -left-6"
            icon={<LibraryIcon />}
            title={t('labels.library')}
            text={`3 ${t('labels.files')}`}
          />
        </div>
      </div>
    </>
  )
}
