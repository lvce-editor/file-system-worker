import { type Rpc, TransferMessagePortRpcParent } from '@lvce-editor/rpc'
import { RendererWorker } from '@lvce-editor/rpc-registry'
import { VError } from '@lvce-editor/verror'

export const createRendererProcessRpc = async (): Promise<Rpc> => {
  try {
    const rpc = await TransferMessagePortRpcParent.create({
      commandMap: {},
      send: RendererWorker.sendMessagePortToRendererProcess,
    })
    return rpc
  } catch (error) {
    throw new VError(error, `Failed to create renderer process rpc`)
  }
}
