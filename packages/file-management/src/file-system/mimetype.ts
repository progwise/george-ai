import { extensions, lookup } from 'mime-types'

export function lookupMimeType(fileName: string): string {
  return lookup(fileName) || 'application/octet-stream'
}

export function getExtensionFromMimeType(mimeType: string): string | false {
  return extensions[mimeType]?.[0] || false
}
