import type { SelectedFileHandle } from '../HtmlHandle/HtmlHandle.ts'
import * as HtmlFile from '../HtmlFile/HtmlFile.ts'

export const getFile = async (handle: FileSystemFileHandle | SelectedFileHandle): Promise<File> => {
  if ('file' in handle) return handle.file
  return handle.getFile()
}

export const getBinaryString = async (handle: FileSystemFileHandle | SelectedFileHandle): Promise<string> => {
  const file = await getFile(handle)
  const text = await HtmlFile.getBinaryString(file)
  return text
}

export const write = async (handle: FileSystemFileHandle | SelectedFileHandle, content: string | Blob): Promise<void> => {
  if ('readonly' in handle && handle.readonly) {
    throw new Error(`File ${handle.name} is read-only`)
  }
  const writable = await (handle as FileSystemFileHandle).createWritable()
  await writable.write(content)
  await writable.close()
}

export const writeResponse = async (handle: FileSystemFileHandle | SelectedFileHandle, response: Response): Promise<void> => {
  if ('readonly' in handle && handle.readonly) {
    throw new Error(`File ${handle.name} is read-only`)
  }
  const writable = await (handle as FileSystemFileHandle).createWritable()
  if (response.body) {
    await response.body.pipeTo(writable)
  }
}
