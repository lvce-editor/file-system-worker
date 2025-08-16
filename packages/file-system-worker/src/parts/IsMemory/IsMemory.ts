import * as Protocol from '../Protocol/Protocol.ts'

export const isMemory = (uri: string): boolean => {
  return uri.startsWith(Protocol.Memory)
}
