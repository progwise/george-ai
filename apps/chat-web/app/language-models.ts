interface LanugageModel {
  id: string
  name: string
  parameters?: Record<string, string>
}
const availableLanguageModelsProd: Array<LanugageModel> = [
  {
    id: 'gpt-3',
    name: 'OpenAI GPT-3',
  },
  {
    id: 'gpt-4',
    name: 'OpenAI GPT-4',
  },
  { id: 'gemini-1.5', name: 'Gemini 1.5' },
]

const availabeLanguageModelsDev: Array<LanugageModel> = [
  {
    id: 'ollama-mistral',
    name: 'Ollama:Mistral',
    parameters: {
      model: 'mistral:latest',
    },
  },
  {
    id: 'ollama-llama3.1',
    name: 'Ollama:LLama3.1',
    parameters: {
      model: 'llama3.1:latest',
    },
  },
]

const availableLanguageModels = [...availableLanguageModelsProd]
if (process.env.NODE_ENV !== 'production') {
  availableLanguageModels.push(...availabeLanguageModelsDev)
}

export { availableLanguageModels }
