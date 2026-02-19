import { createEntry } from './create-entry'
import { deleteEntry, deleteEntryOrThrow } from './delete-entry'
import { entryExists } from './entry-exists'
import { getEntry } from './get-entry'
import { getEntryId } from './get-entry-id'
import { getEntryIdentifier } from './get-entry-identifier'
import { getEntryOrThrow } from './get-entry-or-throw'
import {
  getAttachmentsPath,
  getDocumentsPath,
  getEntryPath,
  getExtractionsPath,
  getLibrariesPath,
} from './get-entry-path'
import { saveEntry } from './save-entry'

export default {
  createEntry,
  deleteEntry,
  deleteEntryOrThrow,
  entryExists,
  getEntryIdentifier,
  getEntryPath,
  getEntry,
  getEntryOrThrow,
  saveEntry,
  getEntryId,
  getAttachmentsPath,
  getExtractionsPath,
  getDocumentsPath,
  getLibrariesPath,
}

export {
  createEntry,
  deleteEntry,
  deleteEntryOrThrow,
  entryExists,
  getEntryIdentifier,
  getEntryPath,
  getEntry,
  getEntryOrThrow,
  saveEntry,
  getEntryId,
  getAttachmentsPath,
  getExtractionsPath,
  getDocumentsPath,
  getLibrariesPath,
}
