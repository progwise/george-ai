import { builder } from '../builder'

builder.prismaObject('UserProfile', {
  name: 'UserProfile',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    userId: t.exposeID('userId', { nullable: false }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime', nullable: false }),
    expiresAt: t.expose('expiresAt', { type: 'DateTime', nullable: true }),
    email: t.exposeString('email', { nullable: false }),
    firstName: t.exposeString('firstName', { nullable: true }),
    lastName: t.exposeString('lastName', { nullable: true }),
    business: t.exposeString('business', { nullable: true }),
    position: t.exposeString('position', { nullable: true }),
    confirmationDate: t.expose('confirmationDate', { type: 'DateTime', nullable: true }),
    activationDate: t.expose('activationDate', { type: 'DateTime', nullable: true }),
  }),
})
