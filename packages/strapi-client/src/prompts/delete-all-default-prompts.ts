import { deletePrompt } from './delete-prompt'
import { getDefaultPromptIds } from './get-default-prompt-ids'

export const deleteAllDefaultPrompts = async () => {
  const defaultPromptIds = await getDefaultPromptIds()
  for (const promptId of defaultPromptIds) {
    await deletePrompt(promptId)
  }
}
