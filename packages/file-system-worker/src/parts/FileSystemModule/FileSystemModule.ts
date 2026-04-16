/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */
import type { FileSystemHandler } from '../FileSystemHandler/FileSystemHandler.ts'

const state: Record<string, FileSystemHandler> = Object.create(null)

export const register = (modules: Record<string, FileSystemHandler>): void => {
  Object.assign(state, modules)
}

export const clear = (): void => {
  for (const key of Object.keys(state)) {
    delete state[key]
  }
}

export const getFn = (protocol: string): FileSystemHandler => {
  return state[protocol]
}
