import * as FileHandleType from '../FileHandleType/FileHandleType.ts'
import * as DirentType from '../DirentType/DirentType.ts'

export const getDirentType = (fileHandleKind: string): string => {
  switch (fileHandleKind) {
    case FileHandleType.Directory:
      return DirentType.Directory
    case FileHandleType.File:
      return DirentType.File
    default:
      return DirentType.Unknown
  }
}

