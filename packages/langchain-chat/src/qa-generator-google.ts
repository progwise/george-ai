import { getModel } from './assistant-model'

export interface QAPair {
  prompt: string
  completion: string
  evalCriteria?: string[]
  category?: string
  difficulty?: string
}

export interface ChatTemplateEntry {
  text?: string // For Gemma, Mistral, Llama, Qwen - single text field with formatted conversation
  messages?: Array<{ role: string; content: string }> // For ChatML - structured messages array
  category?: string[]
  difficulty?: string[]
}

// CHAT TEMPLATE SELECTION - Change this to control output format
function getChatTemplate(): 'gemma' | 'chatml' | 'mistral' | 'llama' | 'qwen' {
  return 'gemma' // Change this value to switch templates
}
const CHAT_TEMPLATE = getChatTemplate()

// Template format examples and output instructions
const TEMPLATE_CONFIG = {
  gemma: {
    example: `<start_of_turn>user\nknock knock<end_of_turn>\n<start_of_turn>model\nwho is there<end_of_turn>\n<start_of_turn>user\nGemma<end_of_turn>\n<start_of_turn>model\nGemma who?<end_of_turn>`,
    outputFormat: 'Each object should have a "text" field containing the full formatted conversation.',
    outputExample:
      '{"text":"<start_of_turn>user\\nWhat is the company name?<end_of_turn>\\n<start_of_turn>model\\nPressCrafters Printing Co.<end_of_turn>"}',
  },

  chatml: {
    example: `<|im_start|>user\nknock knock<|im_end|>\n<|im_start|>assistant\nwho is there<|im_end|>\n<|im_start|>user\nChatML<|im_end|>\n<|im_start|>assistant\nChatML who?<|im_end|>`,
    outputFormat: 'Each object should have a "messages" field with role-content pairs.',
    outputExample:
      '{"messages":[{"role":"user","content":"What is the company name?"},{"role":"assistant","content":"PressCrafters Printing Co."}]}',
  },

  mistral: {
    example: `[INST] knock knock [/INST] who is there [INST] Mistral [/INST] Mistral who?`,
    outputFormat: 'Each object should have a "text" field containing the full formatted conversation.',
    outputExample: '{"text":"[INST] What is the company name? [/INST] PressCrafters Printing Co."}',
  },

  llama: {
    example: `<s>[INST] knock knock [/INST] who is there </s><s>[INST] Llama [/INST] Llama who? </s>`,
    outputFormat: 'Each object should have a "text" field containing the full formatted conversation.',
    outputExample: '{"text":"<s>[INST] What is the company name? [/INST] PressCrafters Printing Co. </s>"}',
  },

  qwen: {
    example: `<|im_start|>user\nknock knock<|im_end|>\n<|im_start|>assistant\nwho is there<|im_end|>\n<|im_start|>user\nQwen<|im_end|>\n<|im_start|>assistant\nQwen who?<|im_end|>`,
    outputFormat: 'Each object should have a "text" field containing the full formatted conversation.',
    outputExample:
      '{"text":"<|im_start|>user\\nWhat is the company name?<|im_end|>\\n<|im_start|>assistant\\nPressCrafters Printing Co.<|im_end|>"}',
  },
}

