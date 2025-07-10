import * as FileSystem from '../FileSystemDisk/FileSystemDisk.ts'
import * as HandleMessagePort from '../HandleMessagePort/HandleMessagePort.ts'
import * as Initialize from '../Initialize/Initialize.ts'
import * as FileSystemFetch from '../FileSystemFetch/FileSystemFetch.ts'

export const commandMap = {
  'FileSystem.copy': FileSystem.copy,
  'FileSystem.createFile': FileSystem.createFile,
  'FileSystem.getFolderSize': FileSystem.getFolderSize,
  'FileSystem.getPathSeparator': FileSystem.getPathSeparator,
  'FileSystem.getRealPath': FileSystem.getRealPath,
  'FileSystem.handleMessagePort': HandleMessagePort.handleMessagePort,
  'FileSystem.mkdir': FileSystem.mkdir,
  'FileSystem.readDirWithFileTypes': FileSystem.readDirWithFileTypes,
  'FileSystem.readFile': FileSystem.readFile,
  'FileSystem.readJson': FileSystem.readJson,
  'FileSystem.remove': FileSystem.remove,
  'FileSystem.rename': FileSystem.rename,
  'FileSystem.stat': FileSystem.stat,
  'FileSystem.writeFile': FileSystem.writeFile,
  'FileSystemFetch.readFile': FileSystemFetch.readFile,
  'Initialize.initialize': Initialize.initialize,
}
