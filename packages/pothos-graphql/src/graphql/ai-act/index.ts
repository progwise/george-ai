import { builder } from '../builder'

interface AiActAssessment {
  assistantId: string
  riskLevel: 'high' | 'medium' | 'low' | 'nonApplicable' | 'undetermined'
  systemInfo: AiActSystemInfo
}

interface AiActQuestionType<T> {
  value: T
  notes: string
}

interface AiActSystemInfo {
  systemType: AiActQuestionType<'ML' | 'Rules' | 'Both'>
  operationMode: AiActQuestionType<'Autonomous' | 'Assisting'>
  syntheticContent: AiActQuestionType<'Yes' | 'No'>
  gpaiModel: AiActQuestionType<'Yes' | 'No' | 'Unsure'>
  euOperation: AiActQuestionType<'Yes' | 'No'>
}

const getAiActQuestionType = <TOption extends string>(typeName: string, options: TOption[]) => {
  const valueEnum = builder.enumType(`${typeName}ValueEnumType`, {
    values: options,
  })
  const oRef = builder.objectRef<{ value: TOption; notes: string }>(typeName).implement({
    description: 'AI Act Question Type',
    fields: (t) => ({
      value: t.field({
        type: valueEnum,
        resolve: (source) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return source.value as any
        },
      }),
      notes: t.exposeString('notes', { nullable: true }),
    }),
  })
  return oRef
}

const AiActSystemInfoSystemType = getAiActQuestionType('AiActSystemInfoSystemType', ['ML', 'Rules', 'Both'] as const)
const AiActOperationModeRef = getAiActQuestionType('AiActSystemInfoOperationMode', ['Autonomous', 'Assisting'])
const AiActSyntheticContentRef = getAiActQuestionType('AiActSystemInfoSyntheticContent', ['Yes', 'No'])
const AiActGpaiModelRef = getAiActQuestionType('AiActSystemInfoGpaiModel', ['Yes', 'No', 'Unsure'])
const AiActEuOperationRef = getAiActQuestionType('AiActSystemInfoEuOperation', ['Yes', 'No'])

const AiActSystemInfoRef = builder.objectRef<AiActSystemInfo>('AiActSystemInfo').implement({
  description: 'AI Act System Info',
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

type AiActRiskIndicator = {
  level: 'high' | 'medium' | 'low' | 'nonApplicable' | 'undetermined'
  description: string
  factors?: string[]
}

const AiActRiskIndicatorLevelEnum = builder.enumType('AiActRiskIndicatorLevel', {
  values: ['high', 'medium', 'low', 'nonApplicable', 'undetermined'] as const,
  description: 'AI Act Risk Indicator Level',
})

const AiActRiskIndicatorRef = builder.objectRef<AiActRiskIndicator>('AiActRiskIndicator').implement({
  description: 'AI Act Risk Indicator',
  fields: (t) => ({
    level: t.exposeString('level'),
    description: t.exposeString('description'),
    factors: t.exposeStringList('factors', { nullable: true }),
  }),
})

const AiActAssessmentRef = builder.objectRef<AiActAssessment>('AiActAssessment').implement({
  description: 'AI Act Assessment',
  fields: (t) => ({
    assistantId: t.exposeString('assistantId'),
    riskLevel: t.expose('riskLevel', {
      type: AiActRiskIndicatorLevelEnum,
    }),
    systemInfo: t.field({
      type: AiActSystemInfoRef,
      resolve: (source) => source.systemInfo,
    }),
  }),
})

interface AiActQuery {
  riskIndicators: AiActRiskIndicator[]
}

const AiActQueryRef = builder.objectRef<AiActQuery>('AiActQuery').implement({
  description: 'AI Act Risk Indicator',
  fields: (t) => ({
    riskIndicators: t.field({
      type: [AiActRiskIndicatorRef],
      resolve: (source) => source.riskIndicators,
    }),
  }),
})

builder.queryField('AiAct', (t) =>
  t.field({
    type: AiActQueryRef,
    resolve: () => {
      // Mock implementation for the AI Act query
      const ret = {
        riskIndicators: [
          {
            level: 'high',
            description: 'High risk due to potential misuse.',
            factors: ['Factor 1', 'Factor 2'],
          } as AiActRiskIndicator,
        ],
      }
      return ret
    },
  }),
)

builder.queryField('AiActAssessment', (t) =>
  t.field({
    type: AiActAssessmentRef,
    args: {
      assistantId: t.arg.string({ required: true }),
    },
    resolve: (_source, { assistantId }) => {
      // Mock implementation for the AI Act Assessment query
      const ret = {
        assistantId,
        riskLevel: 'high' as const,
        systemInfo: {
          systemType: { value: 'ML', notes: 'Machine Learning' },
          operationMode: { value: 'Autonomous', notes: 'Autonomous Operation' },
          syntheticContent: { value: 'Yes', notes: 'Synthetic Content Present' },
          gpaiModel: { value: 'Yes', notes: 'GPAI Model Used' },
          euOperation: { value: 'Yes', notes: 'EU Operation' },
        } as AiActSystemInfo,
      }
      return ret
    },
  }),
)
