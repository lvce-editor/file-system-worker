import * as WebSocketProtocol from '../WebSocketProtocol/WebSocketProtocol.ts'

export const getWebSocketUrl = (type: string, host: string, locationProtocol: string): string => {
  const wsProtocol = WebSocketProtocol.getWebSocketProtocol(locationProtocol)
  return `${wsProtocol}//${host}/websocket/${type}`
}
