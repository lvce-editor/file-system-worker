import * as RendererWorker from '../RendererWorker/RendererWorker.ts'
import { RpcId } from '@lvce-editor/rpc-registry'

export const sendMessagePortToFileSystemProcess = async (port: MessagePort): Promise<void> => {
  const command = 'HandleMessagePortForFileSystemProcess.handleMessagePortForFileSystemProcess'
  await RendererWorker.invokeAndTransfer('SendMessagePortToExtensionHostWorker.sendMessagePortToSharedProcess', port, command, RpcId.FileSystemWorker)
}
