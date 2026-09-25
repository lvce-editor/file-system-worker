import { PlainMessagePortRpc } from '@lvce-editor/rpc'

export const connect = async (port: MessagePort): Promise<void> => {
  const { commandMap } = await import('../CommandMap/CommandMap.ts')
  await PlainMessagePortRpc.create({ commandMap, messagePort: port })
}
