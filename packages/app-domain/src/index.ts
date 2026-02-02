import { initializeAppDomain } from './initialize'

export type * from '../../app-domain/src/context'

export type * from '../../app-domain/src/workspace'
export { default as workspace } from '../../app-domain/src/workspace'

export type * from '../../app-domain/src/user'
export { default as user } from '../../app-domain/src/user'

export type * from '../../app-domain/src/api-key'
export { default as apiKey } from '../../app-domain/src/api-key'

initializeAppDomain().catch((error) => {
  console.error('Error initializing app domain:', error)
})
