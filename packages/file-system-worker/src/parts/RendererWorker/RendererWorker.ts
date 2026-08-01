import type { Rpc } from '@lvce-editor/rpc'
import { RendererWorker } from '@lvce-editor/rpc-registry'

export const set = (rpc: Rpc): void => {
  RendererWorker.set(rpc)
}
