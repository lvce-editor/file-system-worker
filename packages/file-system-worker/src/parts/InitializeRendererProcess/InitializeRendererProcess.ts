import { LazyTransferMessagePortRpcParent } from '@lvce-editor/rpc'
import { RendererProcess, RendererWorker } from '@lvce-editor/rpc-registry'
import { VError } from '@lvce-editor/verror'

export const initializeRendererProcess = async (): Promise<void> => {
  try {
    const rpc = await LazyTransferMessagePortRpcParent.create({
      commandMap: {},
      send: RendererWorker.sendMessagePortToRendererProcess,
    })
    RendererProcess.set(rpc)
  } catch (error) {
    throw new VError(error, `Failed to create renderer process rpc`)
  }
}
