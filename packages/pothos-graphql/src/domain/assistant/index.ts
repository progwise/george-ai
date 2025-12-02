import fs from 'fs'

import { UPLOADS_PATH } from '../../global-config'
import { prisma } from '../../prisma'

export const checkAssistant = async (assistantId: string) => {
  const assistant = await prisma?.aiAssistant.findUnique({
    where: { id: assistantId },
  })
  return assistant
}

export const getAssistantIconsPath = () => {
  const dir = `${UPLOADS_PATH}/assistant-icons`
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  return dir
}

export const updateAssistantIconUrl = async ({ assistantId, iconUrl }: { assistantId: string; iconUrl: string }) => {
  return await prisma?.aiAssistant.update({
    where: { id: assistantId },
    data: { iconUrl },
  })
}
