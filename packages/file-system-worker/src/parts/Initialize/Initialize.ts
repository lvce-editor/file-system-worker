import { createFileSystemProcessRpc } from '../CreateFileSystemProcessRpc/CreateFileSystemProcessRpc.ts'
import * as FileSystemProcess from '../FileSystemProcess/FileSystemProcess.ts'

export const initialize = async (platform: number): Promise<void> => {
  const rpc = await createFileSystemProcessRpc(platform)
  FileSystemProcess.set(rpc)
}
