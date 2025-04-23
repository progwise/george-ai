import { useMutation, useQueryClient } from '@tanstack/react-query'
import React from 'react'

import { FragmentType, graphql, useFragment } from '../../../gql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { getAiActAssessmentQueryOptions, resetAssessment, updateBasicSystemInfo } from './checklist-server'
import QuestionCard from './question-card'

const AssistantSurvey_AssessmentFragment = graphql(`
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
        title {
          de
          en
        }
        notes
        value
        hint {
          de
          en
        }
        options {
          id
          title {
            de
            en
          }
          risk {
            riskLevel
            description {
              de
              en
            }
            points
          }
        }
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
  assessment: FragmentType<typeof AssistantSurvey_AssessmentFragment>
}

// Basic System Info component for initial AI Act risk assessment
export const AssistantSurvey = (props: AssistantSurveyProps) => {
  const queryClient = useQueryClient()
  const assessment = useFragment(AssistantSurvey_AssessmentFragment, props.assessment)
  const { assistantId, assistantSurvey } = assessment
  const { language, t } = useTranslation()

  const { mutate: update } = useMutation({
    mutationFn: async (formData: FormData) => {
      return await updateBasicSystemInfo({ data: formData })
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

  const riskIndicator = assistantSurvey.riskIndicator

  const handleResponseChange = (questionId: string, value?: string | null, notes?: string | null) => {
    const formData = new FormData(formRef.current!)
    formData.append('questionId', questionId)
    formData.append('value', value ?? '')
    formData.append('notes', notes ?? '')
    update(formData)
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 rounded-lg bg-base-100 p-4 shadow">
      <h3 className="flex items-center justify-between">
        <span className="text-xl font-bold">{assistantSurvey.title[language]}</span>
        <span className="min-w-[4em] rounded bg-base-200 p-2 text-sm">{assistantSurvey.percentCompleted}%</span>
      </h3>

      <div className="rounded border border-info bg-info/40 p-3 text-sm">{assistantSurvey.hint[language]}</div>

      {/* Basic System Information Questions */}

      <form ref={formRef} className="flex flex-col gap-2">
        <input type="hidden" name="assistantId" value={assistantId} />
        {assistantSurvey.questions.map((question) => (
          <QuestionCard
            key={`${question.id}-${question.value}`}
            question={question.title[language]}
            hint={question.hint[language]}
            options={question.options.map((option) => ({
              value: option.id,
              label: option.title[language],
            }))}
            selected={question.value}
            notes={question.notes}
            onResponseChange={(value, notes) => handleResponseChange(question.id, value, notes)}
          />
        ))}
      </form>

      {/* Next Steps */}
      <div className="flex flex-col gap-2 rounded-lg border bg-base-200 p-3">
        <h2 className="font-semibold">{t('labels.nextSteps')}</h2>
        <p className="text-sm">{assistantSurvey.actionsTitle[language]}</p>
        <ul className="list-inside list-disc text-sm">
          {assistantSurvey.actions
            .filter((action) => action.level === riskIndicator.level)
            .map((action) => (
              <li key={`${action.level}_${action.description[language]}`} className="font-semibold">
                {action.description[language]}
              </li>
            ))}
        </ul>

        <button
          type="button"
          className="btn btn-neutral btn-sm w-min self-end"
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
