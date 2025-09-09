import { describe, expect, it } from 'vitest'

import { checkLineRepetition, formatFileSize, jsonArrayToString, parseCommaList, parseJsonArray } from './strings'

describe('checkLineRepetition', () => {
  it('should return false for arrays with less than 20 lines', () => {
    const lines = Array(19).fill('test line')
    expect(checkLineRepetition(lines)).toBe(false)
  })

  it('should return false for empty arrays', () => {
    expect(checkLineRepetition([])).toBe(false)
  })

  it('should return false for non-repeating lines', () => {
    const lines = Array.from({ length: 25 }, (_, i) => `line ${i}`)
    expect(checkLineRepetition(lines)).toBe(false)
  })

  it('should detect single line repetition at the end (pattern size 1)', () => {
    const lines = [
      'line 1',
      'line 2',
      'line 3',
      'line 4',
      'line 5',
      'line 6',
      'line 7',
      'line 8',
      'line 9',
      'line 10',
      'line 11',
      'line 12',
      'line 13',
      'line 14',
      'line 15',
      // Need at least 3 repetitions of single line to detect
      'repeating',
      'repeating',
      'repeating',
      'repeating',
      'repeating',
    ]
    expect(checkLineRepetition(lines)).toBe(true)
  })

  it('should detect two line alternating pattern (pattern size 2)', () => {
    const lines = [
      'line 1',
      'line 2',
      'line 3',
      'line 4',
      'line 5',
      'line 6',
      'line 7',
      'line 8',
      'line 9',
      'line 10',
      'line 11',
      'line 12',
      'line 13',
      'line 14',
      // Pattern: A,B,A,B,A,B (3 cycles of 2-line pattern)
      'A',
      'B',
      'A',
      'B',
      'A',
      'B',
    ]
    expect(checkLineRepetition(lines, 3)).toBe(true)
  })

  it('should detect three line repeating pattern (pattern size 3)', () => {
    const lines = [
      'line 1',
      'line 2',
      'line 3',
      'line 4',
      'line 5',
      'line 6',
      'line 7',
      'line 8',
      'line 9',
      'line 10',
      'line 11',
      'line 12',
      'line 13',
      // Pattern: A,B,C,A,B,C,A (2+ cycles of 3-line pattern)
      'A',
      'B',
      'C',
      'A',
      'B',
      'C',
      'A',
    ]
    expect(checkLineRepetition(lines, 2)).toBe(true)
  })

  it('should detect four line repeating pattern (pattern size 4)', () => {
    const lines = [
      'line 1',
      'line 2',
      'line 3',
      'line 4',
      'line 5',
      'line 6',
      'line 7',
      'line 8',
      'line 9',
      'line 10',
      'line 11',
      'line 12',
      // Pattern: W,X,Y,Z,W,X,Y,Z (2 cycles of 4-line pattern)
      'W',
      'X',
      'Y',
      'Z',
      'W',
      'X',
      'Y',
      'Z',
    ]
    expect(checkLineRepetition(lines, 2)).toBe(true)
  })

  it('should detect five line repeating pattern (pattern size 5)', () => {
    const lines = [
      'line 1',
      'line 2',
      'line 3',
      'line 4',
      'line 5',
      'line 6',
      'line 7',
      'line 8',
      'line 9',
      'line 10',
      // Pattern: 1,2,3,4,5,1,2,3,4,5 (2 cycles of 5-line pattern)
      '1',
      '2',
      '3',
      '4',
      '5',
      '1',
      '2',
      '3',
      '4',
      '5',
    ]
    expect(checkLineRepetition(lines, 2)).toBe(true)
  })

  it('should return false for insufficient repetition', () => {
    const lines = [
      'line 1',
      'line 2',
      'line 3',
      'line 4',
      'line 5',
      'line 6',
      'line 7',
      'line 8',
      'line 9',
      'line 10',
      'line 11',
      'line 12',
      'line 13',
      'line 14',
      'line 15',
      'line 16',
      'line 17',
      // Only 2 repetitions of single line - not enough
      'repeat',
      'repeat',
      'different',
    ]
    expect(checkLineRepetition(lines)).toBe(false)
  })

  it('should return false for broken pattern', () => {
    const lines = [
      'line 1',
      'line 2',
      'line 3',
      'line 4',
      'line 5',
      'line 6',
      'line 7',
      'line 8',
      'line 9',
      'line 10',
      'line 11',
      'line 12',
      'line 13',
      'line 14',
      'line 15',
      // Pattern breaks: A,B,A,B,different
      'A',
      'B',
      'A',
      'B',
      'different',
    ]
    expect(checkLineRepetition(lines)).toBe(false)
  })

  it('should detect empty string repetition', () => {
    const lines = [
      'line 1',
      'line 2',
      'line 3',
      'line 4',
      'line 5',
      'line 6',
      'line 7',
      'line 8',
      'line 9',
      'line 10',
      'line 11',
      'line 12',
      'line 13',
      'line 14',
      'line 15',
      // 5 empty strings repeating
      '',
      '',
      '',
      '',
      '',
    ]
    expect(checkLineRepetition(lines)).toBe(true)
  })

  it('should detect mixed content in repeating pattern', () => {
    const lines = [
      'line 1',
      'line 2',
      'line 3',
      'line 4',
      'line 5',
      'line 6',
      'line 7',
      'line 8',
      'line 9',
      'line 10',
      'line 11',
      'line 12',
      'line 13',
      'line 14',
      // Pattern: "Hello world!","" repeating 3 times
      'Hello world!',
      '',
      'Hello world!',
      '',
      'Hello world!',
      '',
    ]
    expect(checkLineRepetition(lines, 3)).toBe(true)
  })

  it('should detect special characters in repetition', () => {
    const lines = [
      'line 1',
      'line 2',
      'line 3',
      'line 4',
      'line 5',
      'line 6',
      'line 7',
      'line 8',
      'line 9',
      'line 10',
      'line 11',
      'line 12',
      'line 13',
      'line 14',
      'line 15',
      // Special characters repeating
      '!@#$%^&*()',
      '!@#$%^&*()',
      '!@#$%^&*()',
      '!@#$%^&*()',
      '!@#$%^&*()',
    ]
    expect(checkLineRepetition(lines)).toBe(true)
  })

  it('should require minimum line count (20 lines)', () => {
    // Exactly 20 lines with repetition at end
    const lines = Array.from({ length: 16 }, (_, i) => `line ${i}`).concat(['repeat', 'repeat', 'repeat', 'repeat'])
    expect(lines.length).toBe(20)
    expect(checkLineRepetition(lines, 4)).toBe(true)
  })

  it('should handle real-world LLM endless loop scenario', () => {
    const lines = [
      'Here is my response to your question.',
      'I need to think about this carefully.',
      'Let me provide you with the information.',
      'This is an important topic to consider.',
      'I want to give you a thorough answer.',
      'Based on the context provided...',
      'The key points to understand are:',
      '1. First point',
      '2. Second point',
      '3. Third point',
      'In conclusion, I believe that...',
      'However, I should also mention...',
      "It's worth noting that...",
      'Additionally, you should consider...',
      "Furthermore, it's important to...",
      // Endless repetition starts here (LLM got stuck)
      'I hope this helps!',
      'I hope this helps!',
      'I hope this helps!',
      'I hope this helps!',
      'I hope this helps!',
    ]
    expect(checkLineRepetition(lines)).toBe(true)
  })
})

