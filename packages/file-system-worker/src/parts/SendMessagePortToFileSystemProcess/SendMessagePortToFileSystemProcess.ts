import * as RendererWorker from '../RendererWorker/RendererWorker.ts'
import * as RpcId from '../RpcId/RpcId.ts'

export const sendMessagePortToFileSystemProcess = async (port: MessagePort): Promise<void> => {
  const command = 'HandleMessagePortForFileSystemProcess.handleMessagePortForFileSystemProcess'
  await RendererWorker.invokeAndTransfer('SendMessagePortToExtensionHostWorker.sendMessagePortToSharedProcess', port, command, RpcId.FileSystemWorker)
}
