// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Path is an external dependency
import * as Path from '../Path/Path.js'
import * as FileSystemDisk from '../FileSystemDisk/FileSystemDisk.ts'
import * as FilesystemFileHandle from '../FileSystemFileHandle/FileSystemFileHandle.ts'

export const uploadFile = async (
  fileSystemHandle: FileSystemFileHandle,
  pathSeparator: string,
  root: string,
): Promise<void> => {
  const content = await FilesystemFileHandle.getBinaryString(fileSystemHandle)
  const to = Path.join(pathSeparator, root, fileSystemHandle.name)
  await FileSystemDisk.writeFile(to, content)
}

