import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'workspace.html-filesystem'

export const test: Test = async ({ Command, Editor, expect, Locator, Main }) => {
  const storage = await navigator.storage.getDirectory()
  const folderName = `html-app-${Date.now()}`
  const directory = await storage.getDirectoryHandle(folderName, { create: true })
  const uri = `html:///${folderName}`
  try {
    // Existing profiles used both the stripped path and the full URI as keys.
    await Command.execute('IndexedDb.addHandle', `/${folderName}`, directory)
    await Command.execute('FileSystem.mkdir', `${uri}/nested/child`)
    await Command.execute('FileSystem.writeFile', `${uri}/hello.txt`, 'a Needle in text')
    await Command.execute('FileSystem.writeFile', `${uri}/nested/child/deep.txt`, 'nested content')
    await Command.execute('Workspace.setPath', uri)
    await expect(Locator('.Explorer')).toContainText('hello.txt')
    await Main.openUri(`${uri}/hello.txt`)
    if ((await Editor.getText()) !== 'a Needle in text') throw new Error('HTML workspace file must open in the editor')
    await Editor.type('saved ')
    await Main.save()
    if ((await Command.execute('FileSystem.readFile', `${uri}/hello.txt`)) !== 'saved a Needle in text') throw new Error('HTML workspace save must reach the native file')
    const matches = await Command.execute('ExtensionHostTextSearch.textSearchHtml', 'html', uri, 'nested')
    if (matches.every((match) => match.text !== 'nested/child/deep.txt')) throw new Error('HTML text search must include nested files')
    await Command.execute('QuickPick.showFile')
    await expect(Locator('.QuickPick')).toContainText('hello.txt')
    const blob = new Blob([new Uint8Array([0, 255, 42])])
    await Command.execute('FileSystem.writeBlob', `${uri}/binary.bin`, blob)
    const readBlob = await Command.execute('FileSystem.getBlob', `${uri}/binary.bin`)
    if (JSON.stringify([...new Uint8Array(await readBlob.arrayBuffer())]) !== '[0,255,42]') throw new Error('HTML binary IO must preserve bytes')
    const selected = { file: new File(['selected content'], 'selected.txt'), kind: 'file', name: 'selected.txt', readonly: true }
    await Command.execute('PersistentFileHandle.addHandle', 'html:///selected.txt', selected)
    if ((await Command.execute('FileSystem.readFile', 'html:///selected.txt')) !== 'selected content') throw new Error('Selected File fallback must remain readable')
    if (!(await Command.execute('FileSystem.isReadonly', 'html:///selected.txt'))) throw new Error('Selected File fallback must remain read-only')
    await Command.execute('FileSystem.remove', `${uri}/nested`)
  } finally {
    await Main.closeAllEditors()
    await storage.removeEntry(folderName, { recursive: true })
  }
}
