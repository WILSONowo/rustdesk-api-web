<template>
  <el-card class="device-overview" shadow="never">
    <template #header><h2>{{ T('DeviceOverview') }}</h2></template>
    <el-radio-group v-model="scope" @change="reset"><el-radio-button value="mine">{{ T('MyPeer') }}</el-radio-button><el-radio-button value="shared">{{ T('SharedWithMe') }}</el-radio-button></el-radio-group>
    <form class="device-search" @submit.prevent="reset"><el-input v-model="search" maxlength="100" :placeholder="T('SearchDevices')" :aria-label="T('SearchDevices')" clearable /><el-button native-type="submit" :loading="loading">{{ T('Filter') }}</el-button></form>
    <el-alert v-if="failed" :title="T('DeviceLoadFailed')" type="error" :closable="false" />
    <template v-else>
      <p>{{ T(telemetry ? 'DeviceStateBoundary' : 'TelemetryUnavailable') }}</p>
      <el-table :data="devices" v-loading="loading" :empty-text="T('NoAccessibleDevices')">
        <el-table-column prop="name" :label="T('Hostname')" min-width="150" />
        <el-table-column prop="id" label="ID" min-width="130" />
        <el-table-column prop="owner" :label="T('DeviceOwner')" min-width="120" />
        <el-table-column prop="collection" :label="T('AddressBookName')" min-width="130" />
        <el-table-column :label="T('LastOnlineTime')" min-width="170"><template #default="{row}">{{ telemetry && row.last_seen > 0 ? new Date(row.last_seen * 1000).toLocaleString() : T('StatusUnknown') }}</template></el-table-column>
        <el-table-column :label="T('Actions')" width="120"><template #default="{row}"><el-button :disabled="loading" @click="connectByClient(row.id)">{{ T('Link') }}</el-button></template></el-table-column>
      </el-table>
      <el-pagination v-model:current-page="page" :page-size="20" :total="total" layout="prev, pager, next" @current-change="load" />
    </template>
    <p>{{ T('ShareRevocationBoundary') }}</p>
  </el-card>
</template>
<script setup>
import { onMounted, ref } from 'vue'
import { T } from '@/utils/i18n'
import { getDeviceOverview } from '@/api/connection'
import { connectByClient } from '@/utils/peer'
const scope = ref('mine'), search = ref(''), page = ref(1), total = ref(0), devices = ref([]), telemetry = ref(false), loading = ref(false), failed = ref(false)
let requestNumber = 0
async function load() {
  const current = ++requestNumber
  loading.value = true
  devices.value = []
  failed.value = false
  try {
    const { data } = await getDeviceOverview({ scope: scope.value, search: search.value, page: page.value })
    if (current !== requestNumber) return
    devices.value = data.list
    total.value = data.total
    telemetry.value = data.device_telemetry === true
  } catch { if (current === requestNumber) { failed.value = true; total.value = 0 } }
  finally { if (current === requestNumber) loading.value = false }
}
function reset() { page.value = 1; load() }
onMounted(load)
</script>
<style scoped>
.device-overview { margin-top: 20px; }
h2 { font-size: 18px; margin: 0; }
p { color: var(--el-text-color-secondary); font-size: 13px; line-height: 1.8; }
.device-search { display: flex; gap: 12px; margin-top: 16px; max-width: 540px; }
.el-pagination { margin-top: 16px; }
</style>
