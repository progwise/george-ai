import rss from '@astrojs/rss'
import { getCollection } from 'astro:content'
import type { APIContext } from 'astro'

export async function GET(context: APIContext) {
  const posts = await getCollection('blog', ({ data }) => {
    return import.meta.env.PROD ? !data.draft : true
  })

  return rss({
    title: 'George AI Blog',
    description: 'Insights on LLM context management, RAG pipelines, and self-hosted AI infrastructure',
    site: context.site ?? 'https://george-ai.net',
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/blog/${post.slug}/`,
    })),
    customData: '<language>en-us</language>',
  })
}
