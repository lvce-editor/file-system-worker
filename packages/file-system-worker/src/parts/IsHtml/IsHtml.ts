import * as Protocol from '../Protocol/Protocol.ts'

export const isHtml = (uri: string): boolean => {
  return uri.startsWith(Protocol.Html)
}
