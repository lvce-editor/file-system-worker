import * as FileHandleType from '../FileHandleType/FileHandleType.ts'
import * as UploadFileSystemDirectoryHandle from '../UploadFileSystemDirectoryHandle/UploadFileSystemDirectoryHandle.ts'
import * as UploadFileSystemFileHandle from '../UploadFileSystemFileHandle/UploadFileSystemFileHandle.ts'

export const uploadHandle = async (
  fileSystemHandle: Readonly<FileSystemHandle>,
  pathSeparator: string,
  root: string,
  uploadHandles: (fileSystemHandles: readonly FileSystemHandle[], pathSeparator: string, root: string) => Promise<void>,
): Promise<void> => {
  const { kind } = fileSystemHandle
  switch (kind) {
    case FileHandleType.Directory:
      return UploadFileSystemDirectoryHandle.uploadDirectory(fileSystemHandle as FileSystemDirectoryHandle, pathSeparator, root, uploadHandles)
    case FileHandleType.File:
      return UploadFileSystemFileHandle.uploadFile(fileSystemHandle as FileSystemFileHandle, pathSeparator, root)
    default:
      throw new Error(`unsupported file system handle type ${kind}`)
  }
}
