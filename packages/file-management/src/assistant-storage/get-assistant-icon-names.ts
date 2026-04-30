import { ALLOWED_ICON_EXTENSIONS } from './commons'
import { getAssistantIconName } from './get-assistant-icon-name'

export function getAssistantIconNames(assistantId: string): string[] {
  const fileNames = ALLOWED_ICON_EXTENSIONS.map((extension) => getAssistantIconName(assistantId, extension))
  return fileNames
}
