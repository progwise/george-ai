/**
 * Get the application URL based on the current environment
 * @returns The URL for the George-AI application
 */
export const getAppUrl = () => (import.meta.env.DEV ? 'http://localhost:3001' : 'https://app.george-ai.net')
