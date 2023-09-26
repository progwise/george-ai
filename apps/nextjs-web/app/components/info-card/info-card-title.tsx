import { PublicationState } from '@/src/gql/graphql'
import { FeedbackButtons } from './feedback-buttons'

interface InfoCardTitleProps {
  title: string
  publicationState: PublicationState
  language: string
  position: number
  webPageSummaryId: string
  largeLanguageModel: string
}

export const InfoCardTitle = ({
  title,
  publicationState,
  language,
  position,
  webPageSummaryId,
  largeLanguageModel,
}: InfoCardTitleProps) => {
  return (
    <div className="flex gap-4 justify-between">
      <div className="flex gap-2 items-center">
        <div className="flex gap-2 items-center">
          <span className="uppercase text-xs font-bold">{language}</span>
          {/*  TODO: A too-long {title} takes up more space than necessary after line-wrapping, which pushes the {publicationState} too far to the right. */}
          <span className="font-bold text-lg" title={title}>
            {title}
          </span>
        </div>
        <div className="border border-black text-xs rounded-md px-4 bg-slate-100">
          {publicationState}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="capitalize border whitespace-nowrap border-black text-xs rounded-md px-4 bg-slate-100">
          {largeLanguageModel}
        </div>
        <FeedbackButtons
          position={position}
          webPageSummaryId={webPageSummaryId}
        />
      </div>
    </div>
  )
}
