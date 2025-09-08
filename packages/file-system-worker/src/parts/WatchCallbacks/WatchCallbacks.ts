import * as RpcRegistry from '@lvce-editor/rpc-registry'

interface WatchCallbackEntry {
  readonly rpcId: number
  readonly commandId: string
}

const watchCallbacks: Record<number, WatchCallbackEntry> = Object.create(null)

export const registerWatchCallback = (id: number, rpcId: number, commandId: string): void => {
  watchCallbacks[id] = {
    rpcId,
    commandId,
  }
}

export const executeWatchCallBack = async (id: number): Promise<void> => {
  const entry = watchCallbacks[id]
  if (!entry) {
    throw new Error(`watch callback ${id} not found`)
  }
  const { rpcId, commandId } = entry
  const rpc = RpcRegistry.get(rpcId)
  await rpc.invoke(commandId, id)
}

export const unregisterWatchCallback = (id: number): void => {
  delete watchCallbacks[id]
}
