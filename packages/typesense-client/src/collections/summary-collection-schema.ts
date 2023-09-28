import { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections.js'

export const summaryCollectionSchema: CollectionCreateSchema = {
  name: 'scraped_web_pages_summaries',
  fields: [
    { name: 'id', type: 'string' },
    { name: 'title', type: 'string' },
    { name: 'url', type: 'string' },
    { name: 'language', type: 'string', facet: true },
    { name: 'originalContent', type: 'string' },
    { name: 'publicationState', type: 'string', facet: true },
    { name: 'keywords', type: 'string[]' },
    { name: 'summary', type: 'string' },
    { name: 'largeLanguageModel', type: 'string', facet: true },
    { name: 'popularity', type: 'int32' },
  ],
}
