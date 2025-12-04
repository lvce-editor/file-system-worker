import { RpcId, createLazyRpc } from '@lvce-editor/rpc-registry'

export const { setFactory, invoke } = createLazyRpc(RpcId.RendererProcess)
