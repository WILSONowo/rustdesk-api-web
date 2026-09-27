<template>
  <div v-loading="loading" class="resources-editor">
    <el-alert v-if="failed" :title="T('ClientResourcesLoadFailed')" type="error" :closable="false"><el-button text @click="load">{{ T('Refresh') }}</el-button></el-alert>
    <el-form v-else ref="formRef" :model="form" label-position="top" :disabled="saving || !ready" @submit.prevent="save">
      <el-card shadow="never">
        <template #header><div class="section-heading"><div><h2>{{ T('ClientDownloads') }}</h2><p>{{ T('DownloadSettingsHelp') }}</p></div><el-button :disabled="form.downloads.length >= 24" @click="addDownload">{{ T('AddDownload') }}</el-button></div></template>
        <el-empty v-if="!form.downloads.length" :description="T('DownloadsNotConfigured')" :image-size="60" />
        <section v-for="(item, index) in form.downloads" :key="item._key" class="download-editor">
          <div class="download-fields">
            <el-form-item :label="T('ClientPlatform')"><el-select v-model="item.platform"><el-option v-for="platform in platforms" :key="platform" :value="platform" :label="platform" /></el-select></el-form-item>
            <el-form-item :label="T('ClientArchitecture')"><el-input v-model="item.arch" maxlength="64" placeholder="x64 / ARM64" /></el-form-item>
            <el-form-item :label="T('ClientVersion')"><el-input v-model="item.version" maxlength="64" :placeholder="T('Optional')" /></el-form-item>
            <el-form-item :label="T('ClientDownloadVisible')"><el-switch v-model="item.enabled" :aria-label="`${item.platform} ${T('ClientDownloadVisible')}`" /></el-form-item>
          </div>
          <div class="download-url-row">
            <el-form-item :label="T('DownloadURL')" :prop="`downloads.${index}.url`" :rules="[{ validator: validateURL, trigger: 'blur' }]"><el-input v-model="item.url" maxlength="2048" placeholder="https://… /downloads/…" /></el-form-item>
            <el-button type="danger" plain @click="form.downloads.splice(index, 1)">{{ T('RemoveDownload') }}</el-button>
          </div>
        </section>
      </el-card>
      <el-card shadow="never" class="config-card">
        <template #header><h2>{{ T('QuickServerImport') }}</h2></template>
        <p class="config-help">{{ T('ImportCodeSettingsHelp') }}</p>
        <el-form-item :label="T('ServerImportCode')"><el-input v-model="form.import_code" type="textarea" :rows="5" maxlength="16384" show-word-limit :placeholder="T('ImportCodePlaceholder')" /></el-form-item>
      </el-card>
      <div class="save-bar"><span>{{ dirty ? T('UnsavedClientResources') : T('ClientResourcesSavedHint') }}</span><el-button native-type="submit" type="primary" :loading="saving" :disabled="!ready || !dirty">{{ T('SaveClientResources') }}</el-button><el-button @click="router.push('/')">{{ T('ViewUserinfo') }}</el-button></div>
    </el-form>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { onBeforeRouteLeave, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getClientResources, saveClientResources } from '@/api/clientResources'
import { T } from '@/utils/i18n'

const platforms = ['Windows', 'macOS', 'Linux', 'Android']
const router = useRouter(), formRef = ref(null)
const form = reactive({ downloads: [], import_code: '' })
const loading = ref(false), saving = ref(false), failed = ref(false), ready = ref(false)
const original = ref('')
let key = 0
const payload = () => ({ downloads: form.downloads.map(({ _key, ...item }) => item), import_code: form.import_code })
const dirty = computed(() => ready.value && JSON.stringify(payload()) !== original.value)
function assign(data) {
  form.downloads = data.downloads.map(item => ({ ...item, _key: ++key }))
  form.import_code = data.import_code
  original.value = JSON.stringify(payload())
}
async function load() {
  loading.value = true
  failed.value = false
  try { assign((await getClientResources()).data); ready.value = true }
  catch { failed.value = true }
  finally { loading.value = false }
}
function addDownload() { form.downloads.push({ _key: ++key, platform: 'Windows', arch: '', version: '', url: '', enabled: true }) }
function validateURL(_rule, value, callback) {
  const raw = value.trim()
  if (!raw) return callback()
  let valid = false
  try {
    const url = new URL(raw, window.location.origin)
    const path = decodeURIComponent(url.pathname)
    valid = !/[\s\\]/.test(raw) && !url.username && !url.password && ['http:', 'https:'].includes(url.protocol)
      && (/^https?:\/\//.test(raw) || (raw.startsWith('/') && !raw.startsWith('//') && !path.startsWith('//') && !path.includes('\\')))
  } catch { valid = false }
  callback(valid ? undefined : new Error(T('DownloadURLInvalid')))
}
async function save() {
  if (saving.value || !ready.value || !await formRef.value.validate().catch(() => false)) return
  saving.value = true
  try { assign((await saveClientResources(payload())).data); ElMessage.success(T('ClientResourcesSaved')) }
  catch { /* Request helper displays the error; keep the draft for retry. */ }
  finally { saving.value = false }
}
onBeforeRouteLeave(async () => {
  if (saving.value) return false
  if (!dirty.value) return true
  return await ElMessageBox.confirm(T('DiscardClientResources'), T('UnsavedClientResources'), { confirmButtonText: T('DiscardChanges'), cancelButtonText: T('KeepEditing'), closeOnClickModal: false, type: 'warning' }).then(() => true).catch(() => false)
})
onMounted(load)
</script>

<style scoped lang="scss">
h2, p { margin: 0; }
h2 { font-size: 18px; font-weight: 600; }
p, .save-bar span { color: var(--el-text-color-secondary); font-size: 13px; line-height: 1.7; }
.section-heading { display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; }
.section-heading p { margin-top: 8px; max-width: 680px; }
.download-editor { padding: 20px; margin-bottom: 16px; border: 1px solid var(--el-border-color-lighter); border-radius: 12px; background: var(--el-fill-color-extra-light); }
.download-editor:last-child { margin-bottom: 0; }
.download-fields { display: grid; grid-template-columns: 1fr 1fr 1fr 100px; gap: 16px; }
.download-fields :deep(.el-select) { width: 100%; }
.download-url-row { display: flex; align-items: center; gap: 16px; }
.download-url-row .el-form-item { flex: 1; min-width: 0; margin-bottom: 6px; }
.download-url-row > .el-button { margin-top: 24px; }
.config-card { margin-top: 20px; }
.config-help { margin-bottom: 20px; }
.save-bar { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; margin-top: 24px; }
.save-bar span { margin-right: auto; }
.save-bar .el-button { margin-left: 0; }
@media (max-width: 1000px) { .download-fields { grid-template-columns: 1fr 1fr; } }
@media (max-width: 600px) { .download-fields { grid-template-columns: 1fr; gap: 0; } .download-url-row { flex-wrap: wrap; } .download-url-row .el-form-item { flex-basis: 100%; } .download-url-row > .el-button { margin-top: 0; } }
</style>
