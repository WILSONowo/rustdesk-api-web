<template>
  <div>
    <el-card class="list-query" shadow="hover">
      <el-form inline @submit.prevent="handlerQuery">
        <el-form-item label="ID">
          <el-input v-model="listQuery.id" clearable/>
        </el-form-item>
        <el-form-item :label="T('Hostname')">
          <el-input v-model="listQuery.hostname" clearable/>
        </el-form-item>
        <el-form-item :label="T('LastOnlineTime')">
          <el-select v-model="listQuery.time_ago" clearable>
            <el-option
                v-for="item in timeFilters"
                :key="item.value"
                :label="item.text"
                :value="item.value"
                :disabled="item.value === 0"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item class="query-submit">
          <el-button type="primary" native-type="submit" :icon="Search">{{ T('Filter') }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card class="list-body" shadow="hover">
      <list-toolbar :selected="multipleSelection.length">
        <el-button :icon="Download" @click="toExport">{{ T('Export') }}</el-button>
        <template #selection>
          <el-button @click="toBatchAddToAB">{{ T('BatchAddToAB') }}</el-button>
        </template>
      </list-toolbar>
      <el-table :data="listRes.list" v-loading="listRes.loading" border size="small" @selection-change="handleSelectionChange">
        <el-table-column :resizable="false" type="selection" width="55" align="center"/>
        <el-table-column :resizable="false" prop="id" label="ID" width="150">
          <template #default="{row}">
            <span class="device-id">{{ row.id }}</span><copy-button :text="row.id" />
          </template>
        </el-table-column>
        <el-table-column :resizable="false" prop="hostname" :label="T('Hostname')" min-width="150" show-overflow-tooltip/>
        <el-table-column :resizable="false" prop="alias" :label="T('Alias')" min-width="150" show-overflow-tooltip/>
        <el-table-column :resizable="false" prop="last_online_time" :label="T('LastOnlineTime')" min-width="170">
          <template #default="{row}">
            <online-status :time="row.last_online_time" :telemetry="appStore.setting.appConfig.device_telemetry !== false" />
          </template>
        </el-table-column>
        <el-table-column :resizable="false" prop="os" :label="T('Os')" min-width="160" show-overflow-tooltip/>
        <el-table-column :resizable="false" prop="version" :label="T('Version')" width="80" show-overflow-tooltip/>
        <el-table-column :resizable="false" prop="username" :label="T('Username')" min-width="150" show-overflow-tooltip/>
        <el-table-column :resizable="false" prop="last_online_ip" :label="T('LastOnlineIp')" min-width="170" show-overflow-tooltip/>
        <el-table-column :resizable="false" :label="T('Actions')" align="center" width="170" class-name="table-actions" fixed="right">
          <template #default="{row}">
            <el-button type="primary" size="small" @click="connectByClient(row.id)">{{ T('Link') }}</el-button>
            <el-dropdown trigger="click">
              <el-button link type="primary">{{ T('More') }}<el-icon class="el-icon--right"><arrow-down/></el-icon></el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item v-if="appStore.setting.appConfig.web_client" @click="toWebClientLink(row)">Web Client</el-dropdown-item>
                  <el-dropdown-item @click="toAddressBook(row)">{{ T('AddToAddressBook') }}</el-dropdown-item>
                  <el-dropdown-item @click="toView(row)">{{ T('View') }}</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination class="list-pagination" background
                     layout="total, sizes, prev, pager, next, jumper"
                     :page-sizes="[10,20,50,100]"
                     v-model:page-size="listQuery.page_size"
                     v-model:current-page="listQuery.page"
                     :total="listRes.total">
      </el-pagination>
    </el-card>
    <el-dialog v-model="formVisible" :title="T('Information')" width="800" :style="{ textAlign: 'center' }">
      <el-form class="dialog-form" ref="form" :model="formData" label-width="120px">
        <el-form-item label="ID" prop="id">
          <el-input v-model="formData.id" disabled></el-input>
        </el-form-item>
        <el-form-item :label="T('Username')" prop="username">
          <el-input v-model="formData.username" disabled></el-input>
        </el-form-item>
        <el-form-item :label="T('Hostname')" prop="hostname">
          <el-input v-model="formData.hostname" disabled></el-input>
        </el-form-item>
        <el-form-item label="CPU" prop="cpu">
          <el-input v-model="formData.cpu" disabled></el-input>
        </el-form-item>
        <el-form-item :label="T('Memory')" prop="memory">
          <el-input v-model="formData.memory" disabled></el-input>
        </el-form-item>
        <el-form-item :label="T('Os')" prop="os">
          <el-input v-model="formData.os" disabled></el-input>
        </el-form-item>
        <el-form-item :label="T('Uuid')" prop="uuid">
          <el-input v-model="formData.uuid" disabled></el-input>
        </el-form-item>
        <el-form-item :label="T('Version')" prop="version">
          <el-input v-model="formData.version" disabled></el-input>
        </el-form-item>
      </el-form>
    </el-dialog>

    <el-dialog v-model="ABFormVisible" width="800" :title="T('Create')">
      <el-form class="dialog-form" ref="form" :model="ABFormData" label-width="120px">
        <el-form-item :label="T('AddressBookName')" required prop="collection_id">
          <el-select v-model="ABFormData.collection_id" clearable @change="changeCollectionForUpdate">
            <el-option :value="0" :label="T('MyAddressBook')"></el-option>
            <el-option v-for="c in collectionListResForUpdate.list" :key="c.id" :label="c.name" :value="c.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="ID" prop="id" required>
          <el-input v-model="ABFormData.id"></el-input>
        </el-form-item>
        <el-form-item :label="T('Username')" prop="username">
          <el-input v-model="ABFormData.username"></el-input>
        </el-form-item>
        <el-form-item :label="T('Alias')" prop="alias">
          <el-input v-model="ABFormData.alias"></el-input>
        </el-form-item>
        <el-form-item :label="T('Hostname')" prop="hostname">
          <el-input v-model="ABFormData.hostname"></el-input>
        </el-form-item>
        <el-form-item :label="T('Platform')" prop="platform">
          <el-select v-model="ABFormData.platform">
            <el-option
                v-for="item in ABPlatformList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item :label="T('Tags')" prop="tags">
          <el-select v-model="ABFormData.tags" multiple>
            <el-option
                v-for="item in tagListRes.list"
                :key="item.name"
                :label="item.name"
                :value="item.name"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button @click="ABFormVisible = false">{{ T('Cancel') }}</el-button>
          <el-button @click="ABSubmit" type="primary">{{ T('Submit') }}</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <el-dialog v-model="batchABFormVisible" width="800" :title="T('Create')">
      <el-form class="dialog-form" ref="form" :model="batchABFormData" label-width="120px">
        <el-form-item :label="T('AddressBookName')" required prop="collection_id">
          <el-select v-model="batchABFormData.collection_id" clearable @change="changeCollectionForBatchCreateAB">
            <el-option :value="0" :label="T('MyAddressBook')"></el-option>
            <el-option v-for="c in collectionListResForUpdate.list" :key="c.id" :label="c.name" :value="c.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="T('Tags')" prop="tags">
          <el-select v-model="batchABFormData.tags" multiple>
            <el-option
                v-for="item in tagListRes.list"
                :key="item.name"
                :label="item.name"
                :value="item.name"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button @click="batchABFormVisible = false">{{ T('Cancel') }}</el-button>
          <el-button @click="submitBatchAddToAB" type="primary">{{ T('Submit') }}</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup>
  import CopyButton from '@/components/copyButton.vue'
  import { ArrowDown } from '@element-plus/icons-vue'
  import ListToolbar from '@/components/listToolbar.vue'
  import OnlineStatus from '@/components/onlineStatus.vue'
  import { Download, Search } from '@element-plus/icons-vue'
  import { computed, onActivated, onMounted, reactive, ref, watch } from 'vue'
  import { list } from '@/api/my/peer'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { toWebClientLink } from '@/utils/webclient'
  import { T } from '@/utils/i18n'
  import { jsonToCsv, downBlob } from '@/utils/file'
  import { useRepositories as useABRepositories } from '@/views/address_book/index'
  import { useAppStore } from '@/store/app'
  import { connectByClient } from '@/utils/peer'
  import { batchCreateFromPeers } from '@/api/my/address_book'

  const appStore = useAppStore()
  const listRes = reactive({
    list: [], total: 0, loading: false,
  })
  const listQuery = reactive({
    page: 1,
    page_size: 10,
    time_ago: null,
    id: '',
    hostname: '',
  })

  const getList = async () => {
    listRes.loading = true
    const res = await list(listQuery).catch(_ => false)
    listRes.loading = false
    if (res) {
      listRes.list = res.data.list
      listRes.total = res.data.total
    }
  }
  const handlerQuery = () => {
    if (listQuery.page === 1) {
      getList()
    } else {
      listQuery.page = 1
    }
  }

  /*const del = async (row) => {
    const cf = await ElMessageBox.confirm(T('Confirm?', { param: T('Delete') }), {
      confirmButtonText: T('Confirm'),
      cancelButtonText: T('Cancel'),
      type: 'warning',
    }).catch(_ => false)
    if (!cf) {
      return false
    }

    const res = await remove({ row_id: row.row_id }).catch(_ => false)
    if (res) {
      ElMessage.success(T('OperationSuccess'))
      getList()
    }
  }*/
  onMounted(getList)
  onActivated(getList)

  watch(() => listQuery.page, getList)

  watch(() => listQuery.page_size, handlerQuery)

  const formVisible = ref(false)
  const formData = reactive({
    row_id: 0,
    cpu: '',
    hostname: '',
    id: '',
    memory: '',
    os: '',
    username: '',
    uuid: '',
    version: '',
  })

  const toView = (row) => {
    formVisible.value = true
    //将row中的数据赋值给formData
    Object.keys(formData).forEach(key => {
      formData[key] = row[key]
    })
  }

  const timeFilters = computed(() => [
    { text: T('MinutesLess', { param: 1 }, 1), value: -60 },
    { text: T('HoursLess', { param: 1 }, 1), value: -3600 },
    { text: T('DaysLess', { param: 1 }, 1), value: -86400 },
    { text: '---------', value: 0 },
    { text: T('MinutesAgo', { param: 1 }, 1), value: 60 },
    { text: T('HoursAgo', { param: 1 }, 1), value: 3600 },
    { text: T('DaysAgo', { param: 1 }, 1), value: 86400 },
    { text: T('MonthsAgo', { param: 1 }, 1), value: 2592000 },
    // { text: T('YearsAgo', { param: 1 }, 1), value: 31536000 },
  ])

  const toExport = async () => {
    const q = { ...listQuery }
    q.page_size = 10000
    q.page = 1
    const res = await list(q).catch(_ => false)
    if (res) {
      const data = res.data.list.map(item => {
        item.last_online_time = item.last_online_time ? new Date(item.last_online_time * 1000).toLocaleString() : '-'
        delete item.user_id
        delete item.user
        return item
      })
      const csv = jsonToCsv(data)
      downBlob(csv, 'peers.csv')
    }
  }

  const {
    platformList: ABPlatformList,
    formVisible: ABFormVisible,
    formData: ABFormData,
    collectionListResForUpdate,
    getCollectionListForUpdate,
    tagListRes,
    changeCollectionForUpdate,
    submit: ABSubmit,
    fromPeer,
  } = useABRepositories('my')
  onMounted(getCollectionListForUpdate)
  const toAddressBook = (peer) => {
    fromPeer(peer)
    ABFormVisible.value = true
  }

  const multipleSelection = ref([])
  const handleSelectionChange = (val) => {
    multipleSelection.value = val
  }
  /*const toBatchDelete = async () => {
    if (!multipleSelection.value.length) {
      ElMessage.warning(T('PleaseSelectData'))
      return false
    }
    const cf = await ElMessageBox.confirm(T('Confirm?', { param: T('BatchDelete') }), {
      confirmButtonText: T('Confirm'),
      cancelButtonText: T('Cancel'),
      type: 'warning',
    }).catch(_ => false)
    if (!cf) {
      return false
    }

    const res = await batchRemove({ row_ids: multipleSelection.value.map(i => i.row_id) }).catch(_ => false)
    if (res) {
      ElMessage.success(T('OperationSuccess'))
      getList()
    }
  }*/

  const batchABFormVisible = ref(false)
  const toBatchAddToAB = () => {
    batchABFormVisible.value = true
  }
  const batchABFormData = ref({
    collection_id: 0,
    tags: [],
    peer_ids: [],
  })
  const changeCollectionForBatchCreateAB = (val) => {
    batchABFormData.value.tags = []
    changeCollectionForUpdate(val)
  }
  const submitBatchAddToAB = async () => {
    if (multipleSelection.value.length === 0) {
      ElMessage.warning(T('PleaseSelectData'))
      return false
    }
    batchABFormData.value.peer_ids = multipleSelection.value.map(i => i.row_id)
    if (!batchABFormData.value.peer_ids.length) {
      ElMessage.warning(T('PleaseSelectData'))
      return false
    }

    const res = await batchCreateFromPeers(batchABFormData.value).catch(_ => false)
    if (res) {
      ElMessage.success(T('OperationSuccess'))
      batchABFormVisible.value = false
    }
  }


</script>

<style scoped lang="scss">
.list-query .el-select {
  --el-select-width: 180px;
}

</style>
