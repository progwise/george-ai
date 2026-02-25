import pLimit from 'p-limit'

export const GLOBAL_STORAGE_LIMIT = pLimit(20)
