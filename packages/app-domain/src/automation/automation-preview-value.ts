// Preview value type for automation items
export interface AutomationPreviewValue {
  targetField: string
  value: string | null
  transformedValue: string | null
  isMissing: boolean
}
