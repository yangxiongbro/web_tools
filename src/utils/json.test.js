import { describe, expect, it } from 'vitest'
import { getTextStats, parseJson } from './json'

describe('parseJson', () => {
  it('formats valid JSON with two-space indentation', () => {
    const result = parseJson('{"name":"DevKit","enabled":true}')

    expect(result.ok).toBe(true)
    expect(result.formatted).toBe('{\n  "name": "DevKit",\n  "enabled": true\n}')
  })

  it('supports primitive root values', () => {
    expect(parseJson('null')).toMatchObject({ ok: true, value: null, formatted: 'null' })
    expect(parseJson('42')).toMatchObject({ ok: true, value: 42, formatted: '42' })
  })

  it('reports a line and column for a missing comma', () => {
    const result = parseJson('{\n  "name": "DevKit"\n  "enabled": true\n}')

    expect(result.ok).toBe(false)
    expect(result.error.line).toBe(3)
    expect(result.error.column).toBe(3)
    expect(result.error.reason).toContain('缺少逗号')
  })

  it('rejects trailing commas', () => {
    const result = parseJson('{"name":"DevKit",}')

    expect(result.ok).toBe(false)
    expect(result.error.reason).toContain('多余逗号')
  })

  it('rejects invalid string escapes', () => {
    const result = parseJson('{"path":"C:\\qtemp"}')

    expect(result.ok).toBe(false)
    expect(result.error.reason).toContain('转义字符')
  })

  it('accepts standard string escapes', () => {
    const result = parseJson('{"path":"C:\\\\temp","line":"a\\nb"}')

    expect(result.ok).toBe(true)
  })

  it('returns an error for empty input', () => {
    const result = parseJson('   ')

    expect(result.ok).toBe(false)
    expect(result.error.reason).toContain('请输入')
  })
})

describe('getTextStats', () => {
  it('counts characters and lines', () => {
    expect(getTextStats('first\nsecond')).toEqual({ characters: 12, lines: 2 })
    expect(getTextStats('')).toEqual({ characters: 0, lines: 0 })
  })
})
