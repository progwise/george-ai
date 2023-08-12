import { VoteButtons } from './vote-buttons'

type TitleProperties = {
  title: string
  publishedAt: string | null
}

export const Title = ({ title, publishedAt }: TitleProperties) => {
  return (
    <div className="flex justify-between">
      <div className="flex gap-2 items-center">
        <span className="font-bold text-lg">{title}</span>
        <div className="border border-black rounded-md px-6 bg-slate-100">
          {publishedAt ? 'published' : 'draft'}
        </div>
      </div>
      <VoteButtons />
    </div>
  )
}
