export interface AiActAnswerType<T> {
  value: T | null
  notes: string
}

export interface BasicSystemInfoQuestions {
  systemType: AiActAnswerType<'ML' | 'Rules' | 'Both'>
  operationMode: AiActAnswerType<'Autonomous' | 'Assisting'>
  syntheticContent: AiActAnswerType<'Yes' | 'No'>
  gpaiModel: AiActAnswerType<'Yes' | 'No' | 'Unsure'>
  euOperation: AiActAnswerType<'Yes' | 'No'>
}

export interface AiActChecklistNavigation {
  title: string
  description: string
}

export interface AiActBasicSystemInfo {
  title: string
  description: string
  percentCompleted: number
  questions: BasicSystemInfoQuestions
  navigation: AiActChecklistNavigation
}

export const getDefaultBasicSystemInfo = (assistantId: string): AiActBasicSystemInfo => {
  console.log('Get default basic system info for assistant', assistantId)
  return {
    title: 'Basic System Info',
    description: 'Basic System Info Description',
    percentCompleted: 0,
    questions: {
      systemType: { value: null, notes: '' },
      operationMode: { value: null, notes: '' },
      syntheticContent: { value: null, notes: '' },
      gpaiModel: { value: null, notes: '' },
      euOperation: { value: null, notes: '' },
    },
    navigation: {
      title: 'Navigation Title',
      description: 'Navigation Description',
    },
  }
}
