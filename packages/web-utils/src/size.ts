export const formatBytes = (bytes: number | null | undefined): string => {
  if (bytes === null || bytes === undefined) return ''
  if (bytes === 0) return '0 Bytes'
  const kilobytes = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB']
  const kilobyteExponent = Math.min(Math.floor(Math.log(bytes) / Math.log(kilobytes)), sizes.length - 1)
  return parseFloat((bytes / Math.pow(kilobytes, kilobyteExponent)).toFixed(1)) + ' ' + sizes[kilobyteExponent]
}
