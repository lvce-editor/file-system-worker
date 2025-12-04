import * as GetFilePathElectron from '../GetFilePathElectron/GetFilePathElectron.ts'
import * as FileSystemHandle from './FileSystemHandle.ts'

export const name = 'FileSystemHandle'

export const Commands = {
  addFileHandle: FileSystemHandle.addFileHandle,
  getFileHandles: FileSystemHandle.getFileHandles,
  getFilePathElectron: GetFilePathElectron.getFilePathElectron,
}
