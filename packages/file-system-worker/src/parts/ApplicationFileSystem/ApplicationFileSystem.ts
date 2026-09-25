import { RendererWorker } from '@lvce-editor/rpc-registry'
import * as Memory from '../FileSystemMemory/FileSystemMemory.ts'

const memoryRoot = (id: string): string => `memfs:///applications/${encodeURIComponent(id)}`
const memoryUri = (id: string, uri: string): string => `${memoryRoot(id)}/${uri.slice('memfs://'.length).replace(/^\/+/, '')}`

export const execute = async (id: string, method: string, ...args: readonly any[]): Promise<any> => {
  const [uri] = args
  if (typeof uri !== 'string') throw new TypeError('Application filesystem requires a URI')
  if (uri.startsWith('memfs://')) {
    if (method === 'isReadonly') return false
    const fn = (Memory as Record<string, any>)[method === 'getBlob' ? 'readFileAsBlob' : method]
    if (typeof fn !== 'function') throw new Error(`Unsupported application memory operation: ${method}`)
    const mapped = [...args]
    mapped[0] = memoryUri(id, uri)
    if (method === 'rename' || method === 'copy') {
      if (typeof args[1] !== 'string' || !args[1].startsWith('memfs://')) throw new Error('Cross-filesystem operation is not supported')
      mapped[1] = memoryUri(id, args[1])
    }
    return fn(...mapped)
  }
  // Provider activation and component-state access need application context.
  // This callback handles only non-memory URIs, never file contents storage.
  return RendererWorker.invoke('Application.execute', id, `FileSystem.${method}`, ...args)
}

export const dispose = async (id: string): Promise<void> => Memory.remove(memoryRoot(id))
