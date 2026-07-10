/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */

export const fromAsync = async <T>(asyncIterable: AsyncIterable<T>): Promise<T[]> => {
  const children: T[] = await Array.fromAsync(asyncIterable)
  return children
}
