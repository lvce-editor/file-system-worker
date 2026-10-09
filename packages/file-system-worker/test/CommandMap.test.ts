import { expect, test } from '@jest/globals'
import * as CommandMap from '../src/parts/CommandMap/CommandMap.ts'

test('commandMap', async () => {
  expect(typeof CommandMap.commandMap).toBe('object')
  expect(CommandMap.commandMap).not.toHaveProperty('Blob.base64StringToBlob')
  expect(CommandMap.commandMap).not.toHaveProperty('Blob.binaryStringToBlob')
  expect(CommandMap.commandMap).not.toHaveProperty('Blob.blobToBinaryString')
  expect(CommandMap.commandMap['FileSystem.readFileAsBlob']).toBeDefined()
  expect(CommandMap.commandMap['FileSystem.writeBlob']).toBeDefined()
  expect(typeof CommandMap.commandMap['FileSystem.getFileHash']).toBe('function')
  expect(typeof CommandMap.commandMap['FileSystem.getFileHashes']).toBe('function')
  expect(typeof CommandMap.commandMap['FileSystem.getFileSize']).toBe('function')
  expect(typeof CommandMap.commandMap['FileSystem.glob']).toBe('function')
  expect(typeof CommandMap.commandMap['FileSystem.isReadonly']).toBe('function')
})
