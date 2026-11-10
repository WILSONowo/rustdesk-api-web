<template>
  <div class="overview">
    <section class="overview-welcome">
      <div>
        <h2>{{ T('WelcomeBack', { name: userStore.nickname || userStore.username }) }}</h2>
        <p>{{ T('OverviewIntro') }}</p>
      </div>
      <el-button :icon="Setting" @click="openAccountSettings">{{ T('AccountSettings') }}</el-button>
    </section>

    <div class="overview-stats">
      <article v-for="stat in stats" :key="stat.key" class="stat-card">
        <span class="stat-label">{{ T(stat.label) }}</span>
        <strong class="stat-value">{{ stat.value }}</strong>
        <span v-if="stat.hint" class="stat-hint">{{ T(stat.hint) }}</span>
      </article>
    </div>

    <div class="overview-actions">
      <button v-for="action in actions" :key="action.key" type="button" class="action-tile" @click="action.run">
        <el-icon :size="20"><component :is="action.icon" /></el-icon>
        <span>
          <strong>{{ T(action.title) }}</strong>
          <small>{{ T(action.desc) }}</small>
        </span>
      </button>
    </div>

    <el-card v-if="html" shadow="hover" class="overview-notice">
      <div class="markdown" v-html="html"></div>
    </el-card>

    <div ref="devicesSection"><device-overview /></div>
    <div ref="resourcesSection"><client-resources /></div>
  </div>
</template>

<script setup>
  import ClientResources from '@/components/clientResources.vue'
  import DeviceOverview from '@/components/deviceOverview.vue'
  import { computed, onMounted, reactive, ref } from 'vue'
  import { useUserStore } from '@/store/user'
  import { useAppStore } from '@/store/app'
  import { list as myPeerList } from '@/api/my/peer'
  import { getDeviceOverview } from '@/api/connection'
  import { openAccountSettings } from '@/utils/accountDrawer'
  import { T } from '@/utils/i18n'
  import { marked } from 'marked'
  import { Download, Monitor, Setting } from '@element-plus/icons-vue'

  const appStore = useAppStore()
  const userStore = useUserStore()
  const devicesSection = ref(null)
  const resourcesSection = ref(null)

  const counts = reactive({ mine: null, online: null, shared: null })
  const telemetry = computed(() => appStore.setting.appConfig?.device_telemetry !== false)
  const show = (v) => (v === null ? '—' : v)
  const stats = computed(() => [
    { key: 'mine', label: 'MyDevicesCount', value: show(counts.mine) },
    telemetry.value
      ? { key: 'online', label: 'OnlineNow', value: show(counts.online), hint: 'OnlineNowHint' }
      : { key: 'online', label: 'OnlineNow', value: '—', hint: 'TelemetryUnavailable' },
    { key: 'shared', label: 'SharedWithMe', value: show(counts.shared) },
  ])

  async function loadCounts () {
    const total = (res) => (res.status === 'fulfilled' ? res.value?.data?.total ?? null : null)
    const [mine, online, shared] = await Promise.allSettled([
      myPeerList({ page: 1, page_size: 1 }),
      telemetry.value ? myPeerList({ page: 1, page_size: 1, time_ago: -60 }) : Promise.reject(new Error('telemetry off')),
      getDeviceOverview({ scope: 'shared', page: 1 }),
    ])
    counts.mine = total(mine)
    counts.online = total(online)
    counts.shared = total(shared)
  }
  onMounted(loadCounts)

  const scrollTo = (el) => el.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  const actions = [
    { key: 'connect', icon: Monitor, title: 'ConnectDevice', desc: 'ConnectDeviceHelp', run: () => scrollTo(devicesSection) },
    { key: 'download', icon: Download, title: 'GetClient', desc: 'DownloadClientHelp', run: () => scrollTo(resourcesSection) },
    { key: 'account', icon: Setting, title: 'AccountSettings', desc: 'AccountSettingsHelp', run: openAccountSettings },
  ]

  const html = computed(_ => marked(appStore.setting.hello || ''))
</script>

<style scoped lang="scss">
.overview-welcome {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 20px;
  h2 { margin: 0; font-size: 20px; font-weight: 600; }
  p { margin: 6px 0 0; font-size: 14px; color: var(--el-text-color-secondary); }
}
.overview-stats, .overview-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr));
  gap: 16px;
  margin-bottom: 20px;
}
.stat-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 20px;
  border-radius: var(--account-card-radius);
  border: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color-overlay);
  box-shadow: var(--account-card-shadow);
}
.stat-label { font-size: 13px; color: var(--el-text-color-secondary); }
.stat-value { font-size: 28px; line-height: 1.2; font-weight: 600; font-variant-numeric: tabular-nums; }
.stat-hint { font-size: 12px; color: var(--el-text-color-placeholder); }
.action-tile {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  text-align: left;
  font: inherit;
  color: var(--el-text-color-primary);
  cursor: pointer;
  border-radius: 12px;
  border: 1px solid var(--el-border-color-lighter);
  background: var(--el-fill-color-extra-light);
  transition: border-color .15s, background-color .15s;
  .el-icon { color: var(--el-color-primary); margin-top: 2px; }
  strong { display: block; font-size: 14px; font-weight: 600; }
  small { display: block; margin-top: 4px; font-size: 12px; line-height: 1.5; color: var(--el-text-color-secondary); }
  &:hover { border-color: var(--el-color-primary-light-5); background: var(--el-color-primary-light-9); }
  &:focus-visible { outline: 2px solid var(--el-color-primary); outline-offset: 2px; }
}
.overview-notice { margin-bottom: 20px; }
.markdown :deep(> :first-child) { margin-top: 0; }
.markdown :deep(> :last-child) { margin-bottom: 0; }
</style>
