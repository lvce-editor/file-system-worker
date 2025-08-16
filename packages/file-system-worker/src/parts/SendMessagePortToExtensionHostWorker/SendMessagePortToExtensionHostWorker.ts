import { RpcId } from '@lvce-editor/rpc-registry'
import * as RendererWorker from '../RendererWorker/RendererWorker.ts'

export const sendMessagePortToFileSystemProcess = async (port: MessagePort): Promise<void> => {
  const command = 'HandleMessagePortForFileSystemProcess.handleMessagePortForFileSystemProcess'
  await RendererWorker.invokeAndTransfer('SendMessagePortToExtensionHostWorker.sendMessagePortToSharedProcess', port, command, RpcId.FileSystemWorker)
}
