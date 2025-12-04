import * as FileSystem from '../FileSystemDisk/FileSystemDisk.ts'
import * as FileWatcher from '../FileWatcher/FileWatcher.ts'
import * as HandleMessagePort from '../HandleMessagePort/HandleMessagePort.ts'
import * as Initialize from '../Initialize/Initialize.ts'
import { uploadFileSystemHandles } from '../UploadFileSystemHandles/UploadFileSystemHandles.js'

export const commandMap: Record<string, any> = {
  'FileSystem.appendFile': FileSystem.appendFile,
  'FileSystem.copy': FileSystem.copy,
  'FileSystem.createFile': FileSystem.createFile,
  'FileSystem.executeWatchCallback': FileWatcher.executeWatchCallback,
  'FileSystem.exists': FileSystem.exists,
  'FileSystem.getFolderSize': FileSystem.getFolderSize,
  'FileSystem.getPathSeparator': FileSystem.getPathSeparator,
  'FileSystem.getRealPath': FileSystem.getRealPath,
  'FileSystem.handleMessagePort': HandleMessagePort.handleMessagePort,
  'FileSystem.mkdir': FileSystem.mkdir,
  'FileSystem.readDirWithFileTypes': FileSystem.readDirWithFileTypes,
  'FileSystem.readFile': FileSystem.readFile,
  'FileSystem.readFileAsBlob': FileSystem.readFileAsBlob,
  'FileSystem.readJson': FileSystem.readJson,
  'FileSystem.remove': FileSystem.remove,
  'FileSystem.rename': FileSystem.rename,
  'FileSystem.stat': FileSystem.stat,
  'FileSystem.unwatchFile': FileWatcher.unwatchFile,
  'FileSystem.watchFile': FileWatcher.watchFile,
  'FileSystem.writeFile': FileSystem.writeFile,
  'FileSystem.writeBlob': FileSystem.writeBlob,
  'FileSystem.uploadFileSystemHandles': uploadFileSystemHandles,
  'Initialize.initialize': Initialize.initialize,
}
