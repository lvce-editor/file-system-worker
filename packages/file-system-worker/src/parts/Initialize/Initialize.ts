import { initializeFileSystemProcess } from '../InitializeFileSystemProcess/InitializeFileSystemProcess.ts'

export const initialize = async (platform: number): Promise<void> => {
  await initializeFileSystemProcess(platform)
}
