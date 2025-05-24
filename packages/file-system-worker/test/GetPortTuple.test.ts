import { test, expect } from '@jest/globals'
import * as GetPortTuple from '../src/parts/GetPortTuple/GetPortTuple.js'

test('getPortTuple returns a MessageChannel with port1 and port2', () => {
  const result = GetPortTuple.getPortTuple()
  expect(result).toHaveProperty('port1')
  expect(result).toHaveProperty('port2')
  expect(result.port1).toBeInstanceOf(MessagePort)
  expect(result.port2).toBeInstanceOf(MessagePort)
})
