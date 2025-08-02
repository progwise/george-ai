// Client-side avatar utility functions for handling OAuth provider avatars

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

// Adds cache-busting parameters to an avatar URL if it doesn't have them
export const addCacheBustingToAvatarUrl = (avatarUrl: string | null): string | null => {
  if (!avatarUrl) return null

  // Don't modify provider URLs
  if (isProviderAvatar(avatarUrl)) {
    return avatarUrl
  }

  // Add timestamp if not already present
  if (!avatarUrl.includes('updated=')) {
    const separator = avatarUrl.includes('?') ? '&' : '?'
    return `${avatarUrl}${separator}updated=${Date.now()}`
  }

  return avatarUrl
}
