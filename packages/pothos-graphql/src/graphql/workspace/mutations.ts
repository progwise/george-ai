import { z } from 'zod'

import { prisma } from '../../prisma'
import { builder } from '../builder'

console.log('Setting up: Workspace mutations')

builder.mutationField('createWorkspace', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'Workspace',
    nullable: false,
    args: {
      name: t.arg.string({ required: true }),
      slug: t.arg.string({ required: true }),
    },
    resolve: async (query, _root, { name, slug }, ctx) => {
      const userId = ctx.session.user.id

      // Validate slug format (lowercase, alphanumeric, hyphens only)
      const slugSchema = z.string().regex(/^[a-z0-9-]+$/)
      const validatedSlug = slugSchema.parse(slug)

      // Create workspace and add creator as admin member
      const workspace = await prisma.workspace.create({
        ...query,
        data: {
          name,
          slug: validatedSlug,
          members: {
            create: {
              userId,
              role: 'ADMIN',
            },
          },
        },
      })

      return workspace
    },
  }),
)
