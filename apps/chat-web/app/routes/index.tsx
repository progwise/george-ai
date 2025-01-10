import * as fs from 'node:fs'
import { createServerFn } from '@tanstack/start'
import { createFileRoute, useRouter } from '@tanstack/react-router'

const filePath = 'count.txt'

const readCount = async () =>
  Number.parseInt(await fs.promises.readFile(filePath, 'utf8').catch(() => '0'))

const getCount = createServerFn({ method: 'GET' }).handler(() => readCount())

const updateCount = createServerFn({ method: 'POST' })
  .validator((d: number) => d)
  .handler(async ({ data }) => {
    const count = await readCount()
    await fs.promises.writeFile(filePath, `${count + data}`)
  })

const Home = () => {
  const router = useRouter()
  const state = Route.useLoaderData()

  return (
    <>
      <h1>Welcome to George-AI </h1>
      <button
        type="button"
        onClick={() => {
          updateCount({ data: 1 }).then(() => router.invalidate())
        }}
        className="btn btn-primary"
      >
        Add 1 to {state}
      </button>
    </>
  )
}

export const Route = createFileRoute('/')({
  component: Home,
  loader: async () => await getCount(),
})
