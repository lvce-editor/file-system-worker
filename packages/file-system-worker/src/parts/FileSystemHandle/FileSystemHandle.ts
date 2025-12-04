import * as RendererProcess from '../RendererProcess/RendererProcess'

export const getFileHandles = (ids: readonly string[]): Promise<FileSystemHandle[]> => {
  return RendererProcess.invoke('FileHandles.get', ids) as Promise<FileSystemHandle[]>
}

export const addFileHandle = (fileHandle: FileSystemHandle): Promise<void> => {
  return RendererProcess.invoke('FileSystemHandle.addFileHandle', fileHandle) as Promise<void>
}
