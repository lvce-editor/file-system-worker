import { test, expect } from '@jest/globals'
import * as BlobModule from '../src/parts/Blob/Blob.ts'

const MockProgressEvent = class ProgressEvent extends Event {
  target: any

  constructor(type: string, init?: any) {
    super(type, init)
    this.target = init?.target
  }
}

const MockFileReader = class FileReader extends EventTarget {
  target: any
  result: string | ArrayBuffer | null = null
  readyState: number = 0
  error: Error | null = null
  onload: ((event: any) => void) | null = null
  onerror: ((event: any) => void) | null = null
  onloadend: ((event: any) => void) | null = null

  async readAsBinaryString(blob: Blob): Promise<void> {
    this.readyState = 1
    try {
      const buffer = await blob.arrayBuffer()
      const bytes = new Uint8Array(buffer)
      let binaryString = ''
      for (let i = 0; i < bytes.length; i++) {
        binaryString += String.fromCodePoint(bytes[i])
      }
      this.result = binaryString
      this.readyState = 2
      if (this.onload) {
        this.onload({ target: this })
      }
      if (this.onloadend) {
        this.onloadend({ target: this })
      }
    } catch (error) {
      this.error = error as Error | null
      this.readyState = 2
      if (this.onerror) {
        this.onerror({ target: this })
      }
      if (this.onloadend) {
        this.onloadend({ target: this })
      }
    }
  }
}

Object.defineProperties(globalThis, {
  FileReader: {
    configurable: true,
    value: MockFileReader,
  },
  ProgressEvent: {
    configurable: true,
    value: MockProgressEvent,
  },
})

test('base64StringToBlob should convert valid base64 string to blob', () => {
  const base64String = 'SGVsbG8gV29ybGQ='
  const blob = BlobModule.base64StringToBlob(base64String)
  expect(blob).toBeInstanceOf(Blob)
  expect(blob.size).toBe(11)
})

test('base64StringToBlob should convert empty base64 string to empty blob', () => {
  const base64String = ''
  const blob = BlobModule.base64StringToBlob(base64String)
  expect(blob).toBeInstanceOf(Blob)
  expect(blob.size).toBe(0)
})

test('base64StringToBlob should throw error for invalid base64 string', () => {
  const invalidBase64 = '!!!invalid!!!'
  expect(() => {
    BlobModule.base64StringToBlob(invalidBase64)
  }).toThrow('Failed to convert base64 string to blob')
})

test('base64StringToBlob should convert base64 string with image data', () => {
  const base64String = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
  const blob = BlobModule.base64StringToBlob(base64String)
  expect(blob).toBeInstanceOf(Blob)
  expect(blob.size).toBeGreaterThan(0)
})

test('blobToBinaryString should convert valid blob with text to binary string', async () => {
  const blob = new Blob(['Hello World'], { type: 'text/plain' })
  const binaryString = await BlobModule.blobToBinaryString(blob)
  expect(typeof binaryString).toBe('string')
  expect(binaryString).toHaveLength(11)
})

test('blobToBinaryString should convert empty blob to empty binary string', async () => {
  const blob = new Blob([], { type: 'text/plain' })
  const binaryString = await BlobModule.blobToBinaryString(blob)
  expect(typeof binaryString).toBe('string')
  expect(binaryString).toHaveLength(0)
})

test('blobToBinaryString should convert blob with binary data to binary string', async () => {
  const bytes = new Uint8Array([72, 101, 108, 108, 111])
  const blob = new Blob([bytes], { type: 'application/octet-stream' })
  const binaryString = await BlobModule.blobToBinaryString(blob)
  expect(typeof binaryString).toBe('string')
  expect(binaryString).toHaveLength(5)
})

test('blobToBinaryString should convert blob with multiple chunks to binary string', async () => {
  const blob = new Blob(['Hello', ' ', 'World'], { type: 'text/plain' })
  const binaryString = await BlobModule.blobToBinaryString(blob)
  expect(typeof binaryString).toBe('string')
  expect(binaryString).toHaveLength(11)
})

test('blobToBinaryString should round-trip with binaryStringToBlob', async () => {
  const originalString = 'Hello World'
  const blob = await BlobModule.binaryStringToBlob(originalString, 'text/plain')
  const binaryString = await BlobModule.blobToBinaryString(blob)
  expect(binaryString).toBe(originalString)
})

test('blobToBinaryString should handle blob with special characters', async () => {
  const specialText = 'Hello\nWorld\tTest\r\n'
  const blob = new Blob([specialText], { type: 'text/plain' })
  const binaryString = await BlobModule.blobToBinaryString(blob)
  expect(typeof binaryString).toBe('string')
  expect(binaryString).toHaveLength(specialText.length)
})

test('binaryStringToBlob should convert valid binary string to blob', async () => {
  const binaryString = 'Hello World'
  const blob = await BlobModule.binaryStringToBlob(binaryString)
  expect(blob).toBeInstanceOf(Blob)
  expect(blob.size).toBe(11)
})

test('binaryStringToBlob should convert empty binary string to empty blob', async () => {
  const binaryString = ''
  const blob = await BlobModule.binaryStringToBlob(binaryString)
  expect(blob).toBeInstanceOf(Blob)
  expect(blob.size).toBe(0)
})

test('binaryStringToBlob should convert binary string with type', async () => {
  const binaryString = 'Hello World'
  const blob = await BlobModule.binaryStringToBlob(binaryString, 'text/plain')
  expect(blob).toBeInstanceOf(Blob)
  expect(blob.size).toBe(11)
  expect(blob.type).toBe('text/plain')
})

test('binaryStringToBlob should convert binary string with image type', async () => {
  const binaryString = String.fromCodePoint(0x89, 0x50, 0x4e, 0x47)
  const blob = await BlobModule.binaryStringToBlob(binaryString, 'image/png')
  expect(blob).toBeInstanceOf(Blob)
  expect(blob.size).toBe(4)
  expect(blob.type).toBe('image/png')
})

test('binaryStringToBlob should convert binary string without type', async () => {
  const binaryString = 'test'
  const blob = await BlobModule.binaryStringToBlob(binaryString)
  expect(blob).toBeInstanceOf(Blob)
  expect(blob.size).toBe(4)
  expect(blob.type).toBe('')
})
