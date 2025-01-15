import PocketBase from 'pocketbase'

const POCKETBASE_URL =
  process.env.POCKETBASE_URL || 'http://gai-pocketbase:8090'

const POCKETBASE_TOKEN = process.env.POCKETBASE_TOKEN || ''

const pb = new PocketBase(POCKETBASE_URL)
pb.authStore.save(POCKETBASE_TOKEN)
pb.autoCancellation(false)

export const getUnprocessedDocuments = async () => {
  const documentsCollection = pb.collection('documents')

  const documents = await documentsCollection.getFullList({
    filter: 'processed!=true',
  })
  const returnValue = await Promise.all(
    documents.map(async (document) => {
      const content = await documentsCollection.getOne(document.id, {
        expand: 'id, file, processed, lastProcessed',
      })
      const fileToken = await pb.files.getToken()
      const fileUrl = `${POCKETBASE_URL}/api/files/${document.collectionId}/${content.id}/${content.file}?token=${fileToken}`

      const fileResponse = await fetch(fileUrl, { method: 'GET' })
      if (!fileResponse.ok) {
        throw new Error(
          `Error fetching file for doc ID ${document.id}: ${fileResponse.statusText}`,
        )
      }
      const fileBlob = await fileResponse.blob()
      const fileName = content.file
      const fileExtension = fileName.split('.').pop()?.toLowerCase()
      if (!fileExtension) {
        throw new Error(`No extension found for file: ${fileName}`)
      }
      return {
        collectionId: document.collectionId,
        documentId: document.id,
        fileName: content.file,
        url: fileUrl,
        blob: fileBlob,
        docType: fileExtension,
      }
    }),
  )
  return returnValue
}

export const setDocumentProcessed = async ({
  documentId,
}: {
  documentId: string
}) => {
  console.log('setDocumentProcessed', { documentId })
  const documentsCollection = pb.collection('documents')
  await documentsCollection.update(documentId, {
    processed: true,
    lastProcessed: new Date().toISOString(),
  })
}
