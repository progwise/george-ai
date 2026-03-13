import { z } from 'zod'

import { prisma } from '@george-ai/app-database'
import { writeRegistryEntry } from '@george-ai/event-service-client'
import { workspace as ws } from '@george-ai/file-management'
import { vectorStore } from '@george-ai/vector-store'

import { DomainError } from '../error'
import { logger } from './common'

export async function createWorkspace(params: {
  name: string
  slug: string
  workspaceId?: string
  userId?: string
}): Promise<{
  workspaceId: string
  slug: string
}> {
  const { name, slug, userId } = params
  logger.debug('Creating workspace', params)
  const start = Date.now()

  try {
    const slugSchema = z.string().regex(/^[a-z0-9-]+$/)
    const validatedSlug = slugSchema.parse(slug)
    return await prisma.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({
        select: {
          id: true,
        },
        data: {
          id: params.workspaceId,
          name,
          slug: validatedSlug,
          createdAt: new Date(),
          members: {
            ...(userId ? { create: { userId, role: 'owner' } } : {}),
          },
        },
      })

      await ws.create(workspace.id, { name })

      await vectorStore.createWorkspace({ workspaceId: workspace.id, vectors: {} }).catch(async (error) => {
        await ws.delete(workspace.id).catch((cleanupError) => {
          logger.error('Error cleaning up workspace storage after vector store creation failure', {
            error: cleanupError,
            workspaceId: workspace.id,
          })
        })
        logger.error('Error creating vector store for workspace', { error, workspaceId: workspace.id })
        throw error
      })

      await writeRegistryEntry({
        inferenceModels: [],
        inferenceHosts: [],
        version: 1,
        workspaceId: workspace.id,
        lastUpdate: new Date(),
        type: 'workspace',
        name,
      })

      return {
        workspaceId: workspace.id,
        slug: validatedSlug,
      }
    })
  } catch (error) {
    logger.error('Error creating workspace', { error, name, slug, userId, ellapsed: start - Date.now() })
    if (error instanceof z.ZodError) {
      throw new DomainError(
        'Invalid workspace slug. Slug must be lowercase and can only contain letters, numbers, and hyphens.',
        'validation',
      )
    }
    throw new DomainError('Failed to create workspace. Please try again.', 'workspace')
  }
}
