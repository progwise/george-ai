import { canWriteWorkspaceOrThrow, prepareUpload } from '@george-ai/app-domain'

import { builder } from '../../builder'

builder.mutationField('prepareUpload', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: builder.simpleObject('PrepareUploadResult', {
      fields: (t) => ({
        workspaceId: t.string({ nullable: false }),
        libraryId: t.string({ nullable: false }),
        documentId: t.string({ nullable: false }),
        uploadId: t.string({ nullable: false }),
      }),
    }),
    args: {
      libraryId: t.arg.string({ required: true }),
      documentId: t.arg.string({ required: false }),
      input: t.arg({
        type: builder.inputType('PrepareUploadInput', {
          fields: (t) => ({
            name: t.string({ required: true }),
            originUri: t.string({ required: true }),
            mimeType: t.string({ required: true }),
            size: t.int({ required: false }),
            modificationDate: t.field({ type: 'DateTime', required: false }),
          }),
        }),
        required: true,
      }),
    },
    nullable: false,
    resolve: async (_source, args, { workspaceId, session }) => {
      await canWriteWorkspaceOrThrow(workspaceId, session.user.id)

      const { name, originUri, mimeType, size, modificationDate } = args.input

      const { uploadId, documentId } = await prepareUpload({
        workspaceId,
        libraryId: args.libraryId,
        documentId: args.documentId,
        originUri: originUri,
        mimeType,
        name,
        size,
        modificationDate,
      })

      return {
        workspaceId,
        libraryId: args.libraryId,
        documentId,
        uploadId,
      }
    },
  }),
)
