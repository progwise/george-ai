import {
  createPrompts,
  deletePrompt,
  getDefaultPromptIds,
} from '@george-ai/strapi-client'
import { defaultPrompts } from './default-prompts'

const createDefaultPrompts = async () => {
  const defaultPromptIds = await getDefaultPromptIds()
  for (const promptId of defaultPromptIds) {
    await deletePrompt(promptId)
  }

  for (const [locale, promptData] of Object.entries(defaultPrompts)) {
    const { summary, keywords } = promptData
    await createPrompts(locale, summary, keywords)
  }
}

createDefaultPrompts()
