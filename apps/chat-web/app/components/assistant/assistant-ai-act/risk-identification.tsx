import { useMemo, useState } from 'react'

import { FragmentType, graphql, useFragment } from '../../../gql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { LoadingSpinner } from '../../loading-spinner'
import { ComplianceArea } from './compliance-area'

const RiskAreasIdentification_AssessmentFragment = graphql(`
  fragment RiskAreasIdentification_Assessment on AiActAssessment {
    identifyRiskInfo {
      title {
        de
        en
      }
      legalDisclaimer {
        title {
          de
          en
        }
        text {
          de
          en
        }
      }
      complianceAreas {
        title {
          de
          en
        }
        description {
          de
          en
        }
        id
      }
    }
    assistantSurvey {
      questions {
        id
        title {
          de
          en
        }
        notes
        value
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

interface RiskAreasIdentificationProps {
  assessment: FragmentType<typeof RiskAreasIdentification_AssessmentFragment>
}

export const RiskAreasIdentification = (props: RiskAreasIdentificationProps) => {
  const { t, language } = useTranslation()
  const assessment = useFragment(RiskAreasIdentification_AssessmentFragment, props.assessment)
  const basicInfo = assessment.assistantSurvey
  const riskIndicator = basicInfo?.riskIndicator
  const questions = basicInfo.questions
  const identifyRiskInfo = assessment.identifyRiskInfo
  const complianceAreas = identifyRiskInfo?.complianceAreas

  // State for selected compliance areas
  const [selectedAreas, setSelectedAreas] = useState<string[]>([])

  // Determine EU AI Act applicability
  const euOperation = useMemo(
    () => questions?.find((q) => q.id === 'euOperation')?.value === 'Yes' || false,
    [questions],
  )

  const effectiveAreas = useMemo(() => {
    const areas = new Set<string>(selectedAreas)

    if (!euOperation) {
      return areas
    }

    if (riskIndicator) {
      if (riskIndicator.level === 'high') {
        areas.add('documentation')
        areas.add('governance')
      } else if (riskIndicator.level === 'medium') {
        areas.add('documentation')
      }
    }

    questions?.forEach((q) => {
      switch (q.id) {
        case 'systemType':
          if (q.value === 'ML' || q.value === 'Both') {
            areas.add('dataQuality')
            areas.add('documentation')
          }
          break
        case 'operationMode':
          if (q.value === 'Autonomous') {
            areas.add('humanOversight')
            areas.add('security')
          }
          break
        case 'syntheticContent':
          if (q.value === 'Yes') {
            areas.add('transparency')
            areas.add('fundamentalRights')
          }
          break
        case 'gpaiModel':
          if (q.value === 'Yes' || q.value === 'Unsure') {
            areas.add('governance')
            areas.add('specificRequirements')
          }
          break
        default:
          break
      }
    })

    // Preselect areas based on risk level

    return areas
  }, [euOperation, questions, riskIndicator, selectedAreas])

  if (!basicInfo || !riskIndicator || !questions || !identifyRiskInfo || !complianceAreas) {
    return <LoadingSpinner />
  }

  // Handle area selection change
  const handleAreaChange = (area: string) => {
    setSelectedAreas((prev) => {
      const newAreas = new Set(prev)
      if (newAreas.has(area)) {
        newAreas.delete(area)
      } else {
        newAreas.add(area)
      }
      return Array.from(newAreas)
    })
  }

  // Get styling based on risk level
  const getRiskStyle = () => {
    switch (riskIndicator.level) {
      case 'high':
        return 'bg-orange-100 border-orange-500 text-orange-700'
      case 'medium':
        return 'bg-yellow-100 border-yellow-500 text-yellow-700'
      case 'low':
        return 'bg-green-100 border-green-500 text-green-700'
      case 'minimal':
        return 'bg-blue-100 border-blue-500 text-blue-700'
      default:
        return 'bg-gray-100 border-gray-300 text-gray-700'
    }
  }

  // Get icon based on risk level
  const getRiskIcon = () => {
    switch (riskIndicator.level) {
      case 'high':
        return '🟧'
      case 'medium':
        return '🟨'
      case 'low':
        return '🟩'
      default:
        return 'ℹ️'
    }
  }

  return (
    <div className="mx-auto max-w-2xl rounded-lg border border-gray-200 bg-white p-4 font-sans shadow">
      <h1 className="mb-4 flex items-center justify-between text-xl font-bold text-gray-800">
        <span>{identifyRiskInfo.title[language]}</span>
      </h1>

      {/* Legal disclaimer */}
      <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-xs text-gray-600">
        <p className="font-bold">{identifyRiskInfo.legalDisclaimer.title[language]}:</p>
        <p>{identifyRiskInfo.legalDisclaimer.text[language]}</p>
      </div>

      {/* Risk assessment summary */}
      <div className={`mb-6 rounded-lg border p-4 ${getRiskStyle()}`}>
        <h2 className="mb-3 text-lg font-semibold">{t('aiAct.summaryInitialAssessment')}</h2>

        <div className="flex items-start">
          <span className="mr-3 mt-1 text-2xl">{getRiskIcon()}</span>
          <div className="flex-1">
            <p className="text-lg font-medium">{riskIndicator.description?.[language]}</p>

            {!euOperation && (
              <div className="mt-3 rounded bg-white bg-opacity-50 p-3">
                <p className="font-semibold">{t('aiAct.notesOnApplicabilityHeadline')}:</p>
                <p>{t('aiAct.notesOnApplicability')}</p>
              </div>
            )}

            {riskIndicator.factors && riskIndicator.factors.length > 0 && (
              <div className="mt-3">
                <p className="font-medium">{t('aiAct.identifiedRisks')}:</p>
                <ul className="mt-1 list-inside list-disc">
                  {riskIndicator.factors.map((factor) => (
                    <li key={factor[language]}>{factor[language]}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* System characteristics summary */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h2 className="text-md mb-3 font-semibold">{t('aiAct.systemProperties')}</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {questions.map((question) => {
            // Find selected option
            const selectedOption = question.options.find((opt) => opt.id === question.value)
            return (
              <div key={question.id} className="rounded-lg border border-gray-200 bg-white p-3">
                <p className="text-sm font-medium">{question.title[language]}</p>
                <p className="mt-1 text-sm text-blue-600">
                  {selectedOption ? selectedOption.title[language] : question.value}
                </p>
                {question.notes && (
                  <p className="mt-1 text-xs italic text-gray-600">
                    {t('labels.note')}: {question.notes}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Recommended compliance areas */}
      <div className="mb-6">
        <h2 className="mb-4 text-lg font-semibold">{t('aiAct.suggestedDetailedEvaluationHeadline')}</h2>

        {!euOperation ? (
          <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="font-medium">{t('aiAct.notApplicableHeadline')}</p>
            <p className="mt-2 text-sm">{t('aiAct.notApplicableText')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="mb-3 text-sm text-gray-600">{t('aiAct.applicableHeadline')}:</p>

            {complianceAreas.map((area) => (
              <ComplianceArea
                key={area.id}
                id={area.id}
                title={area.title[language]}
                description={area.description[language]}
                isSelected={effectiveAreas.has(area.id)}
                onChange={() => handleAreaChange(area.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
