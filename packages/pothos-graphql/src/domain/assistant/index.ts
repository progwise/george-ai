import fs from 'fs'

import { prisma } from '@george-ai/app-database'

import config from '../../config'

export const checkAssistant = async (assistantId: string) => {
  const assistant = await prisma.aiAssistant.findUnique({
    where: { id: assistantId },
  })
  return assistant
}

export const getAssistantIconsPath = () => {
  const dir = `${config('UPLOADS_PATH')}/assistant-icons`
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  return dir
}

export const updateAssistantIconUrl = async ({ assistantId, iconUrl }: { assistantId: string; iconUrl: string }) => {
  return await prisma.aiAssistant.update({
    where: { id: assistantId },
    data: { iconUrl },
  })
}
