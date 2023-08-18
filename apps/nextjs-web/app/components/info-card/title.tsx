import { Feedback } from '@/src/gql/graphql'
import { FeedbackButtons } from './feedback-buttons'

interface TitleProps {
  title: string
  publishedAt: string | null
  locale: string
  feedback?: Feedback | null
}

export const Title = ({ title, publishedAt, feedback, locale }: TitleProps) => {
  return (
    <div className="flex gap-2 justify-between">
      <div className="flex gap-2 items-center">
        <div className="flex gap-2 items-center">
          <span className="uppercase text-xs font-bold">{locale}</span>
          <span className="font-bold line-clamp-1 text-lg" title={title}>
            {title}
          </span>
        </div>
        <div className="border border-black text-xs rounded-md px-4 bg-slate-100">
          {publishedAt ? 'published' : 'draft'}
        </div>
      </div>
      <FeedbackButtons feedback={feedback ?? undefined} />
    </div>
  )
}
