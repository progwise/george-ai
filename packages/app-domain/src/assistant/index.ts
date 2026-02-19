import { prisma } from '@george-ai/app-database'

import { createAssistantIcon } from './create-assistant-icon'
import { deleteAssistantIcon } from './delete-assistant-icon'
import { readAssistantIcon } from './read-assistant-icon'
import { writeAssistantIcon } from './write-assistant-icon'

const checkAssistant = async (assistantId: string) => {
  const assistant = await prisma.aiAssistant.findUnique({
    where: { id: assistantId },
  })
  return assistant
}

export const updateAssistantIconUrl = async ({ assistantId, iconUrl }: { assistantId: string; iconUrl: string }) => {
  return await prisma.aiAssistant.update({
    where: { id: assistantId },
    data: { iconUrl },
  })
}

export default {
  checkAssistant,
  createAssistantIcon,
  deleteAssistantIcon,
  readAssistantIcon,
  writeAssistantIcon,
}

export { checkAssistant, createAssistantIcon, deleteAssistantIcon, readAssistantIcon, writeAssistantIcon }
