import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join, relative } from 'node:path'
import { spawnSync } from 'node:child_process'

const root = new URL('..', import.meta.url).pathname
const backendRoot = join(root, 'backend')
const frontendRoot = join(root, 'frontend')

const walk = (dir, predicate) => readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const full = join(dir, entry.name)
  if (entry.isDirectory()) return walk(full, predicate)
  return predicate(full) ? [full] : []
})

const backendFiles = walk(backendRoot, (file) => file.endsWith('.js'))
for (const file of backendFiles) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' })
  if (result.status !== 0) {
    process.stderr.write(result.stderr || result.stdout)
    process.exit(result.status || 1)
  }
}

const required = [
  'README.md',
  'LICENSE',
  '.gitignore',
  'backend/env.example',
  'backend/railway.toml',
  'frontend/env.example',
  'frontend/vercel.json',
]
for (const file of required) {
  if (!existsSync(join(root, file))) throw new Error(`Arquivo obrigatório ausente: ${file}`)
}

const demoData = readFileSync(join(frontendRoot, 'src/data/demoData.js'), 'utf8')
const assetRefs = [...demoData.matchAll(/['"](\/demo\/[^'"]+)['"]/g)].map((match) => match[1])
for (const ref of new Set(assetRefs)) {
  const file = join(frontendRoot, 'public', ref.replace(/^\//, ''))
  if (!existsSync(file)) throw new Error(`Asset da demo ausente: ${ref}`)
}

console.log(`OK: ${backendFiles.length} arquivos do backend, ${new Set(assetRefs).size} assets da demo e arquivos de deploy validados.`)
