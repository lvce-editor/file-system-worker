import * as RendererProcess from '../RendererProcess/RendererProcess.ts'

export const requestPermission = async (
  handle: FileSystemHandle,
  options: FileSystemHandlePermissionDescriptor,
): Promise<PermissionState> => {
  // query permission, but from renderer process
  // because handle.requestPermission is not implemented
  // in a worker, see https://github.com/WICG/file-system-access/issues/289
  const permissionTypeNow = await RendererProcess.invoke(
    'FileSystemHandle.requestPermission',
    handle,
    options,
  )
  return permissionTypeNow as PermissionState
}

export const queryPermission = async (
  handle: FileSystemHandle,
  options: FileSystemHandlePermissionDescriptor,
): Promise<PermissionState> => {
  return handle.queryPermission(options)
}

