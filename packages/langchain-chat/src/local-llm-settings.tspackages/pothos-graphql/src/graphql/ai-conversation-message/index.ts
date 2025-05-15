export const localLLMConfig = {
  endpoint: process.env.LOCAL_LLM_API || 'http://localhost:4567/generate',
  modelName: 'Qwen/Qwen2.5-Coder-0.5B-Instruct',
  maxTokens: 300,
  temperature: 0.7,
}
