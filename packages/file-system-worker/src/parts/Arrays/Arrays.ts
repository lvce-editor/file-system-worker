// TODO use this function more often

// TODO use this function more often

export const fromAsync = async <T>(asyncIterable: AsyncIterable<T>): Promise<T[]> => {
  const children: T[] = []
  for await (const value of asyncIterable) {
    children.push(value)
  }
  return children
}
