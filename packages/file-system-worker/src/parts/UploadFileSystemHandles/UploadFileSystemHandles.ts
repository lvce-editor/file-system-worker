import * as FileHandleType from '../FileHandleType/FileHandleType.ts'
import * as RendererProcess from '../RendererProcess/RendererProcess.ts'
import * as UploadFileSystemHandle from '../UploadFileSystemHandle/UploadFileSystemHandle.ts'

const uploadHandles = async (fileSystemHandles: readonly FileSystemHandle[], pathSeparator: string, root: string): Promise<void> => {
  for (const fileSystemHandle of fileSystemHandles) {
    await UploadFileSystemHandle.uploadHandle(fileSystemHandle, pathSeparator, root, uploadHandles)
  }
}

export const uploadFileSystemHandles = async (root: string, pathSeparator: string, fileSystemHandles: readonly FileSystemHandle[]): Promise<boolean> => {
  if (fileSystemHandles.length === 1) {
    const file = fileSystemHandles[0]
    const { name, kind } = file
    if (kind === FileHandleType.Directory) {
      await RendererProcess.invoke('PersistentFileHandle.addHandle', `/${name}`, file)
      await RendererProcess.invoke('Workspace.setPath', `html:///${name}`)
      return true
    }
  }
  await uploadHandles(fileSystemHandles, pathSeparator, root)
  return false
}
