import { useSuspenseQuery } from '@tanstack/react-query'

import { LoadingSpinner } from '../../loading-spinner'
import { AssistantSurvey } from './assistant-survey'
import { getChecklistStep1QueryOptions } from './checklist-server'
import { RiskAreasIdentification } from './risk-identification'

interface AiActGuideProps {
  assistantId: string
}

export const AiActGuide = ({ assistantId }: AiActGuideProps) => {
  const { data, isLoading } = useSuspenseQuery(getChecklistStep1QueryOptions(assistantId))
  if (isLoading || !data) {
    return <LoadingSpinner />
  }
  return (
    <>
      <div className="card grid grow rounded-box bg-base-200 px-3 py-3 lg:w-1/2">
        <AssistantSurvey assessment={data.AiActAssessmentQuery} />
      </div>
      <div className="card grow rounded-box bg-base-200 px-3 py-3 lg:w-1/2">
        <RiskAreasIdentification assessment={data.AiActAssessmentQuery} />
      </div>
    </>
  )
}
