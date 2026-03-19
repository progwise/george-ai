import { z } from 'zod'

import { prisma } from '@george-ai/app-database'
import { writeRegistryEntry } from '@george-ai/event-service-client'
import { WorkspaceManifest, workspace as ws } from '@george-ai/file-management'

import { DomainError } from '../error'
import { logger } from './common'

export async function createWorkspace(params: {
  name: string
  slug: string
  workspaceId?: string
  userId?: string
}): Promise<WorkspaceManifest> {
  const { name, slug, userId } = params
  logger.debug('Creating workspace', params)
  const start = Date.now()

  try {
    const slugSchema = z.string().regex(/^[a-z0-9-]+$/)
    const validatedSlug = slugSchema.parse(slug)
    const manifest = await prisma.$transaction(async (tx) => {
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

      const manifest = await ws.create(workspace.id, { name })

      await writeRegistryEntry({
        inferenceModels: [],
        inferenceHosts: [],
        version: 1,
        workspaceId: workspace.id,
        lastUpdate: new Date(),
        type: 'workspace',
        name,
      })

      return manifest
    })
    return manifest
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
