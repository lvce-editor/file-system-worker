import { createFileSystemProcessRpc } from '../CreateFileSystemProcessRpc/CreateFileSystemProcessRpc.ts'
import { createUnavailableFileSystemProcessRpc } from '../CreateUnavailableFileSystemProcessRpc/CreateUnavailableFileSystemProcessRpc.ts'
import * as FileSystemProcess from '../FileSystemProcess/FileSystemProcess.ts'
import * as PlatformType from '../PlatformType/PlatformType.ts'

export const initializeFileSystemProcess = async (platform: number): Promise<void> => {
  if (platform === PlatformType.Web) {
    FileSystemProcess.set(createUnavailableFileSystemProcessRpc())
    return
  }
  const rpc = await createFileSystemProcessRpc(platform)
  FileSystemProcess.set(rpc)
}
