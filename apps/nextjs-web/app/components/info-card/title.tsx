import { FeedbackButtons } from './feedback-buttons'

interface TitleProperties {
  title: string
  publishedAt: string | null
  feedback: 'up' | 'down' | undefined
}

export const Title = ({ title, publishedAt, feedback }: TitleProperties) => {
  return (
    <div className="flex justify-between">
      <div className="flex gap-2 items-center">
        <span className="font-bold text-lg">{title}</span>
        <div className="border border-black text-xs rounded-md px-4 bg-slate-100">
          {publishedAt ? 'published' : 'draft'}
        </div>
      </div>
      <FeedbackButtons feedback={feedback} />
    </div>
  )
}
