export interface BoxItem {
  type: 'file' | 'folder'
  id: string
  name: string
  size?: number
  modified_at?: string
  content_modified_at?: string
}

export interface BoxFolderItemsResponse {
  entries: BoxItem[]
  total_count: number
  offset: number
  limit: number
}

export interface BoxFileToProcess {
  id: string
  name: string
  size: number
  modifiedTime: Date
  parentPath: string
  depth: number
}
