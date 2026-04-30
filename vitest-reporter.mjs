import fs from 'fs'
import path from 'path'

function getTestStats(entry) {
  if (entry.type === 'test') {
    return {
      passed: entry.result?.state === 'pass' ? 1 : 0,
      failed: entry.result?.state === 'fail' ? 1 : 0,
      skipped: entry.result?.state === 'skip' ? 1 : 0,
      total: 1,
    }
  }
  const tasks = entry.tasks || []
  return tasks.reduce(
    (accumulated, current) => {
      const stats = getTestStats(current)
      return {
        passed: stats.passed + accumulated.passed,
        failed: stats.failed + accumulated.failed,
        skipped: stats.skipped + accumulated.skipped,
        total: stats.total + accumulated.total,
      }
    },
    {
      passed: 0,
      failed: 0,
      skipped: 0,
      total: 0,
    },
  )
}

function getFailedTestNames(entry) {
  if (entry.type === 'test') {
    return entry.result?.state === 'fail' ? [entry.name] : []
  }
  const tasks = entry.tasks || []
  return tasks.reduce((accumulated, current) => {
    return [...accumulated, ...getFailedTestNames(current)]
  }, [])
}

export default class MonorepoReporter {
  onFinished(files = []) {
    console.log('Entry23:', files)
    const failedFiles = files
      .filter((file) => getTestStats(file).failed > 0)
      .map((file) => ({
        file: file.filepath,
        failedTests: getFailedTestNames(file),
      }))

    try {
      const stats = {
        files: files.length,
        failedFiles: failedFiles,
        ...getTestStats({ type: 'all', tasks: files }),
      }

      // Inside vitest-reporter.mjs
      const reportDir = path.resolve(process.cwd(), 'node_modules/.vitest-reports') // node_modules is also a safe, ignored spot
      if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true })
      }

      fs.writeFileSync(path.join(reportDir, 'test-summary-metadata.json'), JSON.stringify(stats))
    } catch (err) {
      console.error('Failed to write metadata to .turbo:', err)
    }
  }
}
