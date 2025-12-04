export const getFileExtension = (uri: string): string => {
  const lastDot = uri.lastIndexOf('.')
  if (lastDot === -1) {
    return ''
  }
  const lastSlash = Math.max(uri.lastIndexOf('/'), uri.lastIndexOf('\\'))
  if (lastSlash > lastDot) {
    return ''
  }
  return uri.slice(lastDot + 1)
}

