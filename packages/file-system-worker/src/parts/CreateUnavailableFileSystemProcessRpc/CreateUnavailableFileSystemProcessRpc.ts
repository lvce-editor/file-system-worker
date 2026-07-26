import type { Rpc } from '@lvce-editor/rpc'

const throwUnavailableError = (): never => {
  throw new Error('Disk file system is not available in web')
}

export const createUnavailableFileSystemProcessRpc = (): Rpc => {
  return {
    dispose: async (): Promise<void> => {},
    invoke: async (): Promise<never> => {
      return throwUnavailableError()
    },
    invokeAndTransfer: async (): Promise<never> => {
      return throwUnavailableError()
    },
    send: throwUnavailableError,
  }
}
