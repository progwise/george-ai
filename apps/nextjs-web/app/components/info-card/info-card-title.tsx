import { PublicationState } from '@/src/gql/graphql'
import { FeedbackButtons } from './feedback-buttons'

interface InfoCardTitleProps {
  title: string
  publicationState: PublicationState
  language: string
  infoCardIndex: number
  summaryId: string
  largeLanguageModel: string
}

export const InfoCardTitle = ({
  title,
  publicationState,
  language,
  infoCardIndex,
  summaryId,
  largeLanguageModel,
}: InfoCardTitleProps) => {
  return (
    <div className="flex gap-4 justify-between">
      <div className="flex gap-2 items-center">
        <div className="flex gap-2 items-center">
          <span className="uppercase text-xs font-bold">{language}</span>
          {/*  TODO: A too-long {title} takes up more space than necessary after line-wrapping, which pushes the {publicationState} too far to the right. */}
          <h2 className="card-title" title={title}>
            {title}
          </h2>
        </div>
        <div className="capitalize btn btn-active  btn-accent btn-xs cursor-default">
          {publicationState}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="capitalize btn btn-active  btn-accent btn-xs cursor-default">
          {largeLanguageModel}
        </div>
        <FeedbackButtons infoCardIndex={infoCardIndex} summaryId={summaryId} />
      </div>
    </div>
  )
}
