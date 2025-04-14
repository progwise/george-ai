import { AiActQuestion } from './question'
import { AiActRiskIndicator } from './risk-indicator'
import { AiActString } from './translated-string'

export interface AiActChecklistStepNavigation {
  title: AiActString
  hint: AiActString
}

export interface AiActChecklistStep {
  id: string
  title: AiActString
  hint: AiActString
  questions: AiActQuestion[]
  navigation: AiActChecklistStepNavigation
  riskIndicator: AiActRiskIndicator
}
