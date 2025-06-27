import * as FileSystem from '../FileSystemDisk/FileSystemDisk.ts'
import * as Initialize from '../Initialize/Initialize.ts'
import * as ReadRecentlyOpened from '../ReadRecentlyOpened/ReadRecentlyOpened.ts'

export const commandMap = {
  'FileSystem.copy': FileSystem.copy,
  'FileSystem.createFile': FileSystem.createFile,
  'FileSystem.getPathSeparator': FileSystem.getPathSeparator,
  'FileSystem.getRealPath': FileSystem.getRealPath,
  'FileSystem.mkdir': FileSystem.mkdir,
  'FileSystem.readDirWithFileTypes': FileSystem.readDirWithFileTypes,
  'FileSystem.readFile': FileSystem.readFile,
  'FileSystem.readJson': FileSystem.readJson,
  'FileSystem.remove': FileSystem.remove,
  'FileSystem.rename': FileSystem.rename,
  'FileSystem.stat': FileSystem.stat,
  'FileSystem.writeFile': FileSystem.writeFile,
  'FileSystem.readRecentlyOpened': ReadRecentlyOpened.readRecentlyOpened,
  'Initialize.initialize': Initialize.initialize,
}
