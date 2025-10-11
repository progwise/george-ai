export const formatBytes = (bytes: number | null | undefined): string => {
  if (bytes === null || bytes === undefined) return ''
  if (bytes === 0) return '0 Bytes'
  const kilobytes = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const kilobyteExponent = Math.floor(Math.log(bytes) / Math.log(kilobytes))
  return parseFloat((bytes / Math.pow(kilobytes, kilobyteExponent)).toFixed(1)) + ' ' + sizes[kilobyteExponent]
}
