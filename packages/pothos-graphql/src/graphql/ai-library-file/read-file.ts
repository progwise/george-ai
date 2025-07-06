import fs from 'fs'

import { getMarkdownFilePath } from '../../file-upload'
import { builder } from '../builder'

builder.queryField('readFileMarkdown', (t) =>
  t.field({
    type: 'String',
    nullable: false,
    args: {
      fileId: t.arg.string({ required: true }),
      libraryId: t.arg.string({ required: true }),
    },
    resolve: async (_source, { fileId, libraryId }) => {
      const path = getMarkdownFilePath({ fileId, libraryId })
      console.log(`Reading markdown file for fileId ${fileId} at path: ${path}`)
      try {
        const fileContent = await fs.promises.readFile(path, 'utf-8')
        return fileContent
      } catch (error) {
        console.error(`Error reading file ${fileId} at path ${path}:`, error)
        throw new Error(`Failed to read file ${fileId}: ${(error as Error).message}`)
      }
    },
  }),
)
