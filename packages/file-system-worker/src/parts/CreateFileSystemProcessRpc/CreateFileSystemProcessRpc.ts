import { type Rpc } from '@lvce-editor/rpc'
import { createFileSystemProcessRpcElectron } from '../CreateFileSystemProcessRpcElectron/CreateFileSystemProcessRpcElectron.ts'
import { createFileSystemProcessRpcNode } from '../CreateFileSystemProcessRpcNode/CreateFileSystemProcessRpcNode.ts'
import * as PlatformType from '../PlatformType/PlatformType.ts'

export const createFileSystemProcessRpc = async (platform: number): Promise<Rpc> => {
  switch (platform) {
    case PlatformType.Electron:
      return createFileSystemProcessRpcElectron()
    case PlatformType.Remote:
      return createFileSystemProcessRpcNode()
    default:
      throw new Error(`unexpected platform`)
  }
}
