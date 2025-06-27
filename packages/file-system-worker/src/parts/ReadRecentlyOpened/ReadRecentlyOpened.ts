import * as PlatformType from '../PlatformType/PlatformType.ts'
import { readRecentlyOpenedNode } from '../ReadRecentlyOpenedNode/ReadRecemtlyOpenedNode.ts'
import { readRecentlyOpenedWeb } from '../ReadRecentlyOpenedWeb/ReadRecemtlyOpenedWeb.ts'

export const readRecentlyOpened = (platform: number): Promise<readonly string[]> => {
  if (platform === PlatformType.Web) {
    return readRecentlyOpenedWeb()
  }
  return readRecentlyOpenedNode()
}
