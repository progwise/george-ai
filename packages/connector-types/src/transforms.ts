import MarkdownIt from 'markdown-it'

import type { TransformType } from './validation'

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
})

/**
 * Transform a value based on the transform type
 */
export function transformValue(value: unknown, transform: TransformType): unknown {
  if (value === null || value === undefined) {
    return value
  }

  switch (transform) {
    case 'raw':
      return value

    case 'markdownToHtml':
      return md.render(String(value))

    case 'number': {
      const num = Number(value)
      return isNaN(num) ? null : num
    }

    case 'boolean': {
      if (typeof value === 'boolean') return value
      if (typeof value === 'string') {
        const lower = value.toLowerCase()
        return lower === 'true' || lower === '1' || lower === 'yes'
      }
      return Boolean(value)
    }

    default:
      return value
  }
}

/**
 * Replace field placeholders in a template string
 * Placeholders use mustache-like syntax: {{fieldName}}
 */
export function substituteFieldValues(template: string, fieldValues: Record<string, unknown>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, fieldName) => {
    const value = fieldValues[fieldName]
    if (value === undefined || value === null) {
      return match // Keep placeholder if value not found
    }
    return String(value)
  })
}
