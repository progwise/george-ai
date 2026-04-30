import { deleteFiles } from './delete-files'
import { FileFilterConfig, FileInfo, applyFileFilters, parseFilterConfig } from './filter-files'
import { MAX_FILE_SIZE, isSizeAcceptable } from './is-size-acceptable'
import { readChunks } from './read-chunks'

export default {
  deleteFiles,
  readChunks,
  isSizeAcceptable,
  applyFileFilters,
  parseFilterConfig,
  MAX_FILE_SIZE,
}

export {
  deleteFiles,
  readChunks,
  isSizeAcceptable,
  applyFileFilters,
  parseFilterConfig,
  MAX_FILE_SIZE,
  type FileInfo,
  type FileFilterConfig,
}
