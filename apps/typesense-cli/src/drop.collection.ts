import { deleteCollection } from '@george-ai/typesense-client'

const dropCollection = async () => {
  await deleteCollection('scraped_web_pages_summaries')
}

dropCollection()
