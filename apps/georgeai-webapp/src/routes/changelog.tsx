import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { FormattedMarkdown } from '../components/formatted-markdown'

const getChangelog = createServerFn({ method: 'GET' }).handler(async () => {
  const changelogPath = join(process.cwd(), 'public', 'CHANGELOG.md')
  return await readFile(changelogPath, 'utf-8')
})

export const Route = createFileRoute('/changelog')({
  component: RouteComponent,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData({
      queryKey: ['changelog'],
      queryFn: () => getChangelog(),
    })
  },
})

function RouteComponent() {
  const { data: markdown } = useSuspenseQuery({
    queryKey: ['changelog'],
    queryFn: () => getChangelog(),
  })

  return (
    <div className="min-h-screen bg-base-100">
      <div className="container mx-auto px-4 py-8">
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <FormattedMarkdown markdown={markdown} className="prose max-w-none" />
          </div>
        </div>
      </div>
    </div>
  )
}
