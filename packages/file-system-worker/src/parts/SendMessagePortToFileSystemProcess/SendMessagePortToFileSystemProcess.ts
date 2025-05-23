import * as ParentRpc from '../ParentRpc/ParentRpc.ts'
import * as RpcId from '../RpcId/RpcId.ts'

export const sendMessagePortToFileSystemProcess = async (port: MessagePort): Promise<void> => {
  const command = 'HandleMessagePort.handleMessagePort2'
  // @ts-ignore
  await ParentRpc.invokeAndTransfer('SendMessagePortToFileSystemProcess.sendMessagePortToFileSystemProcess', port, command, RpcId.FileSystemWorker)
}
