import { AiActBasicSystemInfo, BasicSystemInfoQuestions } from '@george-ai/ai-act'

import { builder } from '../builder'
import { getAiActAnswerTypeRef } from './answer-type'
import { AIActChecklistNavigationRef } from './navigation'

const AiActSystemInfoSystemType = getAiActAnswerTypeRef('AiActSystemInfoSystemType', ['ML', 'Rules', 'Both'] as const)
const AiActOperationModeRef = getAiActAnswerTypeRef('AiActSystemInfoOperationMode', ['Autonomous', 'Assisting'])
const AiActSyntheticContentRef = getAiActAnswerTypeRef('AiActSystemInfoSyntheticContent', ['Yes', 'No'])
const AiActGpaiModelRef = getAiActAnswerTypeRef('AiActSystemInfoGpaiModel', ['Yes', 'No', 'Unsure'])
const AiActEuOperationRef = getAiActAnswerTypeRef('AiActSystemInfoEuOperation', ['Yes', 'No'])

const AiActBasicSystemInfoQuestionsRef = builder
  .objectRef<BasicSystemInfoQuestions>('AiActBasicSystemInfoQuestionsRef')
  .implement({
    description: 'AI Act System Info Questions',
    fields: (t) => ({
      systemType: t.field({
        type: AiActSystemInfoSystemType,
        resolve: (source) => source.systemType,
      }),
      operationMode: t.field({
        type: AiActOperationModeRef,
        resolve: (source) => source.operationMode,
      }),
      syntheticContent: t.field({
        type: AiActSyntheticContentRef,
        resolve: (source) => source.syntheticContent,
      }),
      gpaiModel: t.field({
        type: AiActGpaiModelRef,
        resolve: (source) => source.gpaiModel,
      }),
      euOperation: t.field({
        type: AiActEuOperationRef,
        resolve: (source) => source.euOperation,
      }),
    }),
  })

export const AiActBasicSystemInfoRef = builder.objectRef<AiActBasicSystemInfo>('AiActBasicSystemInfoRef').implement({
  description: 'AI Act Assessment Basic System Info 2',
  fields: (t) => ({
    title: t.exposeString('title'),
    description: t.exposeString('description'),
    percentCompleted: t.exposeInt('percentCompleted'),
    questions: t.field({
      type: AiActBasicSystemInfoQuestionsRef,
      resolve: (source) => source.questions,
    }),
    navigation: t.field({
      type: AIActChecklistNavigationRef,
      resolve: (source) => source.navigation,
    }),
  }),
})
