import { useMutation, useQueryClient } from '@tanstack/react-query'
import React from 'react'

import { graphql } from '../../../gql'
import { AssistantSurvey_AssessmentFragment } from '../../../gql/graphql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { getAiActAssessmentQueryOptions, resetAssessment, updateBasicSystemInfo } from './checklist-server'
import QuestionCard from './question-card'

graphql(`
  fragment AssistantSurvey_Assessment on AiActAssessment {
    assistantId

    assistantSurvey {
      actionsTitle {
        de
        en
      }
      actions {
        level
        description {
          de
          en
        }
      }
      questions {
        id
        ...QuestionCard_Question
      }
      title {
        de
        en
      }
      percentCompleted
      hint {
        de
        en
      }
      riskIndicator {
        description {
          de
          en
        }
        level
      }
    }
  }
`)

export interface AssistantSurveyProps {
  assessment: AssistantSurvey_AssessmentFragment
}

// Basic System Info component for initial AI Act risk assessment
export const AssistantSurvey = ({ assessment }: AssistantSurveyProps) => {
  const queryClient = useQueryClient()
  const { assistantId, assistantSurvey } = assessment
  const { language, t } = useTranslation()

  const { mutate: update } = useMutation({
    mutationFn: async ({ questionId, value, notes }: { questionId: string; value?: string; notes?: string }) => {
      return await updateBasicSystemInfo({ data: { assistantId, questionId, value, notes } })
    },
    onSettled: () => {
      queryClient.invalidateQueries(getAiActAssessmentQueryOptions(assistantId))
    },
  })

  const { mutate: reset } = useMutation({
    mutationFn: async () => {
      return await resetAssessment({ data: { assistantId } })
    },
    onSettled: () => {
      queryClient.invalidateQueries(getAiActAssessmentQueryOptions(assistantId))
    },
  })
  const formRef = React.useRef<HTMLFormElement>(null)

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 rounded-lg bg-base-100 p-4 shadow-sm">
      <h3 className="flex items-center justify-between">
        <span className="text-xl font-bold">{assistantSurvey.title[language]}</span>
        <span className="min-w-[4em] rounded-sm bg-base-200 p-2 text-sm">{assistantSurvey.percentCompleted}%</span>
      </h3>

      <div className="rounded-sm border border-info bg-info/40 p-3 text-sm">{assistantSurvey.hint[language]}</div>

      {/* Basic System Information Questions */}

      <form ref={formRef} className="flex flex-col gap-2">
        <input type="hidden" name="assistantId" value={assistantId} />
        {assistantSurvey.questions.map((question) => (
          <QuestionCard
            key={`${question.id}`}
            question={question}
            onResponseChange={(value, notes) =>
              update({ questionId: question.id, value: value || undefined, notes: notes || undefined })
            }
          />
        ))}
      </form>

      {/* Next Steps */}
      <div className="flex flex-col gap-2 rounded-lg border bg-base-200 p-3">
        <h2 className="font-semibold">{t('labels.nextSteps')}</h2>
        <p className="text-sm">{assistantSurvey.actionsTitle[language]}</p>
        <ul className="list-inside list-disc text-sm">
          {assistantSurvey.actions.map((action) => (
            <li key={`${action.level}_${action.description[language]}`} className="font-semibold">
              {action.description[language]}
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="btn w-min self-end btn-sm btn-neutral"
          onClick={() => {
            reset()
          }}
        >
          {t('labels.reset')}
        </button>
      </div>
    </div>
  )
}
