import type { Rpc } from '@lvce-editor/rpc-registry';
import { ExtensionHost } from '@lvce-editor/rpc-registry'
import { createExtensionHostRpc } from '../InitializeExtensionHostWorker/InitializeExtensionHostWorker.ts'

export const { set } = ExtensionHost

let rpcPromise: Promise<Rpc> | undefined = undefined

const getOrCreate = (): Promise<Rpc> => {
  if (!rpcPromise) {
    rpcPromise = createExtensionHostRpc()
  }

  return rpcPromise
}

export const invoke = async (method: string, ...params: readonly any[]): Promise<any> => {
  const rpc = await getOrCreate()
  return rpc.invoke(method, ...params)
}
