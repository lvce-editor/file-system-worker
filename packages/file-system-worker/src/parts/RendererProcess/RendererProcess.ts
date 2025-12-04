import { RpcId, createLazyRpc } from '@lvce-editor/rpc-registry'

export const { invoke, setFactory } = createLazyRpc(RpcId.RendererProcess)
