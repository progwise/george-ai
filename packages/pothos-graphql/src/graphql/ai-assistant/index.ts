import { builder } from '../builder'

import './mutations'
import './queries'

console.log('Setting up: AiAssistant')

export const AiAssistantBaseCase = builder.prismaObject('AiAssistantBaseCase', {
  name: 'AiAssistantBaseCase',
  fields: (t) => ({
    id: t.exposeID('id'),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
    sequence: t.exposeFloat('sequence'),
    condition: t.exposeString('condition'),
    instruction: t.exposeString('instruction'),
    assistant: t.relation('assistant'),
  }),
})

export const AiAssistant = builder.prismaObject('AiAssistant', {
  name: 'AiAssistant',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    name: t.exposeString('name', { nullable: false }),
    description: t.exposeString('description'),
    url: t.exposeString('url'),
    iconUrl: t.exposeString('iconUrl'),
    ownerId: t.exposeID('ownerId', { nullable: false }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
    languageModel: t.relation('languageModel'),
    baseCases: t.relation('baseCases', { nullable: false, query: () => ({ orderBy: [{ sequence: 'asc' }] }) }),
  }),
})
