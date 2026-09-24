<template>
  <el-card class="client-resources" shadow="never" v-loading="loading">
    <template #header>
      <div class="resource-heading">
        <div><h2>{{ T('ClientResources') }}</h2><p>{{ T('ClientResourcesIntro') }}</p></div>
        <div class="resource-tools">
          <el-button v-if="isAdmin" text @click="router.push('/clientResources')">{{ T('ManageClientResources') }}</el-button>
          <el-button text :disabled="loading" @click="load">{{ T('Refresh') }}</el-button>
        </div>
      </div>
    </template>
    <el-alert v-if="failed" :title="T('ClientResourcesLoadFailed')" type="error" :closable="false" />
    <template v-else>
      <div class="download-grid">
        <article v-for="(item, index) in downloads" :key="index" class="download-item">
          <div><h3>{{ item.platform }} <span>{{ item.arch }}</span></h3><p>{{ item.version || T('ClientVersionUnspecified') }}</p></div>
          <a v-if="item.url" :href="item.url" target="_blank" rel="noopener noreferrer" class="download-link" :aria-label="`${T('DownloadClient')} ${item.platform} ${item.arch}`">{{ T('DownloadClient') }} <span aria-hidden="true">↗</span></a>
          <span v-else class="unavailable">{{ T('DownloadUnavailable') }}</span>
        </article>
      </div>
      <p v-if="!loading && !downloads.length" class="empty-downloads">{{ T('DownloadsNotConfigured') }}</p>
      <div class="import-section">
        <div class="resource-heading">
          <div><h3>{{ T('QuickServerImport') }}</h3><p>{{ T('QuickServerImportHelp') }}</p></div>
          <el-button type="primary" :disabled="!resources.import_code || loading" @click="copyCode">{{ T('CopyServerImportCode') }}</el-button>
        </div>
        <el-input v-if="resources.import_code" :model-value="resources.import_code" type="textarea" :rows="3" readonly :aria-label="T('ServerImportCode')" class="import-code" />
        <p v-else class="empty-downloads">{{ T('ImportCodeNotConfigured') }}</p>
      </div>
    </template>
  </el-card>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'
import { getClientResources } from '@/api/clientResources'
import { copyText } from '@/utils/clipboard'
import { T } from '@/utils/i18n'

const router = useRouter()
const user = useUserStore()
const isAdmin = computed(() => user.route_names.includes('*'))
const resources = ref({ downloads: [], import_code: '' })
const downloads = computed(() => resources.value.downloads.filter(item => item.enabled))
const loading = ref(false), failed = ref(false)
async function load() {
  if (loading.value) return
  loading.value = true
  failed.value = false
  try { resources.value = (await getClientResources()).data }
  catch { failed.value = true }
  finally { loading.value = false }
}
async function copyCode() {
  if (!resources.value.import_code) return
  try { await copyText(resources.value.import_code); ElMessage.success(T('CopySuccess')) }
  catch { ElMessage.error(T('CopyFailed')) }
}
onMounted(load)
</script>

<style scoped lang="scss">
.client-resources { margin-top: 20px; }
.resource-heading { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
h2, h3, p { margin: 0; }
h2 { font-size: 18px; font-weight: 600; }
h3 { font-size: 15px; font-weight: 600; }
p { margin-top: 8px; color: var(--el-text-color-secondary); font-size: 13px; line-height: 1.7; }
.resource-tools { display: flex; gap: 4px; }
.resource-tools .el-button { margin-left: 0; }
.download-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr)); gap: 12px; }
.download-item { padding: 18px; border: 1px solid var(--el-border-color-lighter); border-radius: 12px; background: var(--el-fill-color-extra-light); display: flex; align-items: center; justify-content: space-between; gap: 12px; min-width: 0; }
.download-item h3 { overflow-wrap: anywhere; }
.download-item h3 span { font-weight: 400; font-size: 12px; color: var(--el-text-color-secondary); }
.download-link { color: var(--el-color-primary); text-decoration: none; font-size: 13px; white-space: nowrap; padding: 8px 0; }
.download-link:hover { text-decoration: underline; }
.download-link:focus-visible { outline: 2px solid var(--el-color-primary); outline-offset: 4px; border-radius: 4px; }
.unavailable { font-size: 12px; color: var(--el-text-color-placeholder); white-space: nowrap; }
.import-section { margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--el-border-color-lighter); }
.import-code { margin-top: 16px; }
.import-code :deep(textarea) { font-family: ui-monospace, Consolas, monospace; font-size: 12px; line-height: 1.7; word-break: break-all; }
.empty-downloads { margin-top: 12px; }
</style>
