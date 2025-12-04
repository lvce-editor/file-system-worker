import * as Arrays from '../Arrays/Arrays.js'
import * as Assert from '../Assert/Assert.ts'

/**
 * Do not use directly, use FileSystemHtml.getChildHandles
 * instead which prompts for the required permission to
 * retrieve the child handles
 */
export const getChildHandles = async (
  handle: FileSystemDirectoryHandle,
): Promise<FileSystemHandle[]> => {
  Assert.object(handle)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - values() exists on FileSystemDirectoryHandle but TypeScript types may not include it
  const handles = await Arrays.fromAsync(handle.values())
  return handles
}

export const getFileHandle = (
  handle: FileSystemDirectoryHandle,
  name: string,
): Promise<FileSystemFileHandle> => {
  return handle.getFileHandle(name)
}

