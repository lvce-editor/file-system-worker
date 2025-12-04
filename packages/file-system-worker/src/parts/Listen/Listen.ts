import { WebWorkerRpcClient } from '@lvce-editor/rpc'
import * as CommandMap from '../CommandMap/CommandMap.ts'
import * as CommandMapRef from '../CommandMapRef/CommandMapRef.ts'
import * as ExtensionHostWorker from '../ExtensionHostWorker/ExtensionHostWorker.ts'
import { createExtensionHostRpc } from '../InitializeExtensionHostWorker/InitializeExtensionHostWorker.ts'
import { createRendererProcessRpc } from '../InitializeRendererProcess/InitializeRendererProcess.ts'
import * as RendererProcess from '../RendererProcess/RendererProcess.ts'
import * as RendererWorker from '../RendererWorker/RendererWorker.ts'

export const listen = async (): Promise<void> => {
  Object.assign(CommandMapRef.commandMapRef, CommandMap.commandMap)
  ExtensionHostWorker.setFactory(createExtensionHostRpc)
  RendererProcess.setFactory(createRendererProcessRpc)
  const rpc = await WebWorkerRpcClient.create({
    commandMap: CommandMap.commandMap,
  })
  RendererWorker.set(rpc)
}
