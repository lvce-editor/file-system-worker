import { WebWorkerRpcClient } from '@lvce-editor/rpc'
import * as CommandMap from '../CommandMap/CommandMap.ts'
import * as RendererWorker from '../RendererWorker/RendererWorker.ts'

export const listen = async (): Promise<void> => {
  const rpc = await WebWorkerRpcClient.create({
    commandMap: CommandMap.commandMap,
  })
  RendererWorker.set(rpc)
}
