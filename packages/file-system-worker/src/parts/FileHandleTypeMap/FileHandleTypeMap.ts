import { DirentType } from '@lvce-editor/constants'
import * as FileHandleType from '../FileHandleType/FileHandleType.ts'

export const getDirentType = (fileHandleKind: string): number => {
  switch (fileHandleKind) {
    case FileHandleType.Directory:
      return DirentType.Directory
    case FileHandleType.File:
      return DirentType.File
    default:
      return DirentType.Unknown
  }
}
