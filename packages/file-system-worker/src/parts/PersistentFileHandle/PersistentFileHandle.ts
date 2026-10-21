import { VError } from '@lvce-editor/verror'
import type { HtmlHandle } from '../HtmlHandle/HtmlHandle.ts'
import * as HandleStorage from '../HandleStorage/HandleStorage.ts'

const handles: Record<string, HtmlHandle> = Object.create(null)

const getLegacyHtmlKeys = (uri: string): string[] => {
  if (!uri.startsWith('html://')) {
    return []
  }
  const strippedUri = uri.slice('html://'.length)
  const legacyKeys = []
  if (strippedUri) {
    legacyKeys.push(strippedUri)
  }
  if (strippedUri.startsWith('/')) {
    legacyKeys.push(strippedUri.slice(1))
  }
  return legacyKeys.filter((value, index, array: readonly string[]) => value && array.indexOf(value) === index)
}

export const addHandle = async (uri: string, handle: HtmlHandle): Promise<void> => {
  try {
    handles[uri] = handle
    await HandleStorage.addHandle(uri, handle)
  } catch (error) {
    throw new VError(error, 'Failed to add handle')
  }
}

export const addHandles = async (parentUri: string, childHandles: readonly HtmlHandle[]): Promise<void> => {
  const promises = []
  for (const childHandle of childHandles) {
    const childUri = parentUri + '/' + childHandle.name
    if (childUri in handles) {
      continue
    }
    handles[childUri] = childHandle
    promises.push(addHandle(childUri, childHandle))
  }
  await Promise.all(promises)
}

export const removeHandle = (uri: string): void => {
  delete handles[uri]
  const prefix = `${uri}/`
  for (const key in handles) {
    if (key.startsWith(prefix)) {
      delete handles[key]
    }
  }
}

export const getHandle = async (uri: string): Promise<HtmlHandle | undefined> => {
  try {
    if (uri in handles) {
      return handles[uri]
    }
    let handle = await HandleStorage.getHandle(uri)
    if (!handle) {
      const legacyKeys = getLegacyHtmlKeys(uri)
      for (const legacyKey of legacyKeys) {
        handle = await HandleStorage.getHandle(legacyKey)
        if (handle) {
          await addHandle(uri, handle)
          handles[legacyKey] = handle
          break
        }
      }
    }
    if (handle) {
      handles[uri] = handle
    }
    return handle
  } catch (error) {
    throw new VError(error, 'Failed to get handle')
  }
}
