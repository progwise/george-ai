//using index for faster queries
export type FileStatus = 'Pending' | 'Processing' | 'Completed' | 'Failed'

export const FileStatus = {
  Pending: 'Pending' as FileStatus,
  Processing: 'Processing' as FileStatus,
  Completed: 'Completed' as FileStatus,
  Failed: 'Failed' as FileStatus,
}
