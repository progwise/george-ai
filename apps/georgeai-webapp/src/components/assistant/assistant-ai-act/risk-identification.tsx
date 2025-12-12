import { useMemo } from 'react'

import { graphql } from '../../../gql'
import { RiskAreasIdentification_AssessmentFragment } from '../../../gql/graphql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { ComplianceArea } from './compliance-area'

graphql(`
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
        id
        ...ComplianceArea_Compliance
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
  assessment: RiskAreasIdentification_AssessmentFragment
}

export const RiskAreasIdentification = ({ assessment }: RiskAreasIdentificationProps) => {
  const { t, language } = useTranslation()
  const basicInfo = assessment.assistantSurvey
  const riskIndicator = basicInfo.riskIndicator
  const questions = basicInfo.questions
  const identifyRiskInfo = assessment.identifyRiskInfo
  const complianceAreas = identifyRiskInfo.complianceAreas

  // Determine EU AI Act applicability
  const euOperation = useMemo(
    () => questions.find((q) => q.id === 'euOperation')?.value === 'Yes' || false,
    [questions],
  )

  // Get styling based on risk level
  const getRiskStyle = () => {
    switch (riskIndicator.level) {
      case 'high':
        return 'bg-error/10 border-error'
      case 'medium':
        return 'bg-warning/10 border-warning'
      case 'low':
        return 'bg-success/10 border-success'
      case 'minimal':
        return 'bg-info border-info'
      default:
        return 'bg-neutral border-neutral text-neutral-content'
    }
  }

  // Get icon based on risk level
  const getRiskIcon = () => {
    switch (riskIndicator.level) {
      case 'high':
        return '🟥'
      case 'medium':
        return '🟨'
      case 'low':
        return '🟩'
      default:
        return 'ℹ️'
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 rounded-lg bg-base-100 p-4 shadow-sm">
      <h3 className="text-xl font-bold">
        <span>{identifyRiskInfo.title[language]}</span>
      </h3>

      {/* Legal disclaimer */}
      <div className="rounded-sm border border-error bg-error/40 p-3 text-sm">
        <p className="font-bold">{identifyRiskInfo.legalDisclaimer.title[language]}:</p>
        <p>{identifyRiskInfo.legalDisclaimer.text[language]}</p>
      </div>

      {/* Risk assessment summary */}
      <div className={`flex flex-col gap-2 rounded-lg border p-4 ${getRiskStyle()}`}>
        <h4 className="text-lg font-semibold">{t('aiAct.summaryInitialAssessment')}</h4>

        <div className="flex gap-2">
          <span>{getRiskIcon()}</span>
          <div className="flex flex-col gap-2">
            <p className="text-lg font-medium">{riskIndicator.description[language]}</p>

            {!euOperation && (
              <div className="rounded-sm bg-base-300/80 p-3 text-base-content">
                <p className="font-semibold">{t('aiAct.notesOnApplicabilityHeadline')}:</p>
                <p>{t('aiAct.notesOnApplicability')}</p>
              </div>
            )}

            {riskIndicator.factors.length > 0 && (
              <div>
                <p className="font-semibold">{t('aiAct.identifiedRisks')}:</p>
                <ul className="list-inside list-disc">
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
      <div className="rounded-lg border bg-base-200 p-4">
        <h4 className="mb-3 font-semibold">{t('aiAct.systemProperties')}</h4>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {questions.map((question) => {
            // Find selected option
            const selectedOption = question.options.find((opt) => opt.id === question.value)
            return (
              <div key={question.id} className="flex flex-col gap-2 rounded-lg border bg-base-100 p-3 text-sm">
                <p className="font-medium">{question.title[language]}</p>
                <p className="text-info">{selectedOption ? selectedOption.title[language] : question.value}</p>
                {question.notes && (
                  <p className="text-xs text-base-content italic opacity-70">
                    {t('labels.note')}: {question.notes}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Recommended compliance areas */}
      <h2 className="text-lg font-semibold">{t('aiAct.suggestedDetailedEvaluationHeadline')}</h2>

      {!euOperation ? (
        <div className="rounded-lg border border-info bg-info/40 p-4">
          <p className="font-medium">{t('aiAct.notApplicableHeadline')}</p>
          <p className="mt-2 text-sm">{t('aiAct.notApplicableText')}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-sm">{t('aiAct.applicableHeadline')}:</p>

          {complianceAreas.map((area) => (
            <ComplianceArea key={area.id} area={area} />
          ))}
        </div>
      )}
    </div>
  )
}
