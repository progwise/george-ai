import { getEntryPoints, updateEntryPoint } from '@george-ai/strapi-client'
import { defaultPrompts } from './default-prompts'

const isSupportedLanguage = (
  lang: string,
): lang is keyof typeof defaultPrompts =>
  Object.keys(defaultPrompts).includes(lang)

const setDefaultPrompts = async () => {
  const entryPoints = await getEntryPoints()
  const filteredEntryPoints = entryPoints.filter((entryPoint) =>
    entryPoint.prompts.some((prompt) => prompt.isDefaultPrompt),
  )

  for (const entryPoint of filteredEntryPoints) {
    const updatedPrompts = entryPoint.prompts.map((prompt) => {
      if (prompt.isDefaultPrompt && isSupportedLanguage(prompt.language)) {
        const defaultPrompt = defaultPrompts[prompt.language]
        return {
          id: prompt.id,
          promptForSummary: JSON.stringify(defaultPrompt.summary),
          promptForKeywords: JSON.stringify(defaultPrompt.keywords),
          largeLanguageModel: 'gpt-3.5-turbo',
          isDefaultPrompt: true,
          language: prompt.language,
        }
      }
      return prompt
    })

    await updateEntryPoint(entryPoint.entryPointId, updatedPrompts)
  }
}

setDefaultPrompts()