export const generateQAPairs = async (chunk: string, summary: string): Promise<QAPair[]> => {
  const qaModel = await getModel('llama3.1:latest')

  const config = TEMPLATE_CONFIG[CHAT_TEMPLATE]

  console.log(`Using chat template: ${CHAT_TEMPLATE.toUpperCase()}`)

  const prompt = `Given the following summary and document chunk, generate question-answer pairs.
Summary: ${summary}
Chunk: ${chunk}

Each QA pair should have:
- A clear question
- A grounded answer from the chunk
- (Optional) Evaluation criteria (as a string array)
- (Optional) Category and difficulty

Output format: JSONL (one JSON object per line, no extra text).
${config.outputFormat}

Example format for ${CHAT_TEMPLATE}:
${config.example}

Example output:
${config.outputExample}
`

  const result = await qaModel.invoke(prompt)
  const lines = result.content
    .toString()
    .split('\n')
    .filter((line: string) => line.trim())

  const qaPairs = lines
    .map((line: string) => {
      try {
        const obj = JSON.parse(line)

        // Convert different template formats back to QAPair interface
        if (CHAT_TEMPLATE === 'gemma' && obj.text) {
          // Extract prompt and completion from Gemma format
          const userMatch = obj.text.match(/<start_of_turn>user\n(.*?)<end_of_turn>/s)
          const modelMatch = obj.text.match(/<start_of_turn>model\n(.*?)<end_of_turn>/s)
          if (userMatch && modelMatch) {
            return {
              prompt: userMatch[1].trim(),
              completion: modelMatch[1].trim(),
              category: obj.category || ['general'],
              difficulty: obj.difficulty || ['medium'],
            } as QAPair
          }
        } else if (CHAT_TEMPLATE === 'chatml' && obj.messages) {
          // Extract from ChatML messages format
          const userMsg = obj.messages.find((m: { role: string; content: string }) => m.role === 'user')
          const assistantMsg = obj.messages.find((m: { role: string; content: string }) => m.role === 'assistant')
          if (userMsg && assistantMsg) {
            return {
              prompt: userMsg.content,
              completion: assistantMsg.content,
              category: obj.category || ['general'],
              difficulty: obj.difficulty || ['medium'],
            } as QAPair
          }
        } else if ((CHAT_TEMPLATE === 'mistral' || CHAT_TEMPLATE === 'llama' || CHAT_TEMPLATE === 'qwen') && obj.text) {
          // Extract from Mistral/Llama/Qwen text format
          let userText = '',
            assistantText = ''

          if (CHAT_TEMPLATE === 'mistral') {
            const match = obj.text.match(/\[INST\]\s*(.*?)\s*\[\/INST\]\s*(.*?)(?:\[INST\]|$)/s)
            if (match) {
              userText = match[1].trim()
              assistantText = match[2].trim()
            }
          } else if (CHAT_TEMPLATE === 'llama') {
            const match = obj.text.match(/<s>\[INST\]\s*(.*?)\s*\[\/INST\]\s*(.*?)\s*<\/s>/s)
            if (match) {
              userText = match[1].trim()
              assistantText = match[2].trim()
            }
          } else if (CHAT_TEMPLATE === 'qwen') {
            const userMatch = obj.text.match(/<\|im_start\|>user\n(.*?)<\|im_end\|>/s)
            const assistantMatch = obj.text.match(/<\|im_start\|>assistant\n(.*?)<\|im_end\|>/s)
            if (userMatch && assistantMatch) {
              userText = userMatch[1].trim()
              assistantText = assistantMatch[1].trim()
            }
          }

          if (userText && assistantText) {
            return {
              prompt: userText,
              completion: assistantText,
              category: obj.category || ['general'],
              difficulty: obj.difficulty || ['medium'],
            } as QAPair
          }
        }

        // Fallback: if it's still the old format
        if (obj.prompt && obj.completion) {
          console.log('QA Pair (fallback format):', obj)
          return obj as QAPair
        }

        return null
      } catch {
        console.warn('Failed to parse line as JSON:', line)
        return null
      }
    })
    .filter((item: QAPair | null): item is QAPair => item !== null)

  qaPairs.forEach((qa, idx) => {
    // **** QA Pair Output ****
    console.info(`\x1b[45m\x1b[37m[QA ${idx + 1}]\x1b[0m`, '\x1b[35m' + JSON.stringify(qa, null, 2) + '\x1b[0m')
  })
  return qaPairs
}

// New function to generate chat template formatted entries directly for training
export const generateChatTemplateEntries = async (chunk: string, summary: string): Promise<ChatTemplateEntry[]> => {
  const qaModel = await getModel('llama3.1:latest')
  const config = TEMPLATE_CONFIG[CHAT_TEMPLATE]

  console.log(`Generating ${CHAT_TEMPLATE.toUpperCase()} format training data`)

  const prompt = `Given the following summary and document chunk, generate question-answer pairs.
Summary: ${summary}
Chunk: ${chunk}

Each QA pair should have:
- A clear question
- A grounded answer from the chunk
- (Optional) Category and difficulty

Output format: JSONL (one JSON object per line, no extra text).
${config.outputFormat}

Example format for ${CHAT_TEMPLATE}:
${config.example}

Example output:
${config.outputExample}
`

  const result = await qaModel.invoke(prompt)
  const lines = result.content
    .toString()
    .split('\n')
    .filter((line: string) => line.trim())

  const chatEntries = lines
    .map((line: string) => {
      try {
        const obj = JSON.parse(line)
        return obj as ChatTemplateEntry
      } catch {
        console.warn('Failed to parse line as JSON:', line)
        return null
      }
    })
    .filter((item: ChatTemplateEntry | null): item is ChatTemplateEntry => item !== null)

  chatEntries.forEach((entry, idx) => {
    console.info(
      `\x1b[46m\x1b[37m[${CHAT_TEMPLATE.toUpperCase()} Entry ${idx + 1}]\x1b[0m`,
      '\x1b[36m' + JSON.stringify(entry, null, 2) + '\x1b[0m',
    )
  })
  return chatEntries
}
