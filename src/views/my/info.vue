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
// Every block on the overview is separated by the same 16px gap.
.overview { display: flex; flex-direction: column; gap: var(--app-space-4); }
.overview :deep(.device-overview), .overview :deep(.client-resources) { margin: 0; }
.overview-welcome {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--app-space-4);
  h2 { margin: 0; font-size: 16px; line-height: 24px; font-weight: 600; color: var(--app-text); }
  p { margin: 2px 0 0; font-size: var(--app-text-sm); line-height: 20px; color: var(--app-text-muted); }
}
.overview-stats, .overview-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr));
  gap: var(--app-space-4);
}
.stat-card {
  display: flex;
  flex-direction: column;
  gap: var(--app-space-1);
  padding: var(--app-space-4) var(--app-space-5);
  border-radius: var(--app-radius);
  border: 1px solid var(--app-border);
  background: var(--app-surface);
  box-shadow: var(--app-shadow-sm);
}
.stat-label { font-size: var(--app-text-sm); line-height: 20px; color: var(--app-text-muted); }
.stat-value { font-size: 24px; line-height: 32px; font-weight: 600; letter-spacing: -.3px; color: var(--app-text); font-variant-numeric: tabular-nums; }
.stat-hint { font-size: var(--app-text-xs); line-height: 18px; color: var(--app-text-placeholder); }
.action-tile {
  display: flex;
  align-items: flex-start;
  gap: var(--app-space-3);
  padding: var(--app-space-4);
  text-align: left;
  font: inherit;
  color: var(--app-text);
  cursor: pointer;
  border-radius: var(--app-radius);
  border: 1px solid var(--app-border);
  background: var(--app-surface);
  box-shadow: var(--app-shadow-sm);
  transition: border-color .15s, background-color .15s;
  .el-icon { flex: none; color: var(--app-text-secondary); margin-top: 1px; }
  strong { display: block; font-size: var(--app-text-base); line-height: 20px; font-weight: 600; }
  small { display: block; margin-top: 2px; font-size: var(--app-text-xs); line-height: 18px; color: var(--app-text-muted); }
  &:hover { border-color: var(--app-border-strong); background: var(--app-surface-hover); }
  &:focus-visible { outline: 2px solid var(--app-accent); outline-offset: 2px; }
}
.markdown { font-size: var(--app-text-sm); line-height: 1.7; color: var(--app-text-secondary); }
.markdown :deep(h1), .markdown :deep(h2), .markdown :deep(h3) { font-size: var(--app-text-lg); line-height: 22px; margin: 0 0 var(--app-space-2); color: var(--app-text); }
.markdown :deep(p) { margin: 0 0 var(--app-space-2); }
.markdown :deep(> :first-child) { margin-top: 0; }
.markdown :deep(> :last-child) { margin-bottom: 0; }
</style>
