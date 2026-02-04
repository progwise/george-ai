import bcrypt from 'bcrypt'

import { prisma } from '@george-ai/app-database/src/prisma'

export interface ApiKeyValidationResult {
  userId: string
  libraryId: string
  apiKeyId: string
}

export async function validateApiKey(parameters: {
  apiKey: string
  libraryId?: string
}): Promise<ApiKeyValidationResult | null> {
  const { apiKey, libraryId } = parameters
  if (!apiKey || apiKey.length === 0) {
    return null
  }

  // Find all API keys (we need to check hashes)
  const apiKeys = await prisma.apiKey.findMany({
    where: libraryId ? { libraryId } : undefined,
    select: {
      id: true,
      keyHash: true,
      userId: true,
      libraryId: true,
    },
  })

  // Check each key hash
  for (const key of apiKeys) {
    const isValid = await bcrypt.compare(apiKey, key.keyHash)

    if (isValid) {
      // If libraryId was provided, verify it matches
      if (libraryId && key.libraryId !== libraryId) {
        return null
      }

      // Update lastUsedAt timestamp
      await prisma.apiKey.update({
        where: { id: key.id },
        data: { lastUsedAt: new Date() },
      })

      return {
        userId: key.userId,
        libraryId: key.libraryId,
        apiKeyId: key.id,
      }
    }
  }

  return null
}
