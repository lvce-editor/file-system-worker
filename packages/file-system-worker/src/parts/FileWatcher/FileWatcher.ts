import { Rpc } from '@lvce-editor/rpc'
import * as WatchCallbacks from '../WatchCallbacks/WatchCallbacks.ts'
import * as FileSystemProcess from '../FileSystemProcess/FileSystemProcess.ts'

export const watchFile = async (id: number, uri: string, rpc: Rpc): Promise<void> => {
  const commandId = 'Output.executeWatchCallback'
  WatchCallbacks.registerWatchCallback(id, async () => {
    await rpc.invoke(commandId)
  })
  // @ts-ignore
  await FileSystemProcess.invoke('FileSystem.watchFile', id, uri)
}

export const fire = async (id: number): Promise<void> => {
  await WatchCallbacks.executeWatchCallBack(id)
}

export const unwatchFile = async (id: number): Promise<void> => {
  WatchCallbacks.unregisterWatchCallback(id)
  // @ts-ignore
  await FileSystemProcess.invoke('FileSystem.unwatchFile', id)
}
