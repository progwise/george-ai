import { z } from 'zod'

import { prisma } from '@george-ai/app-database'
import { workspaceStorage } from '@george-ai/file-management'
import { vectorStore } from '@george-ai/vector-store'

import { DomainError } from '../error'
import { logger } from './common'

export async function createWorkspace(params: { name: string; slug: string; userId: string; id?: string }): Promise<{
  id: string
  name: string
  slug: string
}> {
  const { name, slug, userId, id } = params
  logger.info('Creating workspace', { name })

  try {
    const slugSchema = z.string().regex(/^[a-z0-9-]+$/)
    const validatedSlug = slugSchema.parse(slug)
    return await prisma.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({
        data: {
          id,
          name,
          slug: validatedSlug,
          members: {
            create: {
              userId,
              role: 'owner',
            },
          },
        },
      })

      await workspaceStorage.createWorkspace(workspace.id, { name: workspace.name })

      await vectorStore.createWorkspace({ workspaceId: workspace.id, vectors: {} }).catch(async (error) => {
        await workspaceStorage.deleteWorkspace(workspace.id).catch((cleanupError) => {
          logger.error('Error cleaning up workspace storage after vector store creation failure', {
            error: cleanupError,
            workspaceId: workspace.id,
          })
        })
        logger.error('Error creating vector store for workspace', { error, workspaceId: workspace.id })
        throw error
      })

      return {
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
      }
    })
  } catch (error) {
    logger.error('Error creating workspace', { error, name, slug, userId })
    if (error instanceof z.ZodError) {
      throw new DomainError(
        'Invalid workspace slug. Slug must be lowercase and can only contain letters, numbers, and hyphens.',
        'validation',
      )
    }
    throw new DomainError('Failed to create workspace. Please try again.', 'workspace')
  }
}
