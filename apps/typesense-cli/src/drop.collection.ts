import { deleteSummaryCollection } from '@george-ai/typesense-client'

const dropCollection = async () => {
  await deleteSummaryCollection()
}

dropCollection()
