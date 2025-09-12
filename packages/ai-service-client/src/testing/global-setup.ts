export default async () => {
  process.env.GITHUB_TOKEN = process.env.GITHUB_TOKEN!

  process.env.OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL!
  process.env.OLLAMA_API_KEY = process.env.OLLAMA_API_KEY!
  process.env.OLLAMA_VRAM_GB = process.env.OLLAMA_VRAM_GB!

  process.env.OLLAMA_BASE_URL_1 = process.env.OLLAMA_BASE_URL_1!
  process.env.OLLAMA_API_KEY_1 = process.env.OLLAMA_API_KEY_1!
  process.env.OLLAMA_VRAM_GB_1 = process.env.OLLAMA_VRAM_GB_1!

  process.env.MODEL_NAME_CHAT = process.env.MODEL_NAME_CHAT!
  process.env.MODEL_NAME_VL = process.env.MODEL_NAME_VL!
  process.env.MODEL_NAME_EMBEDDING = process.env.MODEL_NAME_EMBEDDING!
}
