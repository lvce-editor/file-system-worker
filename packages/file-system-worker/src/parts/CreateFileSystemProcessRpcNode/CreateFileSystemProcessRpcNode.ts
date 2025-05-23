import { type Rpc } from '@lvce-editor/rpc'
import { VError } from '@lvce-editor/verror'

export const createFileSystemProcessRpcNode = async (): Promise<Rpc> => {
  try {
    // TODO create websocket rpc
    return {} as any
  } catch (error) {
    throw new VError(error, `Failed to create file system process rpc`)
  }
}
