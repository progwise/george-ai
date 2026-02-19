import { deleteFiles } from './delete-files'
import { FileFilterConfig, FileInfo, applyFileFilters, parseFilterConfig } from './filter-files'
import { MAX_FILE_SIZE, isSizeAcceptable } from './is-size-acceptable'
import { prepareUpload } from './prepare-upload'
import { readChunks } from './read-chunks'
import { uploadFile } from './upload-file'

export default {
  deleteFiles,
  uploadFile,
  prepareUpload,
  readChunks,
  isSizeAcceptable,
  applyFileFilters,
  parseFilterConfig,
  MAX_FILE_SIZE,
}

export {
  deleteFiles,
  uploadFile,
  prepareUpload,
  readChunks,
  isSizeAcceptable,
  applyFileFilters,
  parseFilterConfig,
  MAX_FILE_SIZE,
  type FileInfo,
  type FileFilterConfig,
}
