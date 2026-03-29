import { getIdentifier } from '../schema'
import { getUri, parseUri } from './uri'

describe('URI', () => {
  it('should generate and parse a workspace-level URI correctly', () => {
    const identifier = getIdentifier({
      workspaceId: 'workspace123',
    })
    const fileName = 'file.txt'
    const uri = getUri(identifier, fileName)
    expect(uri).toBe('georgeai://workspaces/workspace123/file.txt')

    const parsed = parseUri(uri)
    expect(parsed).toEqual({
      workspaceId: 'workspace123',
      fileName: 'file.txt',
    })
  })

  it('should generate and parse a library-level URI with attachment correctly', () => {
    const identifier = getIdentifier({
      workspaceId: 'workspace123',
      libraryId: 'library456',
    })
    const fileName = 'attachment.pdf'
    const uri = getUri(identifier, fileName, { attachment: true })
    expect(uri).toBe('georgeai://workspaces/workspace123/libraries/library456/attachments/attachment.pdf')

    const parsed = parseUri(uri)
    expect(parsed).toEqual({
      workspaceId: 'workspace123',
      libraryId: 'library456',
      fileName: 'attachment.pdf',
      attachment: true,
    })
  })

  it('should generate and parse a document-level URI with analysis correctly', () => {
    const identifier = getIdentifier({
      workspaceId: 'workspace123',
      libraryId: 'library456',
      documentId: 'document789',
    })
    const fileName = 'analysis.json'
    const uri = getUri(identifier, fileName, { analysis: true })
    expect(uri).toBe(
      'georgeai://workspaces/workspace123/libraries/library456/documents/document789/analysis/analysis.json',
    )

    const parsed = parseUri(uri)
    expect(parsed).toEqual({
      workspaceId: 'workspace123',
      libraryId: 'library456',
      documentId: 'document789',
      fileName: 'analysis.json',
      analysis: true,
    })
  })

  it('should generate and parse an extraction-level URI correctly', () => {
    const identifier = getIdentifier({
      workspaceId: 'workspace123',
      libraryId: 'library456',
      documentId: 'document789',
      extractionMethod: 'pdfExtraction',
    })
    const uri = getUri(identifier, 'output.md')
    expect(uri).toBe(
      'georgeai://workspaces/workspace123/libraries/library456/documents/document789/extractions/pdfExtraction/output.md',
    )

    const parsed = parseUri(uri)
    expect(parsed).toEqual({
      workspaceId: 'workspace123',
      libraryId: 'library456',
      documentId: 'document789',
      extractionMethod: 'pdfExtraction',
      fileName: 'output.md',
    })
  })

  it('should generate and parse an extraction-level URI with attachment correctly', () => {
    const identifier = getIdentifier({
      workspaceId: 'workspace123',
      libraryId: 'library456',
      documentId: 'document789',
      extractionMethod: 'pdfExtraction',
    })
    const uri = getUri(identifier, 'image.png', { attachment: true })
    expect(uri).toBe(
      'georgeai://workspaces/workspace123/libraries/library456/documents/document789/extractions/pdfExtraction/attachments/image.png',
    )

    const parsed = parseUri(uri)
    expect(parsed).toEqual({
      workspaceId: 'workspace123',
      libraryId: 'library456',
      documentId: 'document789',
      extractionMethod: 'pdfExtraction',
      fileName: 'image.png',
      attachment: true,
    })
  })

  it('should generate and parse an extraction backup URI correctly', () => {
    const identifier = getIdentifier({
      workspaceId: 'workspace123',
      libraryId: 'library456',
      documentId: 'document789',
    })
    const backupFolder = 'pdfExtraction_1773510848855'
    const uri = getUri(identifier, 'output.md', { extractionBackup: backupFolder })
    expect(uri).toBe(
      'georgeai://workspaces/workspace123/libraries/library456/documents/document789/extractions_backup/pdfExtraction_1773510848855/output.md',
    )

    const parsed = parseUri(uri)
    expect(parsed).toEqual({
      workspaceId: 'workspace123',
      libraryId: 'library456',
      documentId: 'document789',
      extractionBackupFolderName: backupFolder,
      fileName: 'output.md',
    })
  })

  it('should generate and parse an extraction backup URI with attachment correctly', () => {
    const identifier = getIdentifier({
      workspaceId: 'workspace123',
      libraryId: 'library456',
      documentId: 'document789',
    })
    const backupFolder = 'pdfExtraction_1773510848855'
    const uri = getUri(identifier, 'image.png', { extractionBackup: backupFolder, attachment: true })
    expect(uri).toBe(
      'georgeai://workspaces/workspace123/libraries/library456/documents/document789/extractions_backup/pdfExtraction_1773510848855/attachments/image.png',
    )

    const parsed = parseUri(uri)
    expect(parsed).toEqual({
      workspaceId: 'workspace123',
      libraryId: 'library456',
      documentId: 'document789',
      extractionBackupFolderName: backupFolder,
      fileName: 'image.png',
      attachment: true,
    })
  })

  it('should default fileName to manifest.json when not provided', () => {
    const identifier = getIdentifier({
      workspaceId: 'workspace123',
      libraryId: 'library456',
      documentId: 'document789',
    })
    const uri = getUri(identifier)
    expect(uri).toBe(
      'georgeai://workspaces/workspace123/libraries/library456/documents/document789/manifest.json',
    )

    const parsed = parseUri(uri)
    expect(parsed.fileName).toBe('manifest.json')
  })

  it('should throw on an invalid URI', () => {
    expect(() => parseUri('not-a-georgeai-uri')).toThrow('Invalid URI format')
  })

  it('should throw on an empty string', () => {
    expect(() => parseUri('')).toThrow('Invalid URI format')
  })
})
