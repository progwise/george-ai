import { deleteSummaryCollection } from '@george-ai/typesense-client'

const dropCollection = async () => {
  try {
    await deleteSummaryCollection()
  } catch (error) {
    console.error('Error while deleting the summary collection:', error)
  }
}

dropCollection()
