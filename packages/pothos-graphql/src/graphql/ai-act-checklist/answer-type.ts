import { builder } from '../builder'

export const getAiActAnswerTypeRef = <TOption extends string>(typeName: string, options: TOption[]) => {
  const valueEnum = builder.enumType(`${typeName}ValueEnumType`, {
    values: options,
  })
  const oRef = builder.objectRef<{ value: TOption | null; notes: string }>(typeName).implement({
    description: 'AI Act Question Type',
    fields: (t) => ({
      value: t.field({
        nullable: true,
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
