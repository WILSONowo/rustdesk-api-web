// Browser password storage is optional and must never affect authentication.
// Only an authenticated API result may trigger a save request.
export function offerAuthenticatedPassword(result, submitted, browser = globalThis) {
  if (!result?.token || !submitted?.username || !submitted?.password) return
  if (!browser.isSecureContext || !browser.PasswordCredential || !browser.navigator?.credentials?.store) return
  try {
    const credential = new browser.PasswordCredential({ id: submitted.username, password: submitted.password })
    // Do not hold navigation hostage to a browser prompt or an extension.
    Promise.resolve(browser.navigator.credentials.store(credential)).catch(() => {})
  } catch { /* Unsupported or disabled by browser policy. Keep sign-in working. */ }
}
