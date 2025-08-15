import * as RpcRegistry from '@lvce-editor/rpc-registry'
import * as FileSystemProcess from '../FileSystemProcess/FileSystemProcess.ts'
import * as WatchCallbacks from '../WatchCallbacks/WatchCallbacks.ts'

export const watchFile = async (id: number, uri: string, rpcId: number): Promise<void> => {
  const commandId = 'Output.executeWatchCallback'
  WatchCallbacks.registerWatchCallback(id, async () => {
    const rpc = RpcRegistry.get(rpcId)
    if (!rpc) {
      return
    }
    await rpc.invoke(commandId)
  })
  // @ts-ignore
  await FileSystemProcess.invoke('FileSystem.watchFile', id, uri)
}

export const executeWatchCallback = async (id: number): Promise<void> => {
  try {
    await WatchCallbacks.executeWatchCallBack(id)
  } catch (error) {
    console.error(error)
  }
}

export const unwatchFile = async (id: number): Promise<void> => {
  WatchCallbacks.unregisterWatchCallback(id)
  // @ts-ignore
  await FileSystemProcess.invoke('FileSystem.unwatchFile', id)
}
