import { describe, expect, it } from 'vitest'
import { convertName } from './naming'

describe('convertName', () => {
  it('converts snake_case to camelCase', () => {
    expect(convertName('user_profile_image', 'snakeToCamel')).toBe('userProfileImage')
    expect(convertName('USER_NAME', 'snakeToCamel')).toBe('userName')
  })

  it('converts camelCase to lower snake_case', () => {
    expect(convertName('HTTPServerResponse', 'camelToSnakeLower')).toBe('http_server_response')
    expect(convertName('orderDetail2Status', 'camelToSnakeLower')).toBe('order_detail2_status')
  })

  it('converts camelCase to upper SNAKE_CASE', () => {
    expect(convertName('orderDetailStatus', 'camelToSnakeUpper')).toBe('ORDER_DETAIL_STATUS')
  })

  it('handles separators and mixed casing', () => {
    expect(convertName('user-profile name', 'snakeToCamel')).toBe('userProfileName')
    expect(convertName('userProfile-name', 'camelToSnakeLower')).toBe('user_profile_name')
  })

  it('converts each non-empty line and preserves indentation', () => {
    expect(convertName('  first_name\n\nlast_name', 'snakeToCamel')).toBe('  firstName\n\nlastName')
  })

  it('returns an empty string for empty input', () => {
    expect(convertName('', 'snakeToCamel')).toBe('')
  })
})
