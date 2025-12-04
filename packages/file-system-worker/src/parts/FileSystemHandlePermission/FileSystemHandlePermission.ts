import * as RendererProcess from '../RendererProcess/RendererProcess.ts'

export const requestPermission = async (
  handle: FileSystemHandle,
  options: { mode?: 'read' | 'readwrite' },
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
  options: { mode?: 'read' | 'readwrite' },
): Promise<PermissionState> => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - queryPermission exists on FileSystemHandle but TypeScript types may not include it
  return handle.queryPermission(options)
}

