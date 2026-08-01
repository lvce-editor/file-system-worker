import { type Rpc, WebSocketRpcParent, WebSocketRpcParent2 } from '@lvce-editor/rpc'
import { RendererWorker } from '@lvce-editor/rpc-registry'
import { VError } from '@lvce-editor/verror'
import * as CommandMapRef from '../CommandMapRef/CommandMapRef.ts'

export const createFileSystemProcessRpcNode = async (): Promise<Rpc> => {
  try {
    try {
      const { protocols, url } = (await RendererWorker.invoke('WebSocketCapability.create', 'file-system-process')) as {
        readonly protocols: string[]
        readonly url: string
      }
      return await WebSocketRpcParent.create({
        commandMap: CommandMapRef.commandMapRef,
        webSocket: new WebSocket(url, protocols),
      })
    } catch (error) {
      if (!(error instanceof Error && error.message.includes('WebSocketCapability.create') && /command not found|not found/i.test(error.message))) {
        throw error
      }
    }
    const rpc = await WebSocketRpcParent2.create({
      commandMap: CommandMapRef.commandMapRef,
      type: 'file-system-process',
    })
    return rpc
  } catch (error) {
    throw new VError(error, `Failed to create file system process rpc`)
  }
}
