const RE_PROTOCOL = /^([a-z-]+):\/\//

export const assertUri = (uri: string): void => {
  const protocolMatch = uri.match(RE_PROTOCOL)
  if (!protocolMatch) {
    throw new Error(`uri must be a valid uri`)
  }
}
