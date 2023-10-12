import { deleteSummaryDocument } from '@george-ai/typesense-client'

const dropCollection = async () => {
  await deleteSummaryDocument()
}

dropCollection()
