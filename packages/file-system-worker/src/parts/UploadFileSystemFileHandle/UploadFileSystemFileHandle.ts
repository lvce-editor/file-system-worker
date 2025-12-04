 
import * as FileSystemDisk from '../FileSystemDisk/FileSystemDisk.ts'
import * as FilesystemFileHandle from '../FileSystemFileHandle/FileSystemFileHandle.ts'
// @ts-ignore - Path is an external dependency
import * as Path from '../Path/Path.js'

export const uploadFile = async (
  fileSystemHandle: FileSystemFileHandle,
  pathSeparator: string,
  root: string,
): Promise<void> => {
  const content = await FilesystemFileHandle.getBinaryString(fileSystemHandle)
  const to = Path.join(pathSeparator, root, fileSystemHandle.name)
  await FileSystemDisk.writeFile(to, content)
}

