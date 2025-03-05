import { createFileRoute } from '@tanstack/react-router'
import { t } from 'i18next'

const Home = () => {
  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <article className="prose prose-xl my-auto">
        <h1>{t('home.title')}</h1>
        <p>{t('home.paragraph')}</p>
      </article>
      <img
        src="george-portrait.jpg"
        alt={t('home.altImage')}
        className="max-w-96 block object-scale-down"
      />
    </div>
  )
}

export const Route = createFileRoute('/')({
  component: Home,
})
