<template>
  <el-card class="device-overview" shadow="never">
    <template #header>
      <div class="overview-heading">
        <h2 class="section-title">{{ T('DeviceOverview') }}</h2>
        <el-popover placement="bottom-end" :width="340" trigger="click">
          <template #reference>
            <el-button link :icon="QuestionFilled" :aria-label="T('AboutDeviceStatus')">{{ T('AboutDeviceStatus') }}</el-button>
          </template>
          <p class="help-text">{{ T('DeviceStateBoundary') }}</p>
          <p class="help-text">{{ T('ShareRevocationBoundary') }}</p>
        </el-popover>
      </div>
    </template>
    <el-radio-group v-model="scope" @change="reset"><el-radio-button value="mine">{{ T('MyPeer') }}</el-radio-button><el-radio-button value="shared">{{ T('SharedWithMe') }}</el-radio-button></el-radio-group>
    <form class="device-search" @submit.prevent="reset"><el-input v-model="search" maxlength="100" :placeholder="T('SearchDevices')" :aria-label="T('SearchDevices')" clearable /><el-button native-type="submit" :loading="loading">{{ T('Filter') }}</el-button></form>
    <el-alert v-if="failed" :title="T('DeviceLoadFailed')" type="error" :closable="false" />
    <template v-else>
      <p v-if="!telemetry && !loading">{{ T('TelemetryUnavailable') }}</p>
      <el-table :data="devices" v-loading="loading" :empty-text="T('NoAccessibleDevices')">
        <el-table-column prop="name" :label="T('Hostname')" min-width="150" />
        <el-table-column prop="id" label="ID" min-width="130" />
        <el-table-column prop="owner" :label="T('DeviceOwner')" min-width="120" />
        <el-table-column prop="collection" :label="T('AddressBookName')" min-width="130" />
        <el-table-column :label="T('LastOnlineTime')" min-width="170"><template #default="{row}"><online-status :time="row.last_seen > 0 ? row.last_seen : 0" :telemetry="telemetry" /></template></el-table-column>
        <el-table-column :label="T('Actions')" width="120"><template #default="{row}"><el-button size="small" :disabled="loading" @click="connectByClient(row.id)">{{ T('Link') }}</el-button></template></el-table-column>
      </el-table>
      <el-pagination v-model:current-page="page" :page-size="20" :total="total" layout="prev, pager, next" @current-change="load" />
    </template>
  </el-card>
</template>
<script setup>
import { onMounted, ref } from 'vue'
import { T } from '@/utils/i18n'
import { getDeviceOverview } from '@/api/connection'
import { connectByClient } from '@/utils/peer'
import { QuestionFilled } from '@element-plus/icons-vue'
import OnlineStatus from '@/components/onlineStatus.vue'
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
.device-overview { margin: 0; }
.overview-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.help-text { margin: 0 0 var(--app-space-2); font-size: var(--app-text-sm); line-height: 1.7; color: var(--app-text-secondary); }
.help-text:last-child { margin-bottom: 0; }
p { margin: var(--app-space-3) 0 0; color: var(--app-text-muted); font-size: var(--app-text-sm); line-height: 1.7; }
.device-search { display: flex; gap: var(--app-space-2); margin: var(--app-space-4) 0; max-width: 480px; }
.device-search .el-button { margin: 0; }
.el-pagination { margin-top: var(--app-space-4); justify-content: flex-end; }
.help-text { margin-top: 0; }
</style>
