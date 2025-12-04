import type { Rpc } from '@lvce-editor/rpc-registry'
import { RpcId, get } from '@lvce-editor/rpc-registry'
import { RendererWorker } from '@lvce-editor/rpc-registry'

export const { set } = RendererWorker

let rpcPromise: Promise<Rpc> | undefined = undefined

const getOrCreate = (): Promise<Rpc> => {
  if (!rpcPromise) {
    rpcPromise = Promise.resolve(get(RpcId.RendererWorker))
  }

  return rpcPromise
}

export const invoke = async (method: string, ...params: readonly any[]): Promise<any> => {
  const rpc = await getOrCreate()
  return rpc.invoke(method, ...params)
}
