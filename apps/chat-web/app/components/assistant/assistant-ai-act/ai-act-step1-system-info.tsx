/* eslint-disable @eslint-react/hooks-extra/no-direct-set-state-in-use-effect */
import React, { useCallback, useEffect, useState } from 'react'

import { cyrb53 } from '@george-ai/web-utils'

interface AiActSystemInfo {
  systemType: { value: 'ML' | 'Rules' | 'Both' | null; notes: string }
  operationMode: { value: 'Autonomous' | 'Assisting' | null; notes: string }
  syntheticContent: { value: 'Yes' | 'No' | null; notes: string }
  gpaiModel: { value: 'Yes' | 'No' | 'Unsure' | null; notes: string }
  euOperation: { value: 'Yes' | 'No' | null; notes: string }
}

type AiActRiskIndicator = {
  level: 'high' | 'medium' | 'low' | 'nonApplicable' | 'undetermined'
  description: string
  factors?: string[]
}

// Basic System Info component for initial AI Act risk assessment
const BasicSystemInfoAssessment = () => {
  // State for the basic system information with predefined options
  const [systemInfo, setSystemInfo] = useState<AiActSystemInfo>({
    systemType: { value: null, notes: '' },
    operationMode: { value: null, notes: '' },
    syntheticContent: { value: null, notes: '' },
    gpaiModel: { value: null, notes: '' },
    euOperation: { value: null, notes: '' },
  })

  // Completion tracking state
  const [completionPercentage, setCompletionPercentage] = useState(0)
  const [riskIndicator, setRiskIndicator] = useState<AiActRiskIndicator>({
    level: 'undetermined',
    description: 'Bitte alle Fragen beantworten',
  })

  // Perform a preliminary risk assessment based on basic info
  const performRiskAssessment = useCallback(() => {
    let riskPoints = 0
    const riskFactors = []

    // Machine learning typically carries more risk than purely rule-based systems
    if (systemInfo.systemType.value === 'ML' || systemInfo.systemType.value === 'Both') {
      riskPoints += 2
      riskFactors.push('ML-basiertes System')
    }

    // Autonomous systems carry more risk than assistive ones
    if (systemInfo.operationMode.value === 'Autonomous') {
      riskPoints += 3
      riskFactors.push('Autonomes System')
    }

    // Synthetic content generation is a specific risk area in the AI Act
    if (systemInfo.syntheticContent.value === 'Yes') {
      riskPoints += 2
      riskFactors.push('Erzeugt synthetische Inhalte')
    }

    // GPAI models have specific requirements under the AI Act
    if (systemInfo.gpaiModel.value === 'Yes') {
      riskPoints += 2
      riskFactors.push('General Purpose AI Model')
    }

    // EU operation is a prerequisite for AI Act applicability
    if (systemInfo.euOperation.value === 'Yes') {
      riskPoints += 1
      riskFactors.push('Betrieb innerhalb der EU')
    } else {
      setRiskIndicator({
        level: 'nonApplicable',
        description: 'EU AI Act möglicherweise nicht anwendbar, da kein EU-Bezug',
      })
      return
    }

    // Set risk level based on points
    if (riskPoints >= 8) {
      setRiskIndicator({
        level: 'high',
        description: 'Potenziell hohes Risiko - detaillierte Prüfung erforderlich',
        factors: riskFactors,
      })
    } else if (riskPoints >= 5) {
      setRiskIndicator({
        level: 'medium',
        description: 'Mittleres Risiko - weitere Analyse notwendig',
        factors: riskFactors,
      })
    } else {
      setRiskIndicator({
        level: 'low',
        description: 'Niedriges Risiko - Basis-Compliance wahrscheinlich ausreichend',
        factors: riskFactors,
      })
    }
  }, [systemInfo])

  // Calculate completion and preliminary risk assessment
  useEffect(() => {
    // Count how many questions have been answered
    const questionCount = Object.keys(systemInfo).length
    const answeredCount = Object.values(systemInfo).filter((item) => item.value !== null).length
    const percentage = Math.round((answeredCount / questionCount) * 100)
    setCompletionPercentage(percentage)

    // Only perform risk assessment if all questions are answered
    if (percentage === 100) {
      performRiskAssessment()
    } else {
      setRiskIndicator({
        level: 'undetermined',
        description: 'Bitte alle Fragen beantworten',
      })
    }
  }, [performRiskAssessment, systemInfo])

  // Handle response changes
  const handleResponseChange = (question: string, value: string) => {
    switch(question) {
      case 'systemType':
        if (value === 'ML' || value === 'Both' || value === null) {
          setSystemInfo((prev) => {
            const newSystemInfo = { ...prev }
            newSystemInfo.systemType.value = value
            return newSystemInfo
          })}
          else {
            throw new Error('Invalid value for systemType')
          }
          break
      case 'operationMode':
        
    setSystemInfo((prev) => ({
      ...prev,
      [question]: {
        ...prev[question],
        value,
      },
    }))
  }

  // Handle notes changes
  const handleNotesChange = (question, notes) => {
    setSystemInfo((prev) => ({
      ...prev,
      [question]: {
        ...prev[question],
        notes,
      },
    }))
  }

  // Get risk indicator styling
  const getRiskStyle = () => {
    switch (riskIndicator.level) {
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
    switch (riskIndicator.level) {
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
        <span className="rounded bg-gray-100 px-2 py-1 text-sm font-normal">{completionPercentage}% abgeschlossen</span>
      </h1>

      <div className="mb-4 rounded border border-blue-200 bg-blue-50 p-3 text-sm text-gray-600">
        Dieser erste Schritt hilft dabei, die Anwendbarkeit des EU AI Acts zu bestimmen und eine vorläufige
        Risikoeinschätzung vorzunehmen. Die Antworten dienen als Grundlage für die detaillierte Compliance-Prüfung.
      </div>

      {/* Risk Indicator */}
      {completionPercentage === 100 && (
        <div className={`mb-6 rounded border p-3 ${getRiskStyle()}`}>
          <h2 className="text-md mb-2 font-semibold">Vorläufige Risikoeinstufung</h2>
          <div className="flex items-start">
            <span className="mr-2 mt-1 text-2xl">{getRiskIcon()}</span>
            <div>
              <p className="font-medium">{riskIndicator.description}</p>
              {riskIndicator.factors && (
                <div className="mt-2">
                  <p className="text-sm font-medium">Risikofaktoren:</p>
                  <ul className="ml-1 list-inside list-disc text-sm">
                    {riskIndicator.factors.map((factor, index) => (
                      <li key={cyrb53(factor, index)}>{factor}</li>
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
        {/* Question 1: System Type */}
        <QuestionCard
          question="Basiert Ihr System auf maschinellem Lernen oder regelbasierter Automatisierung?"
          hint="Systeme mit maschinellem Lernen nutzen Daten zur Selbstoptimierung, regelbasierte Systeme folgen vordefinierten Logiken"
          options={[
            { value: 'ML', label: 'Maschinelles Lernen' },
            { value: 'Rules', label: 'Regelbasiert' },
            { value: 'Both', label: 'Beides' },
          ]}
          selected={systemInfo.systemType.value}
          notes={systemInfo.systemType.notes}
          onResponseChange={(value) => handleResponseChange('systemType', value)}
          onNotesChange={(notes) => handleNotesChange('systemType', notes)}
        />

        {/* Question 2: Operation Mode */}
        <QuestionCard
          question="Arbeitet Ihr System autonom oder unterstützt es Menschen bei Entscheidungen?"
          hint="Autonome Systeme treffen Entscheidungen ohne menschlichen Eingriff, assistierende Systeme unterstützen menschliche Entscheider"
          options={[
            { value: 'Autonomous', label: 'Autonom' },
            { value: 'Assisting', label: 'Assistierend' },
          ]}
          selected={systemInfo.operationMode.value}
          notes={systemInfo.operationMode.notes}
          onResponseChange={(value) => handleResponseChange('operationMode', value)}
          onNotesChange={(notes) => handleNotesChange('operationMode', notes)}
        />

        {/* Question 3: Synthetic Content */}
        <QuestionCard
          question="Erzeugt es synthetische Inhalte (Text, Bild, Video, Code)?"
          hint="Systeme, die neue Inhalte generieren, unterliegen besonderen Transparenzpflichten"
          options={[
            { value: 'Yes', label: 'Ja' },
            { value: 'No', label: 'Nein' },
          ]}
          selected={systemInfo.syntheticContent.value}
          notes={systemInfo.syntheticContent.notes}
          onResponseChange={(value) => handleResponseChange('syntheticContent', value)}
          onNotesChange={(notes) => handleNotesChange('syntheticContent', notes)}
        />

        {/* Question 4: GPAI Model */}
        <QuestionCard
          question="Handelt es sich um ein General Purpose AI Model (GPAI)?"
          hint="GPAI-Modelle können für verschiedene Aufgaben eingesetzt werden und haben vielfältige Anwendungsmöglichkeiten (z.B. ChatGPT, Gemini, DALL-E)"
          options={[
            { value: 'Yes', label: 'Ja' },
            { value: 'No', label: 'Nein' },
            { value: 'Unsure', label: 'Nicht sicher' },
          ]}
          selected={systemInfo.gpaiModel.value}
          notes={systemInfo.gpaiModel.notes}
          onResponseChange={(value) => handleResponseChange('gpaiModel', value)}
          onNotesChange={(notes) => handleNotesChange('gpaiModel', notes)}
        />

        {/* Question 5: EU Operation */}
        <QuestionCard
          question="Wird das System innerhalb der EU betrieben oder hat es Auswirkungen auf Personen in der EU?"
          hint="Der EU AI Act ist anwendbar, wenn das System in der EU eingesetzt wird oder Auswirkungen auf in der EU befindliche Personen hat"
          options={[
            { value: 'Yes', label: 'Ja' },
            { value: 'No', label: 'Nein' },
          ]}
          selected={systemInfo.euOperation.value}
          notes={systemInfo.euOperation.notes}
          onResponseChange={(value) => handleResponseChange('euOperation', value)}
          onNotesChange={(notes) => handleNotesChange('euOperation', notes)}
        />
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

        <div className="mt-4 flex justify-between">
          <button
            className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300"
            onClick={() => {
              // Reset all responses
              const resetData = {}
              Object.keys(systemInfo).forEach((key) => {
                resetData[key] = { value: null, notes: '' }
              })
              setSystemInfo(resetData)
            }}
          >
            Zurücksetzen
          </button>

          <button
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

interface QuestionCardProps {
  question: string
  hint?: string
  options: { value: string; label: string }[]
  selected: string | null
  notes: string
  onResponseChange: (value: string) => void
  onNotesChange: (notes: string) => void
}
// Question card component
const QuestionCard = ({
  question,
  hint,
  options,
  selected,
  notes,
  onResponseChange,
  onNotesChange,
}: QuestionCardProps) => {
  const [showNotes, setShowNotes] = useState(false)

  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <div className="flex flex-col space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start">
            <span className="text-sm font-medium text-gray-700">{question}</span>
            {hint && (
              <div className="group relative ml-1">
                <span className="cursor-help text-xs text-gray-400">ℹ️</span>
                <div className="invisible absolute left-0 z-10 mt-1 w-64 rounded bg-gray-800 p-2 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:visible group-hover:opacity-100">
                  {hint}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowNotes(!showNotes)}
            className="rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 hover:text-blue-800"
          >
            {showNotes ? 'Notizen verbergen' : 'Notizen hinzufügen'}
          </button>
        </div>

        <div className="flex flex-wrap gap-3">
          {options.map((option) => (
            <label key={option.value} className="inline-flex items-center text-sm">
              <input
                type="radio"
                checked={selected === option.value}
                onChange={() => onResponseChange(option.value)}
                className="form-radio h-4 w-4 text-blue-600"
              />
              <span className="ml-2 text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>

        {/* Notes field */}
        {showNotes && (
          <div className="mt-2">
            <textarea
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="Zusätzliche Informationen oder Kontext..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows={2}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default BasicSystemInfoAssessment
