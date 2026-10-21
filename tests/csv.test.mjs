import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
const source = await readFile(new URL('../src/utils/file.js', import.meta.url), 'utf8')
const { jsonToCsv } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)
test('CSV export neutralizes formulas in cells and headers', async () => {
  const csv = await jsonToCsv([{ '=header': '=1+1', normal: ' \t@SUM(1)', quoted: '"hello",世界', missing: null }]).text()
  assert.equal(csv, '"\'=header","normal","quoted","missing"\r\n"\'=1+1","\' \t@SUM(1)","""hello"",世界",""')
})
test('empty export is valid and null values do not crash export', async () => {
  assert.equal(await jsonToCsv([]).text(), '')
  assert.equal(await jsonToCsv([{ value: null }, { value: undefined }]).text(), '"value"\r\n""\r\n""')
})
