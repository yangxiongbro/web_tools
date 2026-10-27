const ASCII_UPPER = /[A-Z]/

export const namingModes = {
  snakeToCamel: {
    label: '下划线转驼峰',
    shortLabel: '下划线 → 驼峰',
    description: '将 snake_case 转为 camelCase',
    example: 'user_profile_image',
  },
  camelToSnakeLower: {
    label: '驼峰转下划线小写',
    shortLabel: '驼峰 → 小写',
    description: '将 camelCase 转为 snake_case',
    example: 'HTTPServerResponse',
  },
  camelToSnakeUpper: {
    label: '驼峰转下划线大写',
    shortLabel: '驼峰 → 大写',
    description: '将 camelCase 转为 SNAKE_CASE',
    example: 'orderDetailStatus',
  },
}

function separateWords(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
}

export function splitWords(value) {
  const normalized = separateWords(value.trim())
  return normalized.match(/[\p{L}\p{N}]+/gu) ?? []
}

function convertSingleName(value, mode) {
  const words = splitWords(value)

  if (!words.length) {
    return ''
  }

  if (mode === 'snakeToCamel') {
    return words
      .map((word, index) => {
        const lower = word.toLocaleLowerCase()
        if (index === 0) {
          return lower
        }
        return lower.charAt(0).toLocaleUpperCase() + lower.slice(1)
      })
      .join('')
  }

  const normalized = words.map((word) => word.toLocaleLowerCase())
  return mode === 'camelToSnakeUpper'
    ? normalized.join('_').toLocaleUpperCase()
    : normalized.join('_')
}

export function convertName(value, mode) {
  if (!value || !namingModes[mode]) {
    return ''
  }

  return value
    .split(/\r?\n/)
    .map((line) => {
      const match = line.match(/^(\s*)(.*?)(\s*)$/)
      if (!match || !match[2]) {
        return line
      }
      return `${match[1]}${convertSingleName(match[2], mode)}${match[3]}`
    })
    .join('\n')
}

export function hasCamelBoundary(value) {
  return ASCII_UPPER.test(value)
}
