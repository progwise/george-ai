import attachment from './attachment'
import backup from './backup'
import { getReaderForUri, getUri, parseUri } from './commons'
import document from './document'
import entry from './entry'
import extraction from './extraction'
import library from './library'
import migrate from './migrate-legacy'
import reconcile from './reconcile'
import workspace from './workspace'

export * from './analysis'
export * from './attachment'
export * from './document'
export * from './extraction'
export * from './library'
export * from './migrate-legacy'
export * from './schema'
export * from './workspace'

export {
  attachment,
  backup,
  extraction,
  document,
  library,
  migrate,
  reconcile,
  workspace,
  entry,
  getUri,
  parseUri,
  getReaderForUri,
}

export default {
  attachment,
  extraction,
  document,
  library,
  migrate,
  reconcile,
  workspace,
  entry,
  backup,
  getUri,
  parseUri,
  getReaderForUri,
}
