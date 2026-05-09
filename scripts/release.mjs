#!/usr/bin/env node
import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'

const bump = process.argv[2]
if (!['patch', 'minor', 'major'].includes(bump)) {
  console.error('Usage: npm run release <patch|minor|major>')
  process.exit(1)
}

const pkg = JSON.parse(readFileSync('package.json', 'utf-8'))
const [major, minor, patch] = pkg.version.split('.').map(Number)

const next =
  bump === 'major' ? `${major + 1}.0.0`
  : bump === 'minor' ? `${major}.${minor + 1}.0`
  : `${major}.${minor}.${patch + 1}`

const run = (cmd) => execSync(cmd, { stdio: 'inherit' })

console.log('\n→ typecheck')
run('npm run typecheck')

console.log('\n→ build')
run('npm run build')

console.log(`\n→ bump ${pkg.version} → ${next}`)
pkg.version = next
writeFileSync('package.json', `${JSON.stringify(pkg, null, 2)}\n`, 'utf-8')

run('git add -A')
run(`git commit -m "${next}"`)
run(`git tag v${next}`)
run(`git push origin main v${next}`)

console.log(`\n✅ Released v${next}`)
