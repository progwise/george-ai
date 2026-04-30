import fs from 'node:fs'
import path from 'node:path'

const turboDir = '.turbo/runs'
const latestRun = fs
  .readdirSync(turboDir)
  .filter((f) => f.endsWith('.json'))
  .map((f) => ({ name: f, time: fs.statSync(path.join(turboDir, f)).mtime }))
  .sort((a, b) => b.time - a.time)[0]

const data = JSON.parse(fs.readFileSync(path.join(turboDir, latestRun.name)))

const tableData = data.tasks.map((task) => {
  // Turbo provides the directory of the task
  const metadataPath = path.join(task.directory, 'node_modules/.vitest-reports', 'test-summary-metadata.json')
  let stats = { passed: 0, failed: 0, total: 0, failedFiles: [] }

  if (fs.existsSync(metadataPath)) {
    stats = JSON.parse(fs.readFileSync(metadataPath, 'utf8'))
  }

  const result = {
    Package: task.package,
    Passed: stats.passed,
    Failed: stats.failed,
    Total: stats.total,
    Duration: `${((task.execution.endTime - task.execution.startTime) / 1000).toFixed(2).toString().padStart(5)} s`,
    FailedFiles: stats.failedFiles || [],
    Skipped: stats.skipped || 0,
  }

  return result
})

// ... (keep your existing logic for fetching data and stats)

console.log('\n🏁 \x1b[1mTURBO TEST DASHBOARD\x1b[0m')
console.log('━'.repeat(80))

// Header
const h = {
  pkg: 'PACKAGE'.padEnd(35),
  passed: ' 👍 ',
  failed: '👎 ',
  skipped: '👋',
  total: ' ∑ ',
  dur: '    ⏱️   ',
}
console.log(`\x1b[2m${h.pkg} ${h.passed} ${h.failed} ${h.skipped} ${h.total} ${h.dur}\x1b[0m`)
console.log('━'.repeat(80))

tableData.forEach((row) => {
  const pkg = `${row.Failed > 0 ? '\x1b[31m' : '\x1b[32m'}${row.Package.padEnd(35)}\x1b[0m`
  const passed = `\x1b[32m${row.Passed.toString().padStart(3).padEnd(2)}\x1b[0m`
  const failed = `\x1b[31m${row.Failed > 0 ? row.Failed.toString().padStart(3).padEnd(2) : '   '}\x1b[0m`
  const total = row.Total.toString().padStart(3).padEnd(2)
  const duration = row.Duration.toString().padStart(8)
  const skipped = `\x1b[33m${row.Skipped > 0 ? row.Skipped.toString().padStart(3).padEnd(2) : '   '}\x1b[0m`

  console.log(`${pkg} ${passed} ${failed} ${skipped} ${total} ${duration}`)
})

const totalPassed = tableData.reduce((sum, row) => {
  return sum + row.Passed
}, 0)

const totalFailed = tableData.reduce((sum, row) => {
  return sum + row.Failed
}, 0)

const totalTests = tableData.reduce((sum, row) => {
  return sum + row.Total
}, 0)

const totalSkipped = tableData.reduce((sum, row) => {
  return sum + (row.Skipped ?? 0)
}, 0)

const allFailedFiles = tableData.reduce((acc, curr) => [...acc, ...curr.FailedFiles], [])

console.log('━'.repeat(80))
console.log(`Total tests: ${totalTests}\n`)
console.log(
  `\x1b[32m${totalPassed} Tests Passed\x1b[0m, \x1b[31m${totalFailed} Tests Failed\x1b[0m, \x1b[33m${totalSkipped} Tests skipped\x1b[0m\n\n`,
)

if (allFailedFiles.length > 0) {
  allFailedFiles.forEach(({ file, failedTests }) => {
    console.log(`${file.replace('/workspaces/george-ai', '.')}:`)
    failedTests.forEach((name) => console.log(`\x1b[31m  - ${name}\x1b[0m`))
    console.log()
  })
}

if (data.tasks.some((t) => t.execution.exitCode !== 0)) process.exit(1)
