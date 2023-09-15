import { deleteCollection } from '@george-ai/typesense-client'

const dropCollection = async () => {
  await deleteCollection()
}

dropCollection()