describe('parseCommaList', () => {
  it('should parse comma-separated values', () => {
    expect(parseCommaList('a,b,c')).toEqual(['a', 'b', 'c'])
  })

  it('should handle empty input', () => {
    expect(parseCommaList('')).toBeUndefined()
    expect(parseCommaList(undefined)).toBeUndefined()
  })

  it('should trim whitespace', () => {
    expect(parseCommaList(' a , b , c ')).toEqual(['a', 'b', 'c'])
  })
})

describe('parseJsonArray', () => {
  it('should parse valid JSON arrays', () => {
    expect(parseJsonArray('["a", "b", "c"]')).toEqual(['a', 'b', 'c'])
  })

  it('should return empty array for invalid JSON', () => {
    expect(parseJsonArray('invalid json')).toEqual([])
    expect(parseJsonArray(null)).toEqual([])
    expect(parseJsonArray(undefined)).toEqual([])
  })
})

describe('jsonArrayToString', () => {
  it('should convert JSON array to comma-separated string', () => {
    expect(jsonArrayToString('["a", "b", "c"]')).toBe('a, b, c')
  })

  it('should handle empty input', () => {
    expect(jsonArrayToString(null)).toBe('')
    expect(jsonArrayToString(undefined)).toBe('')
  })
})

describe('formatFileSize', () => {
  it('should convert bytes to MB string', () => {
    expect(formatFileSize(1048576)).toBe('1') // 1 MB
    expect(formatFileSize(5242880)).toBe('5') // 5 MB
  })

  it('should handle empty input', () => {
    expect(formatFileSize(null)).toBe('')
    expect(formatFileSize(undefined)).toBe('')
    expect(formatFileSize(0)).toBe('')
  })
})
