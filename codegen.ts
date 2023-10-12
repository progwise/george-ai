const { execSync } = require('child_process')

const projects = ['strapiClient', 'nextjsWeb']

projects.forEach((project) => {
  console.log(`Generating code for ${project}...`)
  execSync(`graphql-codegen --config codegen.config.ts --project ${project}`, {
    stdio: 'inherit',
  })
})
