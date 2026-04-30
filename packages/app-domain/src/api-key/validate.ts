import bcrypt from 'bcrypt'

import { prisma } from '@george-ai/app-database'

export interface ApiKeyValidationResult {
  workspaceId: string
  apiKeyId: string
  userId: string
}

export async function validateApiKey(parameters: {
  apiKey: string
  workspaceId?: string
}): Promise<ApiKeyValidationResult | null> {
  const { apiKey, workspaceId } = parameters
  if (!apiKey || apiKey.length === 0) {
    return null
  }

  // Find all API keys (we need to check hashes)
  const apiKeys = await prisma.apiKey.findMany({
    where: workspaceId ? { workspaceId } : undefined,
    select: {
      id: true,
      userId: true,
      keyHash: true,
      workspaceId: true,
    },
  })

  // Check each key hash
  for (const key of apiKeys) {
    const isValid = await bcrypt.compare(apiKey, key.keyHash)

    if (isValid) {
      // If libraryId was provided, verify it matches
      if (workspaceId && key.workspaceId !== workspaceId) {
        return null
      }

      // Update lastUsedAt timestamp
      await prisma.apiKey.update({
        where: { id: key.id },
        data: { lastUsedAt: new Date() },
      })

      return {
        userId: key.userId,
        workspaceId: key.workspaceId,
        apiKeyId: key.id,
      }
    }
  }

  return null
}
