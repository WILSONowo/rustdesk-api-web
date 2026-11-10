<template>
  <span class="online-status">
    <template v-if="!telemetry">{{ T('TelemetryUnavailable') }}</template>
    <template v-else-if="!time">{{ T('StatusUnknown') }}</template>
    <template v-else>
      <el-tag :type="online ? 'success' : 'info'" size="small" disable-transitions>{{ T(online ? 'Online' : 'Offline') }}</el-tag>
      <span class="online-status__time">{{ timeAgo(time * 1000) }}</span>
    </template>
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { T } from '@/utils/i18n'
import { timeAgo } from '@/utils/time'

const props = defineProps({
  // Last report time in Unix seconds.
  time: { type: Number, default: 0 },
  // False when the server does not collect device heartbeats.
  telemetry: { type: Boolean, default: true },
})
// A device that reported within the last minute is treated as online.
const ONLINE_WINDOW_SECONDS = 60
const online = computed(() => Date.now() / 1000 - props.time < ONLINE_WINDOW_SECONDS)
</script>

<style scoped>
.online-status { display: inline-flex; align-items: center; gap: 8px; white-space: nowrap; }
.online-status__time { color: var(--el-text-color-secondary); font-size: 12px; }
</style>
