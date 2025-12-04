// @ts-ignore - HtmlFile is an external dependency
import * as HtmlFile from '../HtmlFile/HtmlFile.ts'

export const getFile = (handle: FileSystemFileHandle): Promise<File> => {
  return handle.getFile()
}

export const getBinaryString = async (handle: FileSystemFileHandle): Promise<string> => {
  const file = await getFile(handle)
  const text = await HtmlFile.getBinaryString(file)
  return text
}

export const write = async (handle: FileSystemFileHandle, content: string): Promise<void> => {
  const writable = await handle.createWritable()
  await writable.write(content)
  await writable.close()
}

export const writeResponse = async (handle: FileSystemFileHandle, response: Response): Promise<void> => {
  const writable = await handle.createWritable()
  if (response.body) {
    await response.body.pipeTo(writable)
  }
}
