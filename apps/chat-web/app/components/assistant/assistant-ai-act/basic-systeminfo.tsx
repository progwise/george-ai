/* eslint-disable @eslint-react/hooks-extra/no-direct-set-state-in-use-effect */
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import React from 'react'
import { z } from 'zod'

import { cyrb53 } from '@george-ai/web-utils'

import { graphql } from '../../../gql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { backendRequest } from '../../../server-functions/backend'
import { LoadingSpinner } from '../../loading-spinner'
import { getChecklistStep1QueryOptions } from './checklist-server'
import QuestionCard from './question-card'

const updateBasicSystemInfo = createServerFn({ method: 'POST' })
  .validator((data: FormData) => {
    const entries = Object.fromEntries(data)
    return z
      .object({
        assistantId: z.string().nonempty(),
        questionId: z.string().nonempty(),
        value: z.string().optional(),
        notes: z.string().optional(),
      })
      .parse(entries)
  })
  .handler(async (ctx) => {
    const { assistantId, questionId, value, notes } = ctx.data
    return backendRequest(
      graphql(`
        mutation updateAssessmentQuestion($assistantId: String!, $questionId: String!, $value: String, $notes: String) {
          updateAssessmentQuestion(assistantId: $assistantId, questionId: $questionId, value: $value, notes: $notes)
        }
      `),
      { assistantId, questionId, value, notes },
    )
  })

const resetAssessment = createServerFn({ method: 'POST' })
  .validator((data: { assistantId: unknown }) => {
    return z
      .object({
        assistantId: z.string().nonempty(),
      })
      .parse(data)
  })
  .handler(async (ctx) => {
    const { assistantId } = ctx.data
    return backendRequest(
      graphql(`
        mutation resetAssessmentAnswers($assistantId: String!) {
          resetAssessmentAnswers(assistantId: $assistantId)
        }
      `),
      { assistantId },
    )
  })

