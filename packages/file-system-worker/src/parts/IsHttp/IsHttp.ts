import * as Protocol from '../Protocol/Protocol.ts'

export const isHttp = (uri: string): boolean => {
  return uri.startsWith(Protocol.Http) || uri.startsWith(Protocol.Https)
}
