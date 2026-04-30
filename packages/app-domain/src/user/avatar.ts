// Avatar utility functions for handling OAuth provider avatars

// Known OAuth provider domains for avatar URLs (Google, GitHub, LinkedIn)
const OAUTH_PROVIDER_DOMAINS = [
  'googleusercontent.com', // Google
  'avatars.githubusercontent.com', // GitHub
  'media.licdn.com', // LinkedIn
] as const

// Checks if an avatar URL is from an OAuth provider
export const isProviderAvatar = (avatarUrl: string | null): boolean => {
  if (!avatarUrl) return false
  return OAUTH_PROVIDER_DOMAINS.some((domain) => avatarUrl.includes(domain))
}

// Extracts and validates avatar URL from OAuth provider token
export const extractAvatarFromToken = async (tokenData: Record<string, unknown>): Promise<string | null> => {
  // Look for avatar_url field (standardized across all providers in Keycloak)
  const avatarUrl = tokenData['avatar_url']

  if (!avatarUrl || typeof avatarUrl !== 'string' || !avatarUrl.trim()) {
    return null
  }

  // Validate and normalize the URL
  try {
    new URL(avatarUrl)
    return avatarUrl.trim()
  } catch {
    return null
  }
}
