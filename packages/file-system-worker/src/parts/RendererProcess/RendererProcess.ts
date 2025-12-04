import type { Rpc } from '@lvce-editor/rpc-registry'
import { RendererWorker } from '@lvce-editor/rpc-registry'

export const { set } = RendererWorker

let rpcPromise: Promise<Rpc> | undefined = undefined

const getOrCreate = (): Promise<Rpc> => {
  if (!rpcPromise) {
    rpcPromise = Promise.resolve(RendererWorker.get())
  }

  return rpcPromise
}

export const invoke = async (method: string, ...params: readonly any[]): Promise<any> => {
  const rpc = await getOrCreate()
  return rpc.invoke(method, ...params)
}

