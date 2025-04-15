/* eslint-disable @eslint-react/hooks-extra/no-direct-set-state-in-use-effect */
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
          en
          de
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
        en
        de
      }
      percentCompleted
      hint {
        en
        de
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

  // Handle response changes
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
    <div className="mx-auto max-w-2xl rounded-lg border border-gray-200 bg-white p-4 font-sans shadow">
      <h1 className="mb-4 flex items-center justify-between text-xl font-bold text-gray-800">
        <span>{basicSystemInfo.title[language]}</span>
        <span className="rounded bg-gray-100 px-2 py-1 text-sm font-normal">
          {basicSystemInfo.percentCompleted}% {t('labels.completed')}
        </span>
      </h1>

      <div className="mb-4 rounded border border-blue-200 bg-blue-50 p-3 text-sm text-gray-600">
        {basicSystemInfo.hint[language]}
      </div>

      {/* Basic System Information Questions */}
      <div className="mb-6 space-y-4">
        <form ref={formRef}>
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
      </div>

      {/* Next Steps */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h2 className="text-md mb-2 font-semibold text-gray-700">{t('labels.nextSteps')}</h2>
        <p className="mb-3 text-sm text-gray-600">{navigation.title[language]}</p>
        <ul className="mb-4 list-inside list-disc space-y-1 text-sm text-gray-600">
          {navigation.actions
            .filter((action) => action.level === riskIndicator.level)
            .map((action) => (
              <li
                key={`${action.level}_${action.description[language]}`}
                className="text-sm font-semibold text-gray-700"
              >
                {action.description[language]}
              </li>
            ))}
        </ul>

        <div className="mt-4x flex justify-between">
          <button
            type="button"
            className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300"
            onClick={() => {
              reset()
            }}
          >
            {t('labels.reset')}
          </button>
        </div>
      </div>
    </div>
  )
}
