import * as Assert from '../Assert/Assert.ts'
import * as GetFileExtension from '../GetFileExtension/GetFileExtension.ts'

export const join = (pathSeparator: string, ...parts: readonly string[]): string => {
  return parts.join(pathSeparator)
}
