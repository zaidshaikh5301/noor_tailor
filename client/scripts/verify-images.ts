import { readFileSync, existsSync, readdirSync, statSync } from 'fs'
import { resolve, join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { execSync } from 'child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const PROJECT_ROOT = resolve(__dirname, '..', '..')
const PUBLIC_DIR = join(PROJECT_ROOT, 'client', 'public')
const SRC_DIR = join(PROJECT_ROOT, 'client', 'src')

function walkDir(dir: string, ext: string[] = ['.ts', '.tsx']): string[] {
  const files: string[] = []
  const entries = readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...walkDir(fullPath, ext))
    } else if (ext.some(e => entry.name.endsWith(e))) {
      files.push(fullPath)
    }
  }
  return files
}

function extractImagePathsFromFile(filePath: string): string[] {
  const content = readFileSync(filePath, 'utf-8')
  const paths: string[] = []

  const importMatches = content.matchAll(/from\s+['"]([^'"]+)['"]/g)
  for (const match of importMatches) {
    const imp = match[1]
    if (imp.startsWith('/images/')) {
      paths.push(imp)
    }
  }

  const srcMatches = content.matchAll(/src\s*=\s*{?\s*['"`](\/images\/[^'"`]+)['"`]/g)
  for (const match of srcMatches) {
    paths.push(match[1])
  }

  const templateMatches = content.matchAll(/`([^`]*\/images\/[^`]+)`/g)
  for (const match of templateMatches) {
    const str = match[1]
    const subMatches = str.matchAll(/\/images\/[^'"\s`${}]+/g)
    for (const sub of subMatches) {
      paths.push(sub[0])
    }
  }

  const stringMatches = content.matchAll(/['"`](\/images\/[^'"`${}]+)['"`]/g)
  for (const match of stringMatches) {
    paths.push(match[1])
  }

  return [...new Set(paths)].filter(p => !p.includes('${') && !p.endsWith('/'))
}

function checkImageExists(imagePath: string): { exists: boolean; exactCase: boolean; gitTracked: boolean; size: number } {
  const relPath = imagePath.replace(/^\//, '')
  const fullPath = join(PUBLIC_DIR, relPath)
  const exists = existsSync(fullPath)

  let exactCase = false
  if (exists) {
    const dirParts = relPath.split('/').slice(0, -1)
    const dir = dirParts.length > 0 ? join(PUBLIC_DIR, ...dirParts) : PUBLIC_DIR
    const fileName = relPath.split('/').pop() || ''
    try {
      const files = readdirSync(dir)
      exactCase = files.includes(fileName)
    } catch {
      exactCase = false
    }
  }

  let gitTracked = false
  try {
    const gitPath = `client/public/${relPath}`
    const result = execSync(`git ls-files ${gitPath}`, { cwd: PROJECT_ROOT, encoding: 'utf-8' })
    gitTracked = result.trim() !== ''
  } catch {
    gitTracked = false
  }

  let size = 0
  if (exists) {
    size = statSync(fullPath).size
  }

  return { exists, exactCase, gitTracked, size }
}

function main() {
  console.log('🔍 Verifying all Home page image references...\n')

  const dataFiles = walkDir(join(SRC_DIR, 'data'), ['.ts'])
  const componentFiles = walkDir(join(SRC_DIR, 'components'), ['.tsx'])
  const appFiles = walkDir(SRC_DIR, ['.tsx']).filter(f => f.endsWith('App.tsx'))
  const allFiles = [...dataFiles, ...componentFiles, ...appFiles]

  const allPaths = new Set<string>()
  for (const file of allFiles) {
    const paths = extractImagePathsFromFile(file)
    for (const p of paths) {
      allPaths.add(p)
    }
  }

  const sortedPaths = [...allPaths].sort()
  console.log(`Found ${sortedPaths.length} unique image references:\n`)

  const missing: string[] = []
  const caseMismatch: string[] = []
  const notTracked: string[] = []

  console.log('| Path | Exists | Exact Case | Git Tracked | Size |')
  console.log('|------|--------|------------|-------------|------|')

  for (const path of sortedPaths) {
    const result = checkImageExists(path)
    const existsStr = result.exists ? '✅' : '❌'
    const caseStr = result.exactCase ? '✅' : '❌'
    const gitStr = result.gitTracked ? '✅' : '❌'
    const sizeStr = result.size > 0 ? `${(result.size / 1024).toFixed(1)} KB` : 'N/A'

    console.log(`| ${path} | ${existsStr} | ${caseStr} | ${gitStr} | ${sizeStr} |`)

    if (!result.exists) missing.push(path)
    if (!result.exactCase) caseMismatch.push(path)
    if (!result.gitTracked) notTracked.push(path)
  }

  console.log('\n📊 Summary:')
  console.log(`  Total checked: ${sortedPaths.length}`)
  console.log(`  Missing: ${missing.length}`)
  console.log(`  Case mismatch: ${caseMismatch.length}`)
  console.log(`  Not git tracked: ${notTracked.length}`)

  if (missing.length > 0) {
    console.log('\n❌ MISSING FILES:')
    for (const m of missing) console.log(`  - ${m}`)
    process.exit(1)
  }

  if (caseMismatch.length > 0) {
    console.log('\n⚠️  CASE MISMATCH (file exists but case differs):')
    for (const m of caseMismatch) console.log(`  - ${m}`)
  }

  console.log('\n✅ All referenced images exist!')
}

main()