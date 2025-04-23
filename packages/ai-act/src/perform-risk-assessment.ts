import { AiActQuestion } from './question'
import { AiActString } from './translated-string'

// Perform a preliminary risk assessment based on basic info
export const performRiskAssessment = (questions: AiActQuestion[]) => {
  let riskPoints = 0
  const riskFactors: AiActString[] = []
  questions.forEach((question) => {
    const questionValue = question.value
    const questionRisk = question.options.find((option) => option.id === questionValue)?.risk
    if (!questionRisk) {
      return
    }
    riskPoints += questionRisk.points
    riskFactors.push(questionRisk.description)
    if (questionRisk.riskLevel === 'nonApplicable') {
      return questionRisk
    }
  })

  // Set risk level based on points
  if (riskPoints >= 8) {
    return {
      level: 'high' as const,
      description: {
        de: 'Potenziell hohes Risiko - detaillierte Prüfung erforderlich',
        en: 'Higher risk - detailed review required',
      },
      factors: riskFactors,
    }
  } else if (riskPoints >= 5) {
    return {
      level: 'medium' as const,
      description: { de: 'Mittleres Risiko - weitere Analyse notwendig', en: 'Medium risk - further analysis needed' },
      factors: riskFactors,
    }
  } else {
    return {
      level: 'low' as const,
      description: {
        de: 'Niedriges Risiko - Basis-Compliance wahrscheinlich ausreichend',
        en: 'Low risk - basic compliance likely sufficient',
      },
      factors: riskFactors,
    }
  }
}
