import { PlainMessagePortRpc } from '@lvce-editor/rpc'

export const handleMessagePort = async (port: MessagePort, rpcId?: number): Promise<void> => {
  await PlainMessagePortRpc.create({
    commandMap: {},
    messagePort: port,
  })
}
