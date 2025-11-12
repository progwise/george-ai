/**
 * Author profiles for blog posts
 * Add new authors here as needed
 */
export interface AuthorProfile {
  name: string
  bio: string
}

export const AUTHORS: Record<string, AuthorProfile> = {
  'Michael Vogt': {
    name: 'Michael Vogt',
    bio: 'Michael Vogt is the founder of George AI and an expert in self-hosted AI infrastructure and LLM context management.',
  },
}

/**
 * Get author bio by name, with fallback for unknown authors
 */
export function getAuthorBio(authorName: string): string {
  return AUTHORS[authorName]?.bio ?? `${authorName} is a contributor to George AI.`
}
