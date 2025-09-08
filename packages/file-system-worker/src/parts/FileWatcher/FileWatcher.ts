import { assertUri } from '../AssertUri/AssertUri.ts'
import * as FileSystemProcess from '../FileSystemProcess/FileSystemProcess.ts'
import * as Protocol from '../Protocol/Protocol.ts'
import * as WatchCallbacks from '../WatchCallbacks/WatchCallbacks.ts'

// TODO support file watchers for differenr protocols like memfs, http

export const watchFile = async (id: number, uri: string, rpcId: number): Promise<void> => {
  assertUri(uri)
  const commandId = 'Output.executeWatchCallback'
  WatchCallbacks.registerWatchCallback(id, rpcId, commandId)

  if (uri.startsWith(Protocol.File)) {
    // @ts-ignore
    await FileSystemProcess.invoke('FileSystem.watchFile', id, uri)
  }
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
  // TODO only if it is a file uri
  // @ts-ignore
  await FileSystemProcess.invoke('FileSystem.unwatchFile', id)
}
