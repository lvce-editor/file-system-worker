import { initializeFileSytemProcess } from '../InitializeFileSystemProcess/InitializeFileSystemProcess.ts'

export const initialize = async (platform: number): Promise<void> => {
  await initializeFileSytemProcess(platform)
}
