import { exec } from 'child_process'

export const reportPorts = async () =>
  new Promise<string[]>((resolve, reject) => {
    exec('netstat -nptl |grep node', (error, stdout) => {
      if (error) {
        reject([error.message])
        return
      }
      const output = new Array<string>()
      stdout.split('\n').forEach((line) => {
        const words = line.split(/\s+/)
        if (words.length > 3) {
          const parts = words[3].split(':')
          output.push(parts[parts.length - 1])
        }
      })
      resolve(output)
    })
  })
