import { AiActString } from './translated-string'

export interface AiActAnswerType<T> {
  value: T | null
  notes: string
}

export interface AiActOptionRisk {
  points: number
  description: AiActString
  riskLevel?: 'low' | 'medium' | 'high' | 'nonApplicable'
}
export interface AiActOption {
  id: string
  title: AiActString
  risk?: AiActOptionRisk
}

export interface AiActQuestion {
  id: string
  title: AiActString
  hint: AiActString
  options: AiActOption[]
  value: string | null
  notes: string | null
}
