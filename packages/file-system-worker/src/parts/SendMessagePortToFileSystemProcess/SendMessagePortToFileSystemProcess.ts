import { RendererWorker, RpcId } from '@lvce-editor/rpc-registry'

export const sendMessagePortToFileSystemProcess = async (port: MessagePort): Promise<void> => {
  await RendererWorker.sendMessagePortToFileSystemProcess(port, RpcId.FileSystemWorker)
}
