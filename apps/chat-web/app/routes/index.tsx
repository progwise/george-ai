import { createFileRoute } from '@tanstack/react-router'
import { t } from 'i18next'

const Home = () => {
  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <article className="prose prose-xl my-auto">
        <h1>{t('home.title')}</h1>
        <p>{t('home.paragraph')}</p>
      </article>
      <img src="george-portrait.jpg" alt={t('home.altImage')} className="block max-w-96 object-scale-down" />
    </div>
  )
}

export const Route = createFileRoute('/')({
  component: Home,
})
