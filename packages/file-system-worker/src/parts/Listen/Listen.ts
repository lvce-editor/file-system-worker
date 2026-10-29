import { RendererWorker } from '@lvce-editor/rpc-registry'
import * as CommandMap from '../CommandMap/CommandMap.ts'
import * as CommandMapRef from '../CommandMapRef/CommandMapRef.ts'
import * as FileSystemModule from '../FileSystemModule/FileSystemModule.ts'
import * as FileSystemModules from '../FileSystemModules/FileSystemModules.ts'
import { initializeExtensionHostWorker } from '../InitializeExtensionHostWorker/InitializeExtensionHostWorker.ts'
import { initializeRendererProcess } from '../InitializeRendererProcess/InitializeRendererProcess.ts'

export const listen = async (): Promise<void> => {
  Object.assign(CommandMapRef.commandMapRef, CommandMap.commandMap)
  FileSystemModule.register(FileSystemModules.fileSystemModules)
  await Promise.all([initializeExtensionHostWorker(), initializeRendererProcess(), RendererWorker.initializeRendererWorkerForWorker(CommandMap.commandMap)])
}
