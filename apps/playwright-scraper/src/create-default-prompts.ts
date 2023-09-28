import {
  createPrompts,
  deletePrompt,
  getDefaultPromptIds,
} from '@george-ai/strapi-client'
import strapiPrompts from './prompts.json' assert { type: 'json' }

const createStrapiPrompts = async () => {
  const defaultPromptIds = (await getDefaultPromptIds()) || []
  for (const promptId of defaultPromptIds) {
    await deletePrompt(promptId)
  }

  for (const [locale, promptData] of Object.entries(strapiPrompts)) {
    const { summary, keywords } = promptData
    await createPrompts(locale, summary, keywords)
  }
}

createStrapiPrompts()
