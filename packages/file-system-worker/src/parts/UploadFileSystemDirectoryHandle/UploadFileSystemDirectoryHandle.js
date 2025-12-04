import * as FileSystem from '../FileSystem/FileSystem.ts'
import * as FileSystemDirectoryHandle from '../FileSystemDirectoryHandle/FileSystemDirectoryHandle.ts'

/**
 *
 * @param {FileSystemDirectoryHandle} fileSystemHandle
 * @param {string} pathSeparator
 * @param {string} root
 * @param {*} uploadHandles
 */
export const uploadDirectory = async (fileSystemHandle, pathSeparator, root, uploadHandles) => {
  const folderPath = root + pathSeparator + fileSystemHandle.name
  await FileSystem.mkdir(folderPath)
  const childHandles = await FileSystemDirectoryHandle.getChildHandles(fileSystemHandle)
  await uploadHandles(childHandles, pathSeparator, folderPath)
}
