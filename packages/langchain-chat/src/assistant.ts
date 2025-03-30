import { SupportedModel } from './assistant-model'

export interface Assistant {
  id: string
  name: string
  description: string
  languageModel: SupportedModel
  baseCases: Array<{ condition?: string | null; instruction?: string | null }>
}
