import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'filesystem.html-worker'

const check = (actual: unknown, expected: unknown): void => {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(`Expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`)
}

export const test: Test = async () => {
  const base = new URL('/', import.meta.url)
  const rpcUrl = new URL('js/lvce-editor-rpc.js', base).href
  const workerUrl = new URL('packages/renderer-worker/node_modules/@lvce-editor/file-system-worker/dist/fileSystemWorkerMain.js', base).href
  const { PlainMessagePortRpc } = await import(rpcUrl)
  const create = async (): Promise<any> => {
    const worker = new Worker(workerUrl, { name: 'HTML filesystem acceptance', type: 'module' })
    const { port1, port2 } = new MessageChannel()
    try {
      await new Promise<void>((resolve, reject) => {
        worker.addEventListener('message', () => resolve(), { once: true })
        worker.addEventListener('error', (event) => reject(new Error(event.message)), { once: true })
      })
      worker.postMessage({ id: 1, jsonrpc: '2.0', method: 'initialize', params: ['message-port', port2] }, [port2])
      const rpc = await PlainMessagePortRpc.create({ commandMap: {}, messagePort: port1 })
      return {
        dispose: async (): Promise<void> => {
          await rpc.dispose()
          worker.terminate()
        },
        invoke: rpc.invoke,
      }
    } catch (error) {
      port1.close()
      port2.close()
      worker.terminate()
      throw error
    }
  }
  const storage = await navigator.storage.getDirectory()
  const folderName = `html-worker-${Date.now()}`
  const directory = await storage.getDirectoryHandle(folderName, { create: true })
  const uri = `html:///${folderName}`
  let rpc = await create()
  try {
    await rpc.invoke('PersistentFileHandle.addHandle', uri, directory)
    await rpc.invoke('FileSystem.mkdir', `${uri}/nested/child`)
    await rpc.invoke('FileSystem.writeFile', `${uri}/nested/child/test.txt`, 'a Needle in text')
    check(await rpc.invoke('FileSystem.readFile', `${uri}/nested/child/test.txt`), 'a Needle in text')
    check(await rpc.invoke('FileSystem.readDirWithFileTypes', uri), [{ name: 'nested', type: 3 }])
    check(await rpc.invoke('FileSystemHtml.fileSearch', uri), ['nested/child/test.txt'])
    const results = await rpc.invoke('FileSystemHtml.textSearch', uri, 'needle')
    check(
      results.map((result: { text: string }) => result.text),
      ['nested/child/test.txt', 'a Needle in text'],
    )
    const blob = new Blob([new Uint8Array([0, 255, 42])])
    await rpc.invoke('FileSystem.writeBlob', `${uri}/binary.bin`, blob)
    const restoredBlob = await rpc.invoke('FileSystem.readFileAsBlob', `${uri}/binary.bin`)
    check([...new Uint8Array(await restoredBlob.arrayBuffer())], [0, 255, 42])
    // A fresh worker must restore the native directory handle from the existing database.
    await rpc.dispose()
    rpc = await create()
    check(await rpc.invoke('FileSystem.readFile', `${uri}/nested/child/test.txt`), 'a Needle in text')
    const selected = { file: new File(['selected content'], 'selected.txt'), kind: 'file', name: 'selected.txt', readonly: true }
    await rpc.invoke('PersistentFileHandle.addHandle', `${uri}/selected.txt`, selected)
    check(await rpc.invoke('FileSystem.readFile', `${uri}/selected.txt`), 'selected content')
    check(await rpc.invoke('FileSystem.isReadonly', `${uri}/selected.txt`), true)
    let readonlyError = ''
    try {
      await rpc.invoke('FileSystem.writeFile', `${uri}/selected.txt`, 'changed')
    } catch (error) {
      readonlyError = String(error)
    }
    if (!readonlyError.includes('read-only')) throw new Error('Selected File must remain read-only')
    await rpc.invoke('FileSystem.remove', `${uri}/nested`)
    check(await rpc.invoke('FileSystemHtml.fileSearch', uri), ['binary.bin'])
  } finally {
    await rpc.dispose()
    await storage.removeEntry(folderName, { recursive: true })
  }
}
