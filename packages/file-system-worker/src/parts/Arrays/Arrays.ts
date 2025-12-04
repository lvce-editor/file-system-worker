// based on https://github.com/microsoft/vscode/blob/c0769274fa136b45799edeccc0d0a2f645b75caf/src/vs/base/common/arrays.ts#L625 (License MIT)

export const insertInto = <T>(array: T[], start: number, newItems: readonly T[]): void => {
  const originalLength = array.length
  const newItemsLength = newItems.length
  array.length = originalLength + newItemsLength
  // Move the items after the start index, start from the end so that we don't overwrite any value.
  for (let i = originalLength - 1; i >= start; i--) {
    array[i + newItemsLength] = array[i]
  }

  for (let i = 0; i < newItemsLength; i++) {
    array[i + start] = newItems[i]
  }
}

/**
 * Alternative to the native Array.splice method, it
 * can only support limited number of items due to the maximum call stack size limit.
 */
export const spliceLargeArray = <T>(array: T[], start: number, deleteCount: number, newItems: readonly T[]): T[] => {
  const result = array.splice(start, deleteCount)
  insertInto(array, start, newItems)
  return result
}

export const push = <T>(array: T[], newItems: readonly T[]): void => {
  insertInto(array, array.length, newItems)
}

export const last = <T>(array: readonly T[]): T | undefined => {
  return array.at(-1)
}

export const first = <T>(array: readonly T[]): T | undefined => {
  return array[0]
}

// TODO use this function more often
export const firstIndex = (): number => {
  return 0
}

// TODO use this function more often
export const lastIndex = <T>(array: readonly T[]): number => {
  return array.length - 1
}

export const fromAsync = async <T>(asyncIterable: AsyncIterable<T>): Promise<T[]> => {
  const children: T[] = []
  for await (const value of asyncIterable) {
    children.push(value)
  }
  return children
}

export const findObjectIndex = <T>(array: readonly T[], key: keyof T, value: unknown): number => {
  for (const [i, element] of array.entries()) {
    if (element[key] === value) {
      return i
    }
  }
  return -1
}

export const isLastIndex = <T>(array: readonly T[], index: number): boolean => {
  return index === array.length - 1
}

export const toSpliced = <T>(array: readonly T[], index: number, deleteCount: number, ...inserted: readonly T[]): T[] => {
  return [...array.slice(0, index), ...inserted, ...array.slice(index + deleteCount)]
}

export const remove = <T>(array: readonly T[], index: number, deleteCount: number): T[] => {
  return toSpliced(array, index, deleteCount)
}

export const toSorted = <T>(array: readonly T[], compare?: (a: T, b: T) => number): T[] => {
  return [...array].sort(compare)
}

export const removeElement = <T>(array: readonly T[], element: T): T[] => {
  const index = array.indexOf(element)
  if (index === -1) {
    return array as T[]
  }
  return [...array.slice(0, index), ...array.slice(index + 1)]
}
