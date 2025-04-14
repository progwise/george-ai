import { AiActChecklistStep } from './checklist'
import { AiActString } from './translated-string'

// Perform a preliminary risk assessment based on basic info
export const performRiskAssessment = (step: AiActChecklistStep) => {
  let riskPoints = 0
  const riskFactors: AiActString[] = []
  step.questions.forEach((question) => {
    const questionValue = question.value
    const questionRisk = question.options.find((option) => option.id === questionValue)?.risk
    if (!questionRisk) {
      return
    }
    riskPoints += questionRisk.points
    riskFactors.push(questionRisk.description)
    if (questionRisk.riskLevel) {
      if (questionRisk.riskLevel === 'nonApplicable') {
        return questionRisk
      }
    }
  })

  // Set risk level based on points
  if (riskPoints >= 8) {
    return {
      level: 'high',
      description: 'Potenziell hohes Risiko - detaillierte Prüfung erforderlich',
      factors: riskFactors,
    }
  } else if (riskPoints >= 5) {
    return {
      level: 'medium',
      description: 'Mittleres Risiko - weitere Analyse notwendig',
      factors: riskFactors,
    }
  } else {
    return {
      level: 'low',
      description: 'Niedriges Risiko - Basis-Compliance wahrscheinlich ausreichend',
      factors: riskFactors,
    }
  }
}
