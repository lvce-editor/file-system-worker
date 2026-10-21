import type { HtmlHandle } from '../HtmlHandle/HtmlHandle.ts'

// Native IDB events expose a generic result that may itself be mutable.
// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
const requestToPromise = <T>(request: Readonly<IDBRequest<T>>): Promise<T> => {
  return new Promise((resolve, reject) => {
    request.addEventListener('success', (): void => resolve(request.result), { once: true })
    request.addEventListener('error', (): void => reject(request.error || new Error('IndexedDB request failed')), { once: true })
  })
}

const state: { databasePromise?: Promise<IDBDatabase> } = {}
const getDatabase = (): Promise<IDBDatabase> => {
  state.databasePromise ||= ((): Promise<IDBDatabase> => {
    // Keep the renderer's database and store names so existing workspaces restore.
    const request = indexedDB.open('handle', 1)
    request.onupgradeneeded = (): void => {
      const database = request.result
      if (!database.objectStoreNames.contains('file-handles-store')) {
        database.createObjectStore('file-handles-store')
      }
    }
    return requestToPromise(request)
  })()
  return state.databasePromise
}

export const addHandle = async (uri: string, handle: Readonly<HtmlHandle>): Promise<void> => {
  const database = await getDatabase()
  await requestToPromise(database.transaction('file-handles-store', 'readwrite').objectStore('file-handles-store').put(handle, uri))
}

export const getHandle = async (uri: string): Promise<HtmlHandle | undefined> => {
  const database = await getDatabase()
  return requestToPromise(database.transaction('file-handles-store').objectStore('file-handles-store').get(uri))
}
