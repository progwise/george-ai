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
    <section className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4">
      <div className="rounded-box bg-base-200 p-3">
        <AssistantSurvey assessment={assessment} />
      </div>
      <div className="rounded-box bg-base-200 p-3">
        <RiskAreasIdentification assessment={assessment} />
      </div>
    </section>
  )
}
