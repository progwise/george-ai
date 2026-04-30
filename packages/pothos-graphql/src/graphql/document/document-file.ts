import { DOCUMENT_FILE_TYPES, DocumentFile } from '@george-ai/app-schema'

import { builder } from '../builder'

builder.enumType('DocumentFileType', {
  description: 'Type of the document file',
  values: DOCUMENT_FILE_TYPES,
})

builder.objectRef<DocumentFile>('DocumentFile').implement({
  description: 'Files inside the document folder',
  fields: (t) => ({
    workspaceId: t.exposeString('workspaceId', { nullable: false }),
    libraryId: t.exposeString('libraryId', { nullable: false }),
    documentId: t.exposeString('documentId', { nullable: false }),
    extractionMethod: t.expose('extractionMethod', { type: 'ExtractionMethod', nullable: true }),
    fileName: t.exposeString('fileName', { nullable: false }),
    fileType: t.expose('fileType', { type: 'DocumentFileType', nullable: false }),
    relativePath: t.exposeString('relativePath', { nullable: false }),
    mimeType: t.exposeString('mimeType', { nullable: true }),
    size: t.exposeInt('size', { nullable: false }),
    modified: t.expose('modified', { type: 'DateTime', nullable: true }),
    fileUri: t.exposeString('fileUri', { nullable: false }),
    isDocumentRoot: t.exposeBoolean('isDocumentRoot', { nullable: false }),
    isAnalysis: t.exposeBoolean('isAnalysis', { nullable: false }),
    isBackup: t.exposeBoolean('isBackup', { nullable: false }),
    isExtractionMain: t.exposeBoolean('isExtractionMain', { nullable: false }),
    isExtractionPart: t.exposeBoolean('isExtractionPart', { nullable: false }),
    isManifest: t.exposeBoolean('isManifest', { nullable: false }),
    isDocumentSourceFile: t.exposeBoolean('isDocumentSourceFile', { nullable: false }),
    isAttachment: t.exposeBoolean('isAttachment', { nullable: false }),
  }),
})
