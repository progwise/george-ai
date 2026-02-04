import { initializeAppDomain } from './initialize'

initializeAppDomain().catch((error) => {
  console.error('Error initializing app domain:', error)
})

export type * from './context'

export type * from './workspace'
export { default as workspace } from './workspace'

export type * from './user'
export { default as user } from './user'

export type * from './api-key'
export { default as apiKey } from './api-key'

export * from './error'

export * from './access-control'
