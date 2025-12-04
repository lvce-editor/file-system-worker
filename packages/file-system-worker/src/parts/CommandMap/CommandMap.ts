import { base64StringToBlob } from 'blob-util'
import { binaryStringToBlob, blobToBinaryString } from '../Blob/Blob.ts'
import * as FileSystem from '../FileSystemDisk/FileSystemDisk.ts'
import * as FileWatcher from '../FileWatcher/FileWatcher.ts'
import * as HandleMessagePort from '../HandleMessagePort/HandleMessagePort.ts'
import * as Initialize from '../Initialize/Initialize.ts'
import { uploadFileSystemHandles } from '../UploadFileSystemHandles/UploadFileSystemHandles.ts'

export const commandMap: Record<string, any> = {
  'Blob.base64StringToBlob': base64StringToBlob,
  'Blob.binaryStringToBlob': binaryStringToBlob,
  'Blob.blobToBinaryString': blobToBinaryString,
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
  'FileSystem.uploadFileSystemHandles': uploadFileSystemHandles,
  'FileSystem.watchFile': FileWatcher.watchFile,
  'FileSystem.writeBlob': FileSystem.writeBlob,
  'FileSystem.writeFile': FileSystem.writeFile,
  'Initialize.initialize': Initialize.initialize,
}
