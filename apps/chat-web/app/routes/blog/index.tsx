import { createFileRoute } from '@tanstack/react-router'

import { BlogDe } from '../../components/home/blog_de'
import { BlogEn } from '../../components/home/blog_en'
import { useTranslation } from '../../i18n/use-translation-hook'

const Blog = () => {
  const { language } = useTranslation()
  if (language === 'de') {
    return <BlogDe />
  }
  return <BlogEn />
}

export const Route = createFileRoute('/blog/')({
  component: Blog,
})
