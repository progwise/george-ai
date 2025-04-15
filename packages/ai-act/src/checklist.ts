import { AiActQuestion } from './question'
import { AiActRiskIndicator } from './risk-indicator'
import { AiActString } from './translated-string'

export interface AiActChecklistAction {
  level: 'high' | 'medium' | 'low' | 'nonApplicable' | 'undetermined'
  description: AiActString
}

export interface AiActChecklistStepNavigation {
  title: AiActString
  actions: Array<AiActChecklistAction>
}

export interface AiActChecklistStep {
  id: string
  title: AiActString
  hint: AiActString
  questions: AiActQuestion[]
  navigation: AiActChecklistStepNavigation
  riskIndicator: AiActRiskIndicator
}
