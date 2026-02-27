import fs from 'fs'
import path from 'path'

export default class MonorepoReporter {
  onFinished(files = []) {
    const failedFiles = files.filter((file) => file.tasks.some((task) => task.result?.state === 'fail'))
    try {
      const stats = {
        files: files.length,
        failedFiles: failedFiles.map((file) => file.name).join(', '),
        passed: 0,
        failed: 0,
        skipped: 0,
        total: 0,
      }

      files.forEach((file) => {
        file.tasks.forEach((task) => {
          stats.total++
          if (task.result?.state === 'pass') stats.passed++
          if (task.result?.state === 'fail') stats.failed++
          if (task.result?.state === 'skip') stats.skipped++
        })
      })

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
