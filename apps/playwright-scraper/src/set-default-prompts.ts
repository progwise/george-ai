import { getEntryPoints, updateEntryPoint } from '@george-ai/strapi-client'
import { defaultPrompts } from './default-prompts'

type SupportedLanguage = keyof typeof defaultPrompts

const isSupportedLanguage = (lang: string): lang is SupportedLanguage =>
  Object.keys(defaultPrompts).includes(lang)

const createDefaultPrompt = (lang: SupportedLanguage, id?: string) => {
  const defaultPrompt = defaultPrompts[lang]
  return {
    id,
    promptForSummary: JSON.stringify(defaultPrompt.summary),
    promptForKeywords: JSON.stringify(defaultPrompt.keywords),
    largeLanguageModel: 'gpt-3.5-turbo',
    isDefaultPrompt: true,
    language: lang,
  }
}

const setDefaultPrompts = async () => {
  const entryPoints = await getEntryPoints()

  for (const entryPoint of entryPoints) {
    if (entryPoint.prompts.length === 0) {
      const newPrompts = Object.keys(defaultPrompts).map((lang) =>
        createDefaultPrompt(lang as SupportedLanguage),
      )

      await updateEntryPoint(entryPoint.entryPointId, newPrompts)
      continue
    }

    const hasDefaultPrompt = entryPoint.prompts.some(
      (prompt) => prompt.isDefaultPrompt,
    )
    if (!hasDefaultPrompt) continue

    const updatedPrompts = entryPoint.prompts.map((prompt) =>
      prompt.isDefaultPrompt && isSupportedLanguage(prompt.language)
        ? createDefaultPrompt(prompt.language, prompt.id)
        : prompt,
    )

    await updateEntryPoint(entryPoint.entryPointId, updatedPrompts)
  }
}

setDefaultPrompts()
