import { deleteAssistantIcons } from '@george-ai/file-management'

export async function deleteAssistantIcon(assistantId: string): Promise<void> {
  return deleteAssistantIcons(assistantId)
}
