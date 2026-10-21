interface Rule {
  readonly directoryOnly: boolean
  readonly negated: boolean
  readonly pattern: RegExp
  readonly segmentOnly: boolean
}

export interface Matcher {
  readonly hasNegation: boolean
  readonly isIgnored: (path: string, isDirectory?: boolean) => boolean
}

const escapeRegExp = (character: string): string => (/[|\\{}()[\]^$+?.]/.test(character) ? `\\${character}` : character)

const globToken = (pattern: string, index: number): readonly [string, number] => {
  const character = pattern[index]
  switch (character) {
    case '?':
      return ['[^/]', 1]
    case '[': {
      const end = pattern.indexOf(']', index + 1)
      if (end === -1) return ['\\[', 1]
      const range = pattern.slice(index + 1, end)
      const normalizedRange = range.startsWith('!') ? `^${range.slice(1)}` : range
      return [`[${normalizedRange}]`, end - index + 1]
    }
    case '*':
      if (pattern[index + 1] !== '*') return ['[^/]*', 1]
      return pattern[index + 2] === '/' ? ['(?:.*/)?', 3] : ['.*', 2]
    default:
      return [escapeRegExp(character), 1]
  }
}

const globToRegExp = (pattern: string): RegExp => {
  let source = '^'
  let index = 0
  while (index < pattern.length) {
    const [token, length] = globToken(pattern, index)
    source += token
    index += length
  }
  return new RegExp(`${source}$`)
}

const parseRule = (line: string): Rule | undefined => {
  let pattern = line.trimEnd()
  if (!pattern || pattern.startsWith('#')) {
    return undefined
  }
  let negated = false
  if (pattern.startsWith('!')) {
    negated = true
    pattern = pattern.slice(1)
  } else if (pattern.startsWith('\\!') || pattern.startsWith('\\#')) {
    pattern = pattern.slice(1)
  }
  const rooted = pattern.startsWith('/')
  pattern = pattern.replace(/^\//, '')
  const directoryOnly = pattern.endsWith('/')
  if (directoryOnly) {
    pattern = pattern.slice(0, -1)
  }
  if (!pattern) {
    return undefined
  }
  const hasSlash = rooted || pattern.includes('/')
  return {
    directoryOnly,
    negated,
    pattern: globToRegExp(pattern),
    segmentOnly: !hasSlash,
  }
}

const ruleMatches = (rule: Readonly<Rule>, path: string, isDirectory: boolean): boolean => {
  if (rule.directoryOnly && !isDirectory) {
    return false
  }
  if (rule.segmentOnly) {
    const name = path.slice(path.lastIndexOf('/') + 1)
    return rule.pattern.test(name)
  }
  return rule.pattern.test(path)
}

export const create = (contents = ''): Matcher => {
  const rules = contents
    .split(/\r?\n/)
    .map(parseRule)
    .filter((rule) => rule !== undefined)
  return {
    hasNegation: rules.some((rule) => rule.negated),
    isIgnored(path: string, isDirectory = false): boolean {
      const parts = path.split('/').filter(Boolean)
      let ignored = false
      for (let index = 0; index < parts.length; index++) {
        if (ignored) {
          return true
        }
        const relativePath = parts.slice(0, index + 1).join('/')
        const currentIsDirectory = index < parts.length - 1 || isDirectory
        for (const rule of rules) {
          if (ruleMatches(rule, relativePath, currentIsDirectory)) {
            ignored = !rule.negated
          }
        }
      }
      return ignored
    },
  }
}
