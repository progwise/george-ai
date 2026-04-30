import { sharepoint } from '@george-ai/app-domain'

import { builder } from '../builder'

// Define the SharePoint validation result type
const SharePointValidationResult = builder
  .objectRef<{ success: boolean; errorMessage: string | null; errorType: string | null }>('SharePointValidationResult')
  .implement({
    fields: (t) => ({
      success: t.boolean({
        nullable: false,
        resolve: (parent) => parent.success,
      }),
      errorMessage: t.string({
        nullable: true,
        resolve: (parent) => parent.errorMessage,
      }),
      errorType: t.string({
        nullable: true,
        resolve: (parent) => parent.errorType,
      }),
    }),
  })

// GraphQL mutation for validating SharePoint connections
builder.mutationField('validateSharePointConnection', (t) =>
  t.field({
    type: SharePointValidationResult,
    nullable: false,
    args: {
      uri: t.arg.string({ required: true }),
      sharepointAuth: t.arg.string({ required: true }),
    },
    resolve: async (_source, { uri, sharepointAuth }) => {
      // Redact auth cookie in logs
      console.log(`Received SharePoint validation request for ${uri} with auth: ***`)

      try {
        const result = await sharepoint.validateSharePointConnection(uri, sharepointAuth)

        if (result.success) {
          return {
            success: true,
            errorMessage: null,
            errorType: null,
          }
        } else {
          // Get appropriate error message based on error type
          let errorMessage: string
          switch (result.errorType) {
            case 'LIBRARY_NOT_FOUND': {
              const { libName } = sharepoint.parseSharePointUrl(uri)
              errorMessage = `Document library '${libName}' not found`
              break
            }
            case 'AUTHENTICATION_ERROR':
              errorMessage = 'SharePoint authentication failed'
              break
            case 'NOT_FOUND':
              errorMessage = 'SharePoint site not found or unreachable'
              break
            case 'NETWORK_ERROR':
              errorMessage = 'Network error connecting to SharePoint'
              break
            default:
              errorMessage = 'SharePoint validation failed'
          }

          return {
            success: false,
            errorMessage,
            errorType: result.errorType || 'UNKNOWN_ERROR',
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
        console.error(`SharePoint validation error: ${errorMessage}`)

        return {
          success: false,
          errorMessage,
          errorType: 'UNKNOWN_ERROR',
        }
      }
    },
  }),
)
