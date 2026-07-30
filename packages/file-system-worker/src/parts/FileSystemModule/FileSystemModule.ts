/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */
import type { FileSystemHandler } from '../FileSystemHandler/FileSystemHandler.ts'

const state: Record<string, FileSystemHandler> = Object.create(null)

export const register = (modules: Record<string, FileSystemHandler>): void => {
  Object.assign(state, modules)
}
