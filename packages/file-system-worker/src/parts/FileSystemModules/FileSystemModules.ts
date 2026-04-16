import type { FileSystemHandler } from '../FileSystemHandler/FileSystemHandler.ts'
import * as FileSystemDisk from '../FileSystemDisk/FileSystemDisk.ts'
import * as FileSystemFetch from '../FileSystemFetch/FileSystemFetch.ts'
import * as FileSystemMemory from '../FileSystemMemory/FileSystemMemory.ts'
import * as FileSystemProtocol from '../FileSystemProtocol/FileSystemProtocol.ts'

// TODO add others
export const fileSystemModules: Record<string, FileSystemHandler> = {
  [FileSystemProtocol.Fetch]: FileSystemFetch,
  [FileSystemProtocol.File]: FileSystemDisk,
  [FileSystemProtocol.Memfs]: FileSystemMemory,
}
