// Avatar utility functions for handling OAuth provider avatars

// Known OAuth provider domains for avatar URLs (Google, GitHub, LinkedIn)
export const OAUTH_PROVIDER_DOMAINS = [
  'googleusercontent.com', // Google
  'avatars.githubusercontent.com', // GitHub
  'media.licdn.com', // LinkedIn
] as const

// Checks if an avatar URL is from an OAuth provider
export const isProviderAvatar = (avatarUrl: string | null): boolean => {
  if (!avatarUrl) return false
  return OAUTH_PROVIDER_DOMAINS.some((domain) => avatarUrl.includes(domain))
}

// Determines if we should update a user's avatar based on their current avatar and a new provider avatar
export const shouldUpdateAvatarFromProvider = (
  currentAvatarUrl: string | null,
  newProviderAvatarUrl: string | null,
  isNewUser: boolean = false,
): boolean => {
  // Always set avatar for new users if provider has one
  if (isNewUser) {
    return !!newProviderAvatarUrl
  }

  // Don't update if provider doesn't have an avatar
  if (!newProviderAvatarUrl) {
    return false
  }

  // Update if user has no avatar at all
  if (!currentAvatarUrl) {
    return true
  }

  // Update if current avatar is from a provider (not manually uploaded)
  if (isProviderAvatar(currentAvatarUrl)) {
    return true
  }

  // Don't update manually uploaded avatars
  return false
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

// Gets the preferred avatar URL (provider first, then current)
export const getPreferredAvatarUrl = (
  providerAvatarUrl: string | null,
  currentAvatarUrl: string | null,
): string | null => {
  // Use provider avatar if available
  if (providerAvatarUrl) {
    return providerAvatarUrl
  }

  // Keep existing avatar if available
  if (currentAvatarUrl) {
    return currentAvatarUrl
  }

  return null
}
