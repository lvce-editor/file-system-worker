import * as FileSystemDirectoryHandle from '../FileSystemDirectoryHandle/FileSystemDirectoryHandle.ts'
import * as FileSystemDisk from '../FileSystemDisk/FileSystemDisk.ts'

export const uploadDirectory = async (
  fileSystemHandle: FileSystemDirectoryHandle,
  pathSeparator: string,
  root: string,
  uploadHandles: (
    fileSystemHandles: FileSystemHandle[],
    pathSeparator: string,
    root: string,
  ) => Promise<void>,
): Promise<void> => {
  const folderPath = root + pathSeparator + fileSystemHandle.name
  await FileSystemDisk.mkdir(folderPath)
  const childHandles = await FileSystemDirectoryHandle.getChildHandles(fileSystemHandle)
  await uploadHandles(childHandles, pathSeparator, folderPath)
}

