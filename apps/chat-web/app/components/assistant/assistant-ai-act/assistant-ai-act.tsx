import React, { ChangeEvent, useEffect, useState } from 'react'

interface ChecklistData2 {
  [key: string]: {
    [key: string]: boolean
  }
}

const AssistantAiAct = () => {
  // Persistent state for checklist items
  const [checklistData, setChecklistData] = useState<ChecklistData2>({
    systemOverview: {
      decisionProcess: false,
      personalData: false,
      humanDecisions: false,
      safetyCritical: false,
    },
    transparency: {
      aiDisclosure: false,
      traceability: false,
      humanOverride: false,
      accessControl: false,
    },
    dataAndTraining: {
      individualTraining: false,
      dataSources: false,
      biasCheck: false,
      dataProcessing: false,
    },
    documentation: {
      technicalDocs: false,
      riskAssessment: false,
      auditCapability: false,
      securityMeasures: false,
    },
  })

  // Calculate risk level based on checkboxes
  const [riskLevel, setRiskLevel] = useState('minimal')
  const [completionPercentage, setCompletionPercentage] = useState(0)

  useEffect(() => {
    // Calculate completion percentage
    const allChecks = Object.values(checklistData).flatMap((section) => Object.values(section))
    const completedChecks = allChecks.filter(Boolean).length
    const percentage = Math.round((completedChecks / allChecks.length) * 100)
    setCompletionPercentage(percentage)

    // Calculate risk level
    if (checklistData.systemOverview.safetyCritical && checklistData.systemOverview.humanDecisions) {
      setRiskLevel('high')
    } else if (checklistData.systemOverview.personalData && checklistData.systemOverview.decisionProcess) {
      setRiskLevel('limited')
    } else {
      setRiskLevel('minimal')
    }
  }, [checklistData])

  // Handle checkbox changes
  const handleCheckboxChange = (section: string, item: string) => {
    setChecklistData((old) => {
      const newData = { ...old }
      newData[section][item] = !old[section][item]
      return newData
    })
  }

  // Risk level styling
  const getRiskStyle = () => {
    switch (riskLevel) {
      case 'high':
        return 'bg-orange-100 border-orange-500 text-orange-700'
      case 'limited':
        return 'bg-yellow-100 border-yellow-500 text-yellow-700'
      case 'minimal':
        return 'bg-green-100 border-green-500 text-green-700'
      case 'forbidden':
        return 'bg-red-100 border-red-500 text-red-700'
      default:
        return 'bg-gray-100 border-gray-500 text-gray-700'
    }
  }

  // Risk level icon
  const getRiskIcon = () => {
    switch (riskLevel) {
      case 'high':
        return '🟧'
      case 'limited':
        return '🟨'
      case 'minimal':
        return '🟩'
      case 'forbidden':
        return '🟥'
      default:
        return '⬜'
    }
  }

  return (
    <div className="mx-auto max-w-2xl rounded-lg border border-gray-200 bg-white p-4 font-sans shadow">
      <h1 className="mb-4 flex items-center justify-between text-xl font-bold text-gray-800">
        <span>EU AI Act Compliance Checklist</span>
        <span className="rounded bg-gray-100 px-2 py-1 text-sm font-normal">{completionPercentage}% abgeschlossen</span>
      </h1>

      {/* System Overview Section */}
      <div className="mb-6 border-b pb-4">
        <h2 className="text-md mb-2 font-semibold text-gray-700">🔹 System Overview</h2>
        <div className="space-y-2">
          <CheckItem
            label="Beschreibt der Assistent einen KI-basierten Entscheidungsprozess?"
            checked={checklistData.systemOverview.decisionProcess}
            onChange={() => handleCheckboxChange('systemOverview', 'decisionProcess')}
          />
          <CheckItem
            label="Verarbeitet der Assistent personenbezogene Daten?"
            checked={checklistData.systemOverview.personalData}
            onChange={() => handleCheckboxChange('systemOverview', 'personalData')}
          />
          <CheckItem
            label="Hat der Assistent Einfluss auf Entscheidungen über Menschen?"
            checked={checklistData.systemOverview.humanDecisions}
            onChange={() => handleCheckboxChange('systemOverview', 'humanDecisions')}
          />
          <CheckItem
            label="Wird der Assistent in einem sicherheitskritischen Umfeld eingesetzt?"
            checked={checklistData.systemOverview.safetyCritical}
            onChange={() => handleCheckboxChange('systemOverview', 'safetyCritical')}
          />
        </div>
      </div>

      {/* Risk Classification */}
      <div className={`mb-6 rounded border p-3 ${getRiskStyle()}`}>
        <h2 className="text-md mb-2 font-semibold">Risikoklassifikation</h2>
        <div className="flex items-center">
          <span className="mr-2 text-2xl">{getRiskIcon()}</span>
          <div>
            <p className="font-medium">
              {riskLevel === 'high'
                ? 'Hochrisiko'
                : riskLevel === 'limited'
                  ? 'Begrenzt'
                  : riskLevel === 'minimal'
                    ? 'Minimal'
                    : 'Verboten'}
            </p>
            <p className="text-sm">
              {riskLevel === 'high'
                ? 'Zusätzliche Pflichten erforderlich'
                : riskLevel === 'limited'
                  ? 'Transparenzpflichten erforderlich'
                  : riskLevel === 'minimal'
                    ? 'Geringe oder keine Risiken laut Gesetz'
                    : 'Nicht zulässig unter dem EU AI Act'}
            </p>
          </div>
        </div>
      </div>

      {/* Transparency & Control Section */}
      <div className="mb-6 border-b pb-4">
        <h2 className="text-md mb-2 font-semibold text-gray-700">🔹 Transparenz & Kontrolle</h2>
        <div className="space-y-2">
          <CheckItem
            label="Wird der Nutzer darüber informiert, dass er mit KI interagiert?"
            checked={checklistData.transparency.aiDisclosure}
            onChange={() => handleCheckboxChange('transparency', 'aiDisclosure')}
          />
          <CheckItem
            label="Gibt es eine Möglichkeit zur Nachvollziehbarkeit der Antworten?"
            checked={checklistData.transparency.traceability}
            onChange={() => handleCheckboxChange('transparency', 'traceability')}
          />
          <CheckItem
            label="Können Entscheidungen vom Menschen übersteuert werden?"
            checked={checklistData.transparency.humanOverride}
            onChange={() => handleCheckboxChange('transparency', 'humanOverride')}
          />
          <CheckItem
            label="Gibt es Zugriffs- oder Rollenbeschränkungen?"
            checked={checklistData.transparency.accessControl}
            onChange={() => handleCheckboxChange('transparency', 'accessControl')}
          />
        </div>
      </div>

      {/* Data & Training Section */}
      <div className="mb-6 border-b pb-4">
        <h2 className="text-md mb-2 font-semibold text-gray-700">🔹 Daten & Training</h2>
        <div className="space-y-2">
          <CheckItem
            label="Wird das System individuell trainiert?"
            checked={checklistData.dataAndTraining.individualTraining}
            onChange={() => handleCheckboxChange('dataAndTraining', 'individualTraining')}
          />
          <CheckItem
            label="Gibt es einen Überblick über die verwendeten Trainingsdatenquellen?"
            checked={checklistData.dataAndTraining.dataSources}
            onChange={() => handleCheckboxChange('dataAndTraining', 'dataSources')}
          />
          <CheckItem
            label="Wird Bias aktiv überprüft?"
            checked={checklistData.dataAndTraining.biasCheck}
            onChange={() => handleCheckboxChange('dataAndTraining', 'biasCheck')}
          />
          <CheckItem
            label="Gibt es eine Dokumentation der Datenverarbeitung?"
            checked={checklistData.dataAndTraining.dataProcessing}
            onChange={() => handleCheckboxChange('dataAndTraining', 'dataProcessing')}
          />
        </div>
      </div>

      {/* Documentation & Measures Section */}
      <div className="mb-6">
        <h2 className="text-md mb-2 font-semibold text-gray-700">🔹 Dokumentation & Maßnahmen</h2>
        <div className="space-y-2">
          <CheckItem
            label="Gibt es ein technisches Dokumentationspaket?"
            checked={checklistData.documentation.technicalDocs}
            onChange={() => handleCheckboxChange('documentation', 'technicalDocs')}
          />
          <CheckItem
            label="Ist eine Risikoabschätzung erfolgt?"
            checked={checklistData.documentation.riskAssessment}
            onChange={() => handleCheckboxChange('documentation', 'riskAssessment')}
          />
          <CheckItem
            label="Gibt es eine Möglichkeit zur Auditierung?"
            checked={checklistData.documentation.auditCapability}
            onChange={() => handleCheckboxChange('documentation', 'auditCapability')}
          />
          <CheckItem
            label="Sind Sicherheitsmaßnahmen dokumentiert?"
            checked={checklistData.documentation.securityMeasures}
            onChange={() => handleCheckboxChange('documentation', 'securityMeasures')}
          />
        </div>
      </div>

      {/* Recommended Actions */}
      <div className="mt-6 rounded border border-blue-200 bg-blue-50 p-3">
        <h2 className="text-md mb-2 font-semibold text-blue-800">📋 Empfohlene Maßnahmen</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-blue-800">
          {riskLevel === 'high' && (
            <>
              <li>Einführung von Logging & Audit</li>
              <li>Technische Dokumentation erstellen</li>
              <li>Risikoabschätzung durchführen</li>
              <li>Konformitätsbewertung vorbereiten</li>
            </>
          )}
          {riskLevel === 'limited' && (
            <>
              <li>Transparenzhinweise im UI</li>
              <li>Überprüfung der Trainingsdatenquellen</li>
              <li>Dokumentation der Datenverarbeitung</li>
            </>
          )}
          {riskLevel === 'minimal' && (
            <>
              <li>Grundlegende Dokumentation</li>
              <li>Regelmäßige Überprüfung der Risikoklassifizierung</li>
            </>
          )}
          {riskLevel === 'forbidden' && (
            <>
              <li>Sofortige Überprüfung der Nutzungsszenarien</li>
              <li>Konsultation mit einem Rechtsexperten</li>
            </>
          )}
        </ul>
      </div>

      {/* Export/Reset Controls */}
      <div className="mt-6 flex justify-between">
        <button
          type="button"
          className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300"
          onClick={() => {
            // Reset all checkboxes
            const resetData = Object.fromEntries(
              Object.entries(checklistData).map(([section, items]) => [
                section,
                Object.fromEntries(Object.keys(items).map((key) => [key, false])),
              ]),
            )
            setChecklistData(resetData)
          }}
        >
          Zurücksetzen
        </button>
        <button type="button" className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700">
          Ergebnisse exportieren
        </button>
      </div>
    </div>
  )
}

// Checkbox component for consistency
const CheckItem = ({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
}) => {
  return (
    <label className="group flex cursor-pointer items-start">
      <div className="mt-0.5 flex h-5 items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </div>
      <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900">{label}</span>
    </label>
  )
}

export default AssistantAiAct
