import { builder } from '../builder'

console.log('Setting up: AiLibraryCrawlerCronJob')

builder.prismaObject('AiLibraryCrawlerCronJob', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),

    active: t.expose('active', { type: 'Boolean', nullable: false }),

    hour: t.expose('hour', { type: 'Int', nullable: false }),
    minute: t.expose('minute', { type: 'Int', nullable: false }),
    monday: t.expose('monday', { type: 'Boolean', nullable: false }),
    tuesday: t.expose('tuesday', { type: 'Boolean', nullable: false }),
    wednesday: t.expose('wednesday', { type: 'Boolean', nullable: false }),
    thursday: t.expose('thursday', { type: 'Boolean', nullable: false }),
    friday: t.expose('friday', { type: 'Boolean', nullable: false }),
    saturday: t.expose('saturday', { type: 'Boolean', nullable: false }),
    sunday: t.expose('sunday', { type: 'Boolean', nullable: false }),

    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime', nullable: false }),
  }),
})

export const AiLibraryCrawlerCronJobInput = builder.inputType('AiLibraryCrawlerCronJobInput', {
  fields: (t) => ({
    active: t.boolean({ required: true }),
    hour: t.int({ required: true }),
    minute: t.int({ required: true }),
    monday: t.boolean({ required: true }),
    tuesday: t.boolean({ required: true }),
    wednesday: t.boolean({ required: true }),
    thursday: t.boolean({ required: true }),
    friday: t.boolean({ required: true }),
    saturday: t.boolean({ required: true }),
    sunday: t.boolean({ required: true }),
  }),
})
