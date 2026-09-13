import { expect, test } from '@jest/globals'
import { isProviderUri } from '../src/parts/IsProviderUri/IsProviderUri.js'

test.each(['remote-ssh://user@host:2222/work%20tree/', 'remote-server://host/work', 'custom-provider://host/file'])('recognizes provider URI %s', (uri) => {
  expect(isProviderUri(uri)).toBe(true)
})

test.each(['file:///home/user/file', 'file://server/share/file', 'https://host/file', 'http://host/file', '/home/user/file', 'C:\\Users\\file', 'C:/Users/file'])(
  'keeps built-in URI or disk path %s',
  (uri) => {
    expect(isProviderUri(uri)).toBe(false)
  },
)
