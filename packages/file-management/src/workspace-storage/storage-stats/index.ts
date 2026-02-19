import { addStorageStats } from './add-storage-stats'
import { sanitizeStorageStats } from './sanitize-storage-stats'
import { subtractStorageStats } from './subtract-storage-stats'
import { updateStats } from './update-stats'

export default {
  add: addStorageStats,
  subtract: subtractStorageStats,
  update: updateStats,
  sanitize: sanitizeStorageStats,
}

export { addStorageStats, subtractStorageStats, sanitizeStorageStats, updateStats }
