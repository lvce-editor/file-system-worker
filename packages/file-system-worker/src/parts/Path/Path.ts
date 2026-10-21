export const join = (pathSeparator: string, ...parts: readonly string[]): string => {
  return parts.join(pathSeparator)
}

export const dirname = (pathSeparator: string, path: string): string => {
  const index = path.lastIndexOf(pathSeparator)
  return index === -1 ? path : path.slice(0, index)
}

export const getBaseName = (pathSeparator: string, path: string): string => {
  return path.slice(path.lastIndexOf(pathSeparator) + 1)
}
