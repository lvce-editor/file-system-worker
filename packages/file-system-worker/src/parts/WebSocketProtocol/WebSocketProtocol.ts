import * as Protocol from '../Protocol/Protocol.ts'

export const getWebSocketProtocol = (locationProtocol: string): string => {
  return locationProtocol === Protocol.Https ? Protocol.Wss : Protocol.Ws
}
