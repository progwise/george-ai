/* eslint-disable @typescript-eslint/no-explicit-any */

// These types are generated using ChatGPT and are based on the provided code snippets.

export interface ApiResponse {
  success: boolean
  results: Result[]
}

interface Result {
  url: string
  html: string
  success: boolean
  cleaned_html: string
  media: Media
  links: Links
  downloaded_files: any // Adjust if structure known
  js_execution_result: any
  screenshot: any
  pdf: any
  extracted_content: any
  metadata: Metadata
  error_message: string
  session_id: string | null
  response_headers: Record<string, string>
  status_code: number
  ssl_certificate: any
  dispatch_result: any
  redirected_url: string
  markdown: Markdown
}

interface Media {
  images: MediaItem[]
  videos: any[] // Adjust if structure known
  audios: any[]
  tables: any[]
}

interface MediaItem {
  src: string
  data: string
  alt: string
  desc: string
  score: number
  type: string
  group_id: number
  format: string
  width: number | null
}

interface Links {
  internal: LinkItem[]
  external: LinkItem[]
}

interface LinkItem {
  href: string
  text: string
  title: string
  base_domain: string
}

interface Metadata {
  title: string
  description: string | null
  keywords: string | null
  author: string | null
  depth: number
  parent_url: string | null
  score: number
}

interface Markdown {
  raw_markdown: string
  markdown_with_citations: string
  references_markdown: string
  fit_markdown: string
  fit_html: string
}
