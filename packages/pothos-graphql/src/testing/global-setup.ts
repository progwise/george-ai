import { execSync } from 'node:child_process'

export default async () => {
  process.env.DATABASE_URL = process.env.DATABASE_URL_TEST!

  execSync('prisma db push --skip-generate --accept-data-loss', {
    stdio: 'inherit',
    cwd: __dirname + '/../../',
  })
}