// Basic System Info component for initial AI Act risk assessment
const BasicSystemInfoAssessment = () => {
  const { assistantId } = useParams({ strict: false })
  const { language } = useTranslation()
  const { data, isLoading, refetch } = useSuspenseQuery(getChecklistStep1QueryOptions(assistantId))
  const { mutate: update } = useMutation({
    mutationFn: async (formData: FormData) => {
      return await updateBasicSystemInfo({ data: formData })
    },
    onSettled: () => {
      refetch()
    },
  })
  const { mutate: reset } = useMutation({
    mutationFn: async () => {
      return await resetAssessment({ data: { assistantId } })
    },
    onSettled: () => {
      refetch()
    },
  })
  const formRef = React.useRef<HTMLFormElement>(null)

  const basicSystemInfo = data?.AiActAssessmentQuery?.basicSystemInfo
  const riskIndicator = basicSystemInfo?.riskIndicator
  const completionPercentage = basicSystemInfo?.percentCompleted

  // Handle response changes
  const handleResponseChange = (questionId: string, value?: string | null, notes?: string | null) => {
    const formData = new FormData(formRef.current!)
    formData.append('questionId', questionId)
    formData.append('value', value ?? '')
    formData.append('notes', notes ?? '')
    update(formData)
  }

  if (!basicSystemInfo || isLoading || !riskIndicator) {
    return <LoadingSpinner />
  }

  // Get risk indicator styling
  const getRiskStyle = () => {
    switch (riskIndicator?.level) {
      case 'high':
        return 'bg-orange-100 border-orange-500 text-orange-700'
      case 'medium':
        return 'bg-yellow-100 border-yellow-500 text-yellow-700'
      case 'low':
        return 'bg-green-100 border-green-500 text-green-700'
      case 'nonApplicable':
        return 'bg-blue-100 border-blue-500 text-blue-700'
      default:
        return 'bg-gray-100 border-gray-500 text-gray-700'
    }
  }

  // Get risk indicator icon
  const getRiskIcon = () => {
    switch (riskIndicator?.level) {
      case 'high':
        return '🟧'
      case 'medium':
        return '🟨'
      case 'low':
        return '🟩'
      case 'nonApplicable':
        return 'ℹ️'
      default:
        return '⬜'
    }
  }

  return (
    <div className="mx-auto max-w-2xl rounded-lg border border-gray-200 bg-white p-4 font-sans shadow">
      <h1 className="mb-4 flex items-center justify-between text-xl font-bold text-gray-800">
        <span>EU AI Act - Schritt 1: Grundlegende Systeminformationen</span>
        <span className="rounded bg-gray-100 px-2 py-1 text-sm font-normal">
          {basicSystemInfo.percentCompleted}% abgeschlossen
        </span>
      </h1>

      <div className="mb-4 rounded border border-blue-200 bg-blue-50 p-3 text-sm text-gray-600">
        Dieser erste Schritt hilft dabei, die Anwendbarkeit des EU AI Acts zu bestimmen und eine vorläufige
        Risikoeinschätzung vorzunehmen. Die Antworten dienen als Grundlage für die detaillierte Compliance-Prüfung.
      </div>

      {/* Risk Indicator */}
      {basicSystemInfo.percentCompleted === 100 && (
        <div className={`mb-6 rounded border p-3 ${getRiskStyle()}`}>
          <h2 className="text-md mb-2 font-semibold">Vorläufige Risikoeinstufung</h2>
          <div className="flex items-start">
            <span className="mr-2 mt-1 text-2xl">{getRiskIcon()}</span>
            <div>
              <p className="font-medium">{riskIndicator.description?.[language]}</p>
              {riskIndicator.factors && (
                <div className="mt-2">
                  <p className="text-sm font-medium">Risikofaktoren:</p>
                  <ul className="ml-1 list-inside list-disc text-sm">
                    {riskIndicator.factors.map((factor, index) => (
                      <li key={cyrb53(factor[language], index)}>{factor[language]}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
        <h2 className="text-md mb-2 font-semibold text-gray-700">Nächste Schritte</h2>
        <p className="mb-3 text-sm text-gray-600">
          Basierend auf Ihren Antworten sollten Sie folgende Maßnahmen in Betracht ziehen:
        </p>
        <ul className="mb-4 list-inside list-disc space-y-1 text-sm text-gray-600">
          {riskIndicator.level === 'high' && (
            <>
              <li>Vollständige Analyse aller Anforderungen des EU AI Acts durchführen</li>
              <li>Detaillierte Dokumentation des Systems vorbereiten</li>
              <li>Risikomanagementsystem einrichten</li>
              <li>Rechtliche Beratung in Anspruch nehmen</li>
            </>
          )}
          {riskIndicator.level === 'medium' && (
            <>
              <li>Spezifische Anforderungen basierend auf Ihrer Anwendung prüfen</li>
              <li>Transparenzanforderungen implementieren</li>
              <li>Risikobewertung dokumentieren</li>
            </>
          )}
          {riskIndicator.level === 'low' && (
            <>
              <li>Basis-Compliance-Maßnahmen umsetzen</li>
              <li>Transparenzanforderungen prüfen</li>
              <li>System regelmäßig neu bewerten</li>
            </>
          )}
          {riskIndicator.level === 'nonApplicable' && (
            <>
              <li>Prüfen Sie, ob indirekte Auswirkungen auf EU-Bürger bestehen</li>
              <li>Dokumentieren Sie Ihre Einschätzung zur Nicht-Anwendbarkeit</li>
              <li>Beobachten Sie Änderungen in der Anwendung Ihres Systems</li>
            </>
          )}
          {riskIndicator.level === 'undetermined' && (
            <li>Bitte beantworten Sie alle Fragen für eine Ersteinschätzung</li>
          )}
        </ul>

        <div className="mt-4x flex justify-between">
          <button
            type="button"
            className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300"
            onClick={() => {
              // Reset all responses
              reset()
            }}
          >
            Zurücksetzen
          </button>

          <button
            type="button"
            className={`px-3 py-1 ${
              completionPercentage === 100
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'cursor-not-allowed bg-gray-400 text-gray-200'
            } rounded text-sm`}
            disabled={completionPercentage !== 100}
          >
            Weiter zur detaillierten Bewertung
          </button>
        </div>
      </div>
    </div>
  )
}

// Question card component

export default BasicSystemInfoAssessment
