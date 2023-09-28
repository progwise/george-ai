import { createPrompt, deleteAllDefaultPrompts } from '@george-ai/strapi-client'
import { defaultPrompts } from './default-prompts'

const setDefaultPrompts = async () => {
  await deleteAllDefaultPrompts()
  for (const [locale, promptData] of Object.entries(defaultPrompts)) {
    const { summary, keywords } = promptData
    await createPrompt(locale, summary, keywords)
  }
}

setDefaultPrompts()
