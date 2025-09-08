import { test, expect } from '@jest/globals'
import { assertUri } from '../src/parts/AssertUri/AssertUri.ts'

test('assertUri should not throw for valid URIs', () => {
  expect(() => assertUri('http://example.com')).not.toThrow()
  expect(() => assertUri('https://example.com')).not.toThrow()
  expect(() => assertUri('file:///path/to/file')).not.toThrow()
  expect(() => assertUri('ftp://example.com')).not.toThrow()
  expect(() => assertUri('custom-protocol://example.com')).not.toThrow()
})

test('assertUri should throw for invalid URIs', () => {
  expect(() => assertUri('not-a-uri')).toThrow('uri must be a valid uri')
  expect(() => assertUri('')).toThrow('uri must be a valid uri')
  expect(() => assertUri('example.com')).toThrow('uri must be a valid uri')
  expect(() => assertUri('path/to/file')).toThrow('uri must be a valid uri')
  expect(() => assertUri('://example.com')).toThrow('uri must be a valid uri')
})
