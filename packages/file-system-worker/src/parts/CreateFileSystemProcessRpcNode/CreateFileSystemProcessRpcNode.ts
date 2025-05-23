import { type Rpc, WebSocketRpcParent } from '@lvce-editor/rpc'
import { VError } from '@lvce-editor/verror'
import * as GetWebSocketUrl from '../GetWebSocketUrl/GetWebSocketUrl.ts'
import * as Location from '../Location/Location.ts'

export const createFileSystemProcessRpcNode = async (): Promise<Rpc> => {
  try {
    const host = Location.getHost()
    const protocol = Location.getProtocol()
    const wsUrl = GetWebSocketUrl.getWebSocketUrl('file-system-process', host, protocol)
    const webSocket = new WebSocket(wsUrl)
    const rpc = await WebSocketRpcParent.create({
      webSocket,
      commandMap: {},
    })
    return rpc
  } catch (error) {
    throw new VError(error, `Failed to create file system process rpc`)
  }
}
