import { VoteButtons } from './vote-buttons'

interface TitleProperties {
  title: string
  publishedAt: string | null
  voteResult: 'up' | 'down' | undefined
}

export const Title = ({ title, publishedAt, voteResult }: TitleProperties) => {
  return (
    <div className="flex justify-between">
      <div className="flex gap-2 items-center">
        <span className="font-bold text-lg">{title}</span>
        <div className="border border-black rounded-md px-6 bg-slate-100">
          {publishedAt ? 'published' : 'draft'}
        </div>
      </div>
      <VoteButtons voteResult={voteResult} />
    </div>
  )
}
