import { cp } from 'node:fs/promises'
import { join } from 'node:path'
import { root } from './root.js'

const sharedProcess = await import('@lvce-editor/shared-process')

process.env.PATH_PREFIX = '/file-system-worker'
await sharedProcess.exportStatic({
  root,
  extensionPath: '',
  testPath: 'packages/e2e',
})

await cp(join(root, 'dist'), join(root, '.tmp', 'static'), { recursive: true })
