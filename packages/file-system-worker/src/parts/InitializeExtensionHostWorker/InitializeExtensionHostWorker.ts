import { LazyTransferMessagePortRpcParent } from '@lvce-editor/rpc'
import { ExtensionHost, RendererWorker } from '@lvce-editor/rpc-registry'
import { VError } from '@lvce-editor/verror'

export const initializeExtensionHostWorker = async (): Promise<void> => {
  try {
    const rpc = await LazyTransferMessagePortRpcParent.create({
      commandMap: {},
      send: (port) => RendererWorker.sendMessagePortToExtensionManagementWorker(port, 0),
    })
    ExtensionHost.set(rpc)
  } catch (error) {
    throw new VError(error, `Failed to create extension host rpc`)
  }
}
