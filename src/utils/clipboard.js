import Clipboard from 'clipboard'
import { ElMessage } from 'element-plus'
import { T } from '@/utils/i18n'

export async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    try { await navigator.clipboard.writeText(text); return } catch { /* Fall back for browser restrictions. */ }
  }
  const previous = document.activeElement
  const input = document.createElement('textarea')
  input.value = text
  input.setAttribute('readonly', '')
  input.style.cssText = 'position:fixed;left:-9999px;top:0;'
  document.body.appendChild(input)
  try {
    input.select()
    if (!document.execCommand('copy')) throw new Error('Clipboard unavailable')
  } finally { input.remove(); previous?.focus?.() }
}

export function handleClipboard (text, event) {
  const clipboard = new Clipboard(event.target.toString(), {
    text: () => text,
  })
  clipboard.on('success', () => {
    ElMessage.success(T('CopySuccess'))
    clipboard.destroy()
  })
  clipboard.on('error', () => {
    ElMessage.error(T('CopyFailed'))
    clipboard.destroy()
  })
  clipboard.onClick(event)
}

export function copyImage (targetNode) {
  if (window.getSelection) {
    // chrome等主流浏览器
    var selection = window.getSelection()
    selection.removeAllRanges()
    var range = document.createRange()
    range.selectNode(targetNode)
    selection.addRange(range)
  } else if (document.body.createTextRange) {
    console.log('IE')
    // ie
    const range = document.body.createTextRange()
    range.moveToElementText(targetNode)
    range.select()
  }
  document.execCommand('copy')
}
