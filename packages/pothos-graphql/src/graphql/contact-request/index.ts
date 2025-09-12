import { sendMail } from '../../domain/mailer'
import { builder } from '../builder'

builder.mutationField('createContactRequest', (t) =>
  t.field({
    type: 'Boolean',
    nullable: false,
    args: {
      name: t.arg.string({ required: true }),
      emailOrPhone: t.arg.string({ required: true }),
      message: t.arg.string({ required: true }),
    },
    resolve: async (_parent, args) => {
      const { name, emailOrPhone, message } = args

      console.log('Contact Request:', args)
      await sendMail(
        'info@george-ai.net',
        'Contact Request from George-AI',
        `Name: ${name}\nEmail or Phone: ${emailOrPhone}\nMessage: ${message}`,
        `<p>Name: ${name}</p><p>Email or Phone: ${emailOrPhone}</p><p>Message: ${message}</p>`,
      )

      return true // Return true to indicate success
    },
  }),
)
