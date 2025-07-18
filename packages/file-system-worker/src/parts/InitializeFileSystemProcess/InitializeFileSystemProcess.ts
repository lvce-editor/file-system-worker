import { createFileSystemProcessRpc } from '../CreateFileSystemProcessRpc/CreateFileSystemProcessRpc.ts'
import * as FileSystemProcess from '../FileSystemProcess/FileSystemProcess.ts'
import * as PlatformType from '../PlatformType/PlatformType.ts'

export const initializeFileSytemProcess = async (platform: number): Promise<void> => {
  if (platform === PlatformType.Web) {
    return
  }
  const rpc = await createFileSystemProcessRpc(platform)
  FileSystemProcess.set(rpc)
}
