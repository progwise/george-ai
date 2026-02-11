export const PROCESSING_REQUEST_TYPES = ['extractFile', 'embedFile', 'enrichItem'] as const
export type ProcessingRequestType = (typeof PROCESSING_REQUEST_TYPES)[number]

export const getProcessingRequestType = (value: string): ProcessingRequestType | null => {
  if (!value || !PROCESSING_REQUEST_TYPES.includes(value as ProcessingRequestType)) {
    return null
  }
  return value as ProcessingRequestType
}

export const PROCESSING_STATUS_VALUES = ['pending', 'in-progress', 'completed', 'failed'] as const
export type ProcessingStatus = (typeof PROCESSING_STATUS_VALUES)[number]
