import { getConfigValue } from '@george-ai/app-commons'

import { Attachment, DocumentIdentifier, ExtractionIdentifier } from '../schema'

export function getAttachmentUrl(parameters: {
  parent: DocumentIdentifier | ExtractionIdentifier
  attachment: Attachment
}): string {
  const { parent, attachment } = parameters
  const backendPublicUrl = getConfigValue('BACKEND_PUBLIC_URL')
  if (parent.type === 'document') {
    return `${backendPublicUrl}/workspaces/${parent.workspaceId}/libraries/${parent.libraryId}/documents/${parent.documentId}/source?attachment=${attachment.fileName}`
  }
  return `${backendPublicUrl}/library-files/${parent.libraryId}/${parent.documentId}?extraction=${parent.extractionMethod}&attachment=${attachment.fileName}`
}
