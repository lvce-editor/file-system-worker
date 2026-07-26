import * as Protocol from '../Protocol/Protocol.ts'

export const isFetch = (uri: string): boolean => {
  return uri.startsWith(Protocol.Fetch)
}
