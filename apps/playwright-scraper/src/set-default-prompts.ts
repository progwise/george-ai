import {
  createPrompt,
  deletePrompt,
  getDefaultPromptIds,
} from '@george-ai/strapi-client'
import { defaultPrompts } from './default-prompts'

const setDefaultPrompts = async () => {
  const defaultPromptIds = await getDefaultPromptIds()
  for (const promptId of defaultPromptIds) {
    await deletePrompt(promptId)
  }

  for (const [locale, promptData] of Object.entries(defaultPrompts)) {
    const { summary, keywords } = promptData
    await createPrompt(locale, summary, keywords)
  }
}

setDefaultPrompts()
