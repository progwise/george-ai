import { useMutation, useQueryClient } from '@tanstack/react-query'
import React from 'react'

import { FragmentType, graphql, useFragment } from '../../../gql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { LoadingSpinner } from '../../loading-spinner'
import { getChecklistStep1QueryOptions, resetAssessment, updateBasicSystemInfo } from './checklist-server'
import QuestionCard from './question-card'

const BasicSystemInfo_AssessmentFragment = graphql(`
  fragment BasicSystemInfo_Assessment on AiActAssessment {
    assistantId

    basicSystemInfo {
      navigation {
        title {
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
        factors {
          de
          en
        }
        level
      }
    }
  }
`)

export interface BasicSystemInfoAssessmentProps {
  assessment: FragmentType<typeof BasicSystemInfo_AssessmentFragment>
}

// Basic System Info component for initial AI Act risk assessment
export const BasicSystemInfoAssessment = (props: BasicSystemInfoAssessmentProps) => {
  const queryClient = useQueryClient()
  const assessment = useFragment(BasicSystemInfo_AssessmentFragment, props.assessment)
  const { assistantId, basicSystemInfo } = assessment
  const { language, t } = useTranslation()

  const { mutate: update } = useMutation({
    mutationFn: async (formData: FormData) => {
      return await updateBasicSystemInfo({ data: formData })
    },
    onSettled: () => {
      queryClient.invalidateQueries(getChecklistStep1QueryOptions(assistantId))
    },
  })

  const { mutate: reset } = useMutation({
    mutationFn: async () => {
      return await resetAssessment({ data: { assistantId } })
    },
    onSettled: () => {
      queryClient.invalidateQueries(getChecklistStep1QueryOptions(assistantId))
    },
  })

  const formRef = React.useRef<HTMLFormElement>(null)

  const riskIndicator = basicSystemInfo?.riskIndicator
  const navigation = basicSystemInfo?.navigation

  const handleResponseChange = (questionId: string, value?: string | null, notes?: string | null) => {
    const formData = new FormData(formRef.current!)
    formData.append('questionId', questionId)
    formData.append('value', value ?? '')
    formData.append('notes', notes ?? '')
    update(formData)
  }

  if (!basicSystemInfo || !riskIndicator || !navigation) {
    return <LoadingSpinner />
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 rounded-lg bg-base-100 p-4 shadow">
      <div className="flex items-center justify-between">
        <span className="text-xl font-bold">{basicSystemInfo.title[language]}</span>
        <span className="rounded bg-base-200 p-2 text-sm">
          {basicSystemInfo.percentCompleted}% {t('labels.completed')}
        </span>
      </div>

      <div className="rounded border border-info bg-info/50 p-3 text-sm">{basicSystemInfo.hint[language]}</div>

      <form ref={formRef} className="flex flex-col gap-2">
        <input type="hidden" name="assistantId" value={assistantId} />
        {basicSystemInfo.questions?.map((question) => (
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

      <div className="flex flex-col gap-2 rounded-lg border bg-base-200 p-3">
        <h2 className="font-semibold">{t('labels.nextSteps')}</h2>
        <p className="text-sm">{navigation.title[language]}</p>
        <ul className="list-inside list-disc text-sm">
          {navigation.actions
            .filter((action) => action.level === riskIndicator.level)
            .map((action) => (
              <li key={`${action.level}_${action.description[language]}`} className="font-semibold">
                {action.description[language]}
              </li>
            ))}
        </ul>
        <input
          type="reset"
          value={t('labels.reset')}
          className="btn btn-neutral btn-sm w-min"
          onClick={() => {
            reset()
          }}
        />
      </div>
    </div>
  )
}
