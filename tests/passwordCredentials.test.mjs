import test from 'node:test'
import assert from 'node:assert/strict'
import { offerAuthenticatedPassword } from '../src/utils/passwordCredentials.mjs'

const fixture = () => {
  const saved = []
  return {
    saved,
    browser: {
      isSecureContext: true,
      PasswordCredential: class { constructor(data) { Object.assign(this, data) } },
      navigator: { credentials: { store: credential => { saved.push(credential); return Promise.resolve() } } },
    },
  }
}
const submitted = { username: 'local-test', password: 'test-password' }

test('typing, rejected credentials and pending approval never offer password storage', () => {
  const { saved, browser } = fixture()
  for (const result of [undefined, null, {}, { code: 101 }, { status: 3 }, { token: '' }]) {
    offerAuthenticatedPassword(result, submitted, browser)
  }
  assert.equal(saved.length, 0)
})

test('successful authentication offers exactly the submitted credentials', () => {
  const { saved, browser } = fixture()
  offerAuthenticatedPassword({ token: 'authenticated-token' }, submitted, browser)
  assert.equal(saved.length, 1)
  assert.deepEqual({ ...saved[0] }, { id: submitted.username, password: submitted.password })
})

test('missing credentials and unsupported or insecure browsers do not store', () => {
  const { saved, browser } = fixture()
  offerAuthenticatedPassword({ token: 'ok' }, { username: 'x', password: '' }, browser)
  offerAuthenticatedPassword({ token: 'ok' }, submitted, { ...browser, isSecureContext: false })
  offerAuthenticatedPassword({ token: 'ok' }, submitted, {})
  assert.equal(saved.length, 0)
})

test('browser rejection or synchronous failure cannot break login', async () => {
  const { browser } = fixture()
  browser.navigator.credentials.store = () => Promise.reject(new Error('disabled'))
  assert.doesNotThrow(() => offerAuthenticatedPassword({ token: 'ok' }, submitted, browser))
  await new Promise(resolve => setImmediate(resolve))
  browser.navigator.credentials.store = () => { throw new Error('unsupported') }
  assert.doesNotThrow(() => offerAuthenticatedPassword({ token: 'ok' }, submitted, browser))
})
