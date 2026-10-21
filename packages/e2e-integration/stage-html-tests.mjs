import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { stripTypeScriptTypes } from 'node:module'
import { join, resolve } from 'node:path'

if (!process.argv[2]) throw new Error('Pass the path to an LVCE application checkout')
const application = resolve(process.argv[2])
const manifest = JSON.parse(await readFile(join(application, 'package.json'), 'utf8'))
if (manifest.name !== 'lvce-editor') throw new Error('Expected an LVCE application checkout')
const target = join(application, 'packages/extension-host-worker-tests/src/workspace.html-filesystem.js')
if (process.argv.includes('--clean')) {
  await rm(target, { force: true })
} else {
  const source = await readFile(new URL('./src/workspace.html-filesystem.ts', import.meta.url), 'utf8')
  await mkdir(join(application, 'packages/extension-host-worker-tests/src'), { recursive: true })
  await writeFile(target, stripTypeScriptTypes(source))
}
