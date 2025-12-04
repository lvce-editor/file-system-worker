import * as Assert from '../Assert/Assert.ts'

/**
 * Do not use directly, use FileSystemHtml.getChildHandles
 * instead which prompts for the required permission to
 * retrieve the child handles
 */
export const getChildHandles = async (handle: FileSystemDirectoryHandle): Promise<FileSystemHandle[]> => {
  Assert.object(handle)
  // @ts-ignore - values() exists on FileSystemDirectoryHandle but TypeScript types may not include it
  const handles = await Array.fromAsync(handle.values())
  return handles as FileSystemHandle[]
}

export const getFileHandle = (handle: FileSystemDirectoryHandle, name: string): Promise<FileSystemFileHandle> => {
  return handle.getFileHandle(name)
}
