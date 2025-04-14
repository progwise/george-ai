import { AiActString } from './translated-string'

export interface AiActRiskIndicator {
  level: 'low' | 'medium' | 'high' | 'nonApplicable' | 'undetermined'
  description: AiActString
  factors: AiActString[]
}
