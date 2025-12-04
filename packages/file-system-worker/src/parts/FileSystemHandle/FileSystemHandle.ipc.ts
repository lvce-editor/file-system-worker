import * as FileSystemHandle from './FileSystemHandle.ts'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - GetFilePathElectron is an external dependency
import * as GetFilePathElectron from '../GetFilePathElectron/GetFilePathElectron.js'

export const name = 'FileSystemHandle'

export const Commands = {
  addFileHandle: FileSystemHandle.addFileHandle,
  getFileHandles: FileSystemHandle.getFileHandles,
  getFilePathElectron: GetFilePathElectron.getFilePathElectron,
}

