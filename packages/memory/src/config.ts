import { join } from 'node:path'
import { root } from './root.ts'

export const threshold = 370_000

export const instantiations = 4500

export const instantiationsPath = join(root, 'packages', 'file-system-worker')

export const workerPath = join(root, '.tmp/dist/dist/fileSystemWorkerMain.js')

export const playwrightPath = new URL('../../e2e/node_modules/playwright/index.mjs', import.meta.url).toString()
