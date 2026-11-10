<template>
  <el-card class="client-resources" shadow="never" v-loading="loading">
    <template #header>
      <div class="resource-heading">
        <div><h2 class="section-title">{{ T('ClientResources') }}</h2><p>{{ T('ClientResourcesIntro') }}</p></div>
        <div class="resource-tools">
          <el-button v-if="isAdmin" text @click="router.push('/clientResources')">{{ T('ManageClientResources') }}</el-button>
          <el-button text :disabled="loading" @click="load">{{ T('Refresh') }}</el-button>
        </div>
      </div>
    </template>
    <el-alert v-if="failed" :title="T('ClientResourcesLoadFailed')" type="error" :closable="false" />
    <template v-else>
      <h3>{{ T("SetupDownload") }}</h3>
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
          <div><h3>{{ T('SetupImport') }}</h3><p>{{ T('QuickServerImportHelp') }}</p></div>
          <el-button type="primary" :disabled="!resources.import_code || loading" @click="copyCode">{{ T('CopyServerImportCode') }}</el-button>
        </div>
        <el-input v-if="resources.import_code" :model-value="resources.import_code" type="textarea" :rows="3" readonly :aria-label="T('ServerImportCode')" class="import-code" />
        <p v-else class="empty-downloads">{{ T('ImportCodeNotConfigured') }}</p>
      </div>
      <ConnectionGuide />
    </template>
  </el-card>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import ConnectionGuide from './connectionGuide.vue'
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
.client-resources { margin-top: var(--app-space-4); }
.resource-heading { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
h2, h3, p { margin: 0; }

h3 { font-size: var(--app-text-base); line-height: 22px; font-weight: 600; }
.client-resources > :deep(.el-card__body) > h3 { margin-bottom: var(--app-space-3); }
p { margin-top: var(--app-space-1); color: var(--app-text-muted); font-size: var(--app-text-sm); line-height: 1.6; }
.resource-tools { display: flex; gap: 4px; }
.resource-tools .el-button { margin-left: 0; }
.download-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr)); gap: 12px; }
.download-item { padding: var(--app-space-4); border: 1px solid var(--app-border); border-radius: var(--app-radius); background: var(--app-surface); display: flex; align-items: center; justify-content: space-between; gap: 12px; min-width: 0; }
.download-item h3 { overflow-wrap: anywhere; }
.download-item h3 span { font-weight: 400; font-size: 12px; color: var(--el-text-color-secondary); }
.download-link { color: var(--app-text); font-weight: 500; text-decoration: none; font-size: var(--app-text-sm); white-space: nowrap; padding: 8px 0; }
.download-link:hover { text-decoration: underline; }
.download-link:focus-visible { outline: 2px solid var(--el-color-primary); outline-offset: 4px; border-radius: 4px; }
.unavailable { font-size: 12px; color: var(--el-text-color-placeholder); white-space: nowrap; }
.import-section { margin-top: var(--app-space-6); padding-top: var(--app-space-6); border-top: 1px solid var(--app-border); }
.import-code { margin-top: var(--app-space-3); }
.import-code :deep(textarea) { font-family: ui-monospace, Consolas, monospace; font-size: 12px; line-height: 1.7; word-break: break-all; }
.empty-downloads { margin-top: 12px; }
</style>
