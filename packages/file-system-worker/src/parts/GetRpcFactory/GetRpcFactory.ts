import { type Rpc } from '@lvce-editor/rpc'
import { createFileSystemProcessRpcElectron } from '../CreateFileSystemProcessRpcElectron/CreateFileSystemProcessRpcElectron.ts'
import { createFileSystemProcessRpcNode } from '../CreateFileSystemProcessRpcNode/CreateFileSystemProcessRpcNode.ts'
import * as PlatformType from '../PlatformType/PlatformType.ts'

interface RpcFactory {
  (): Promise<Rpc>
}

export const getRpcFactory = (platform: number): RpcFactory => {
  switch (platform) {
    case PlatformType.Electron:
      return createFileSystemProcessRpcElectron
    case PlatformType.Remote:
      return createFileSystemProcessRpcNode
    default:
      throw new Error(`unexpected platform`)
  }
}
