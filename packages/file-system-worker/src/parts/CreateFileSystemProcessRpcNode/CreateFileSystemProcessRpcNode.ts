import { type Rpc, WebSocketRpcParent2 } from '@lvce-editor/rpc'
import { VError } from '@lvce-editor/verror'

export const createFileSystemProcessRpcNode = async (): Promise<Rpc> => {
  try {
    const rpc = await WebSocketRpcParent2.create({
      type: 'file-system-process',
      commandMap: {},
    })
    return rpc
  } catch (error) {
    throw new VError(error, `Failed to create file system process rpc`)
  }
}
