import fs from 'fs'
import path from 'path'

// Vercel picks the newest major matching engines.node, so it must be pinned
// to the same major as .nvmrc and CI — not an open range like ">=22".
describe('Node version pin', () => {
  const root = path.resolve(__dirname, '..')
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))
  const nvmrc = fs.readFileSync(path.join(root, '.nvmrc'), 'utf8').trim()

  it('pins engines.node to a single supported major matching .nvmrc', () => {
    const match = /^(\d+)\.x$/.exec(pkg.engines?.node ?? '')
    expect(match, 'engines.node must look like "22.x"').not.toBeNull()
    expect(Number(match[1])).toBeGreaterThanOrEqual(22)
    expect(Number.parseInt(nvmrc.replace(/^v/, ''), 10)).toBe(Number(match[1]))
  })
})
