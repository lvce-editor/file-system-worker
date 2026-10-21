export type SelectedFileHandle = { readonly kind: 'file'; readonly name: string; readonly file: File; readonly readonly: true }

export type HtmlHandle = FileSystemDirectoryHandle | FileSystemFileHandle | SelectedFileHandle
