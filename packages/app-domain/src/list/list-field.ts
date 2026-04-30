export const LIST_FIELD_TYPES = ['string', 'text', 'markdown', 'number', 'date', 'datetime', 'boolean'] as const
export type ListFieldType = (typeof LIST_FIELD_TYPES)[number]

export const LIST_FIELD_SOURCE_TYPES = ['file_property', 'llm_computed'] as const
export type ListFieldSourceType = (typeof LIST_FIELD_SOURCE_TYPES)[number]

export const LIST_FIELD_FILE_PROPERTIES = [
  'itemName',
  'name',
  'originUri',
  'crawlerUrl',
  'originModificationDate',
  'size',
  'mimeType',
  'source',
  'extractedAt',
  'lastUpdate',
] as const
export type ListFieldFileProperty = (typeof LIST_FIELD_FILE_PROPERTIES)[number]

export const LIST_FIELD_CONTEXT_TYPES = ['fieldReference', 'vectorSearch', 'webFetch', 'fullContent'] as const
export type ListFieldContextType = (typeof LIST_FIELD_CONTEXT_TYPES)[number]
