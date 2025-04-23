import { useSuspenseQuery } from '@tanstack/react-query'

import { LoadingSpinner } from '../../loading-spinner'
import { AssistantSurvey } from './assistant-survey'
import { getAiActAssessmentQueryOptions } from './checklist-server'
import { RiskAreasIdentification } from './risk-identification'

interface AiActGuideProps {
  assistantId: string
}

export const AiActGuide = ({ assistantId }: AiActGuideProps) => {
  const { data, isLoading } = useSuspenseQuery(getAiActAssessmentQueryOptions(assistantId))
  if (isLoading || !data) {
    return <LoadingSpinner />
  }
  const assessment = data.aiActAssessment
  return (
    <>
      <div className="rounded-box bg-base-200 p-3 sm:w-1/2">
        <AssistantSurvey assessment={assessment} />
      </div>
      <div className="rounded-box bg-base-200 p-3 sm:w-1/2">
        <RiskAreasIdentification assessment={assessment} />
      </div>
    </>
  )
}
