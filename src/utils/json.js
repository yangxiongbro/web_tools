class JsonSyntaxError extends Error {
  constructor(index, reason) {
    super(reason)
    this.index = index
  }
}

function parseString(source, start) {
  let index = start + 1

  while (index < source.length) {
    const char = source[index]

    if (char === '"') {
      return index + 1
    }

    if (char === '\\') {
      const escape = source[index + 1]

      if (escape === 'u') {
        const hex = source.slice(index + 2, index + 6)
        if (!/^[0-9a-fA-F]{4}$/.test(hex)) {
          throw new JsonSyntaxError(index, 'Unicode 转义序列必须包含 4 位十六进制字符')
        }
        index += 6
        continue
      }

      if (!escape || !'"\\/bfnrt'.includes(escape)) {
        throw new JsonSyntaxError(index, '字符串中包含无效的转义字符')
      }

      index += 2
      continue
    }

    if (char.charCodeAt(0) < 0x20) {
      throw new JsonSyntaxError(index, '字符串中不能包含未转义的控制字符')
    }

    index += 1
  }

  throw new JsonSyntaxError(start, '字符串缺少结束的双引号')
}

function skipWhitespace(source, index) {
  while (index < source.length && /\s/.test(source[index])) {
    index += 1
  }
  return index
}

function parseValue(source, start) {
  const index = skipWhitespace(source, start)
  const char = source[index]

  if (char === '"') {
    return parseString(source, index)
  }

  if (char === '{') {
    return parseObject(source, index)
  }

  if (char === '[') {
    return parseArray(source, index)
  }

  if (char === '-' || /\d/.test(char ?? '')) {
    const match = source.slice(index).match(/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/)
    if (!match) {
      throw new JsonSyntaxError(index, '数字格式不正确')
    }
    return index + match[0].length
  }

  if (source.startsWith('true', index)) {
    return index + 4
  }

  if (source.startsWith('false', index)) {
    return index + 5
  }

  if (source.startsWith('null', index)) {
    return index + 4
  }

  if (index >= source.length) {
    throw new JsonSyntaxError(index, 'JSON 内容不完整')
  }

  throw new JsonSyntaxError(index, `无法识别的字符 “${source[index]}”`)
}

function parseObject(source, start) {
  let index = skipWhitespace(source, start + 1)

  if (source[index] === '}') {
    return index + 1
  }

  while (index < source.length) {
    if (source[index] !== '"') {
      throw new JsonSyntaxError(index, '对象键必须使用双引号包裹')
    }

    index = skipWhitespace(source, parseString(source, index))

    if (source[index] !== ':') {
      throw new JsonSyntaxError(index, '对象键后缺少冒号')
    }

    index = skipWhitespace(source, parseValue(source, index + 1))

    if (source[index] === '}') {
      return index + 1
    }

    if (source[index] !== ',') {
      throw new JsonSyntaxError(index, '对象成员之间缺少逗号')
    }

    index = skipWhitespace(source, index + 1)

    if (source[index] === '}') {
      throw new JsonSyntaxError(index, '对象末尾不能包含多余逗号')
    }
  }

  throw new JsonSyntaxError(index, '对象缺少结束的右花括号')
}

function parseArray(source, start) {
  let index = skipWhitespace(source, start + 1)

  if (source[index] === ']') {
    return index + 1
  }

  while (index < source.length) {
    index = skipWhitespace(source, parseValue(source, index))

    if (source[index] === ']') {
      return index + 1
    }

    if (source[index] !== ',') {
      throw new JsonSyntaxError(index, '数组元素之间缺少逗号')
    }

    index = skipWhitespace(source, index + 1)

    if (source[index] === ']') {
      throw new JsonSyntaxError(index, '数组末尾不能包含多余逗号')
    }
  }

  throw new JsonSyntaxError(index, '数组缺少结束的右方括号')
}

function findSyntaxError(source) {
  try {
    const end = skipWhitespace(source, parseValue(source, 0))
    if (end < source.length) {
      throw new JsonSyntaxError(end, 'JSON 结束后仍包含其他内容')
    }
    return null
  } catch (error) {
    if (error instanceof JsonSyntaxError) {
      return error
    }
    throw error
  }
}

function buildErrorDetails(source, error) {
  const safeIndex = Math.min(Math.max(error.index, 0), source.length)
  const before = source.slice(0, safeIndex)
  const line = (before.match(/\n/g)?.length ?? 0) + 1
  const previousNewline = before.lastIndexOf('\n')
  const column = safeIndex - previousNewline
  const sourceLines = source.split(/\r?\n/)
  const rawLine = sourceLines[line - 1] ?? ''
  const normalizedLine = rawLine.replace(/\t/g, '  ')
  const tabCount = rawLine.slice(0, Math.max(column - 1, 0)).match(/\t/g)?.length ?? 0
  const displayColumn = Math.max(column + tabCount, 1)
  const start = Math.max(0, displayColumn - 18)
  const end = Math.min(normalizedLine.length, start + 72)
  const lineText = normalizedLine.slice(start, end)
  const caretOffset = Math.min(Math.max(displayColumn - 1 - start, 0), Math.max(lineText.length, 1))

  return {
    index: safeIndex,
    line,
    column,
    reason: error.message,
    lineText: lineText || ' ',
    caret: `${' '.repeat(caretOffset)}^`,
    message: `第 ${line} 行，第 ${column} 列：${error.message}`,
  }
}

export function parseJson(source) {
  if (!source.trim()) {
    const error = new JsonSyntaxError(0, '请输入需要格式化的 JSON 字符串')
    return { ok: false, error: buildErrorDetails(source, error) }
  }

  try {
    const value = JSON.parse(source)
    return {
      ok: true,
      value,
      formatted: JSON.stringify(value, null, 2),
    }
  } catch {
    const error = findSyntaxError(source) ?? new JsonSyntaxError(0, 'JSON 语法不正确')
    return { ok: false, error: buildErrorDetails(source, error) }
  }
}

export function getTextStats(source) {
  return {
    characters: source.length,
    lines: source ? source.split(/\r?\n/).length : 0,
  }
}
