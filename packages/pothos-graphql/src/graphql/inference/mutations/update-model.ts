import { prisma } from '@george-ai/app-database'
import { canWriteWorkspaceOrThrow } from '@george-ai/app-domain'

import { builder } from '../../builder'

builder.mutationField('updateModel', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiLanguageModel',
    args: {
      id: t.arg.id({ required: true }),
      data: t.arg({
        type: builder.inputType('UpdateAiLanguageModelInput', {
          fields: (t) => ({
            adminNotes: t.string({ required: false }),
            enabled: t.boolean({ required: true }),
          }),
        }),
        required: true,
      }),
    },
    resolve: async (query, _root, { id, data }, context) => {
      await canWriteWorkspaceOrThrow(context.workspaceId, context.session.user.id)

      return await prisma.aiLanguageModel.update({
        ...query,
        where: {
          id,
          workspaceId: context.workspaceId,
        },
        data: {
          adminNotes: data.adminNotes ?? null,
          enabled: data.enabled,
        },
      })
    },
  }),
)
