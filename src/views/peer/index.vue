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
        <el-form-item :label="T('Username')">
          <el-input v-model="listQuery.username" clearable/>
        </el-form-item>
        <el-form-item label="IP">
          <el-input v-model="listQuery.ip" clearable/>
        </el-form-item>
        <el-form-item class="query-submit">
          <el-button type="primary" native-type="submit" :icon="Search">{{ T('Filter') }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card class="list-body" shadow="hover">
      <list-toolbar :selected="multipleSelection.length">
        <el-button type="primary" :icon="Plus" @click="toAdd">{{ T('Add') }}</el-button>
        <el-button :icon="Upload" @click="showImport=true">{{ T('Import') }}</el-button>
        <el-button :icon="Download" @click="toExport">{{ T('Export') }}</el-button>
        <template #selection>
          <el-button @click="toBatchAddToAB">{{ T('BatchAddToAB') }}</el-button>
          <el-button type="danger" plain @click="toBatchDelete">{{ T('BatchDelete') }}</el-button>
        </template>
        <template #extra>
          <el-tooltip :content="T('ColumnSettings')" placement="top">
            <el-button :icon="Setting" :aria-label="T('ColumnSettings')" @click="showColumnSetting"></el-button>
          </el-tooltip>
        </template>
      </list-toolbar>

      <el-table :data="listRes.list" v-loading="listRes.loading" border size="small" @selection-change="handleSelectionChange">
        <el-table-column :resizable="false" type="selection" width="55" align="center"/>
        <template v-for="c in visibleColumns.filter(cc => cc.visible)" :key="c">
          <el-table-column :resizable="false" v-if="c.name==='id'" prop="id" label="ID" width="150">
            <template #default="{row}">
              <span class="device-id">{{ row.id }}</span><copy-button :text="row.id" />
            </template>
          </el-table-column>
          <el-table-column :resizable="false" v-if="c.name==='cpu'" prop="cpu" label="CPU" min-width="160" show-overflow-tooltip/>
          <el-table-column :resizable="false" v-if="c.name==='hostname'" prop="hostname" :label="T('Hostname')" min-width="150" show-overflow-tooltip/>
          <el-table-column :resizable="false" v-if="c.name==='memory'" prop="memory" :label="T('Memory')" width="120" show-overflow-tooltip/>
          <el-table-column :resizable="false" v-if="c.name==='os'" prop="os" :label="T('Os')" min-width="160" show-overflow-tooltip/>
          <el-table-column :resizable="false" v-if="c.name==='last_online_time'" prop="last_online_time" :label="T('LastOnlineTime')" min-width="170">
            <template #default="{row}">
              <online-status :time="row.last_online_time" :telemetry="appStore.setting.appConfig.device_telemetry !== false" />
            </template>
          </el-table-column>
          <el-table-column :resizable="false" v-if="c.name==='last_online_ip'" prop="last_online_ip" :label="T('LastOnlineIp')" min-width="170" show-overflow-tooltip/>
          <el-table-column :resizable="false" v-if="c.name==='username'" prop="username" :label="T('Username')" min-width="150" show-overflow-tooltip/>
          <el-table-column :resizable="false" v-if="c.name==='group_id'" prop="group_id" :label="T('Group')" width="120">
            <template #default="{row}">
              <span v-if="row.group_id"> <el-tag>{{ groupListRes.list?.find(g => g.id === row.group_id)?.name }} </el-tag> </span>
              <span v-else> - </span>
            </template>
          </el-table-column>
          <el-table-column :resizable="false" v-if="c.name==='uuid'" prop="uuid" :label="T('Uuid')" min-width="200" show-overflow-tooltip/>
          <el-table-column :resizable="false" v-if="c.name==='version'" prop="version" :label="T('Version')" width="80" show-overflow-tooltip/>
          <el-table-column :resizable="false" v-if="c.name==='alias'" prop="alias" :label="T('Alias')" min-width="150" show-overflow-tooltip/>
          <el-table-column :resizable="false" v-if="c.name==='created_at'" prop="created_at" :label="T('CreatedAt')" min-width="180" show-overflow-tooltip/>
          <el-table-column :resizable="false" v-if="c.name==='updated_at'" prop="updated_at" :label="T('UpdatedAt')" min-width="180" show-overflow-tooltip/>
        </template>

        <el-table-column :resizable="false" :label="T('Actions')" align="center" width="170" class-name="table-actions" fixed="right">
          <template #default="{row}">
            <el-button size="small" @click="connectByClient(row.id)">{{ T('Link') }}</el-button>
            <el-dropdown trigger="click">
              <el-button link type="primary">{{ T('More') }}<el-icon class="el-icon--right"><arrow-down/></el-icon></el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item v-if="appStore.setting.appConfig.web_client" @click="toWebClientLink(row)">Web Client</el-dropdown-item>
                  <el-dropdown-item @click="toAddressBook(row)">{{ T('AddToAddressBook') }}</el-dropdown-item>
                  <el-dropdown-item @click="toEdit(row)">{{ T('Edit') }}</el-dropdown-item>
                  <el-dropdown-item @click="del(row)" divided class="is-danger">{{ T('Delete') }}</el-dropdown-item>
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
    <el-dialog v-model="formVisible" :title="!formData.row_id?T('Create'):T('Update')" width="800">
      <el-form class="dialog-form" ref="form" :model="formData" label-width="120px">
        <el-form-item label="ID" prop="id" required>
          <el-input v-model="formData.id"></el-input>
        </el-form-item>
        <el-form-item :label="T('Group')" prop="group_id">
          <el-select v-model="formData.group_id">
            <el-option
                v-for="item in groupListRes.list"
                :key="item.id"
                :label="item.name"
                :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="T('Username')" prop="username">
          <el-input v-model="formData.username"></el-input>
        </el-form-item>
        <el-form-item :label="T('Hostname')" prop="hostname">
          <el-input v-model="formData.hostname"></el-input>
        </el-form-item>
        <el-form-item label="CPU" prop="cpu">
          <el-input v-model="formData.cpu"></el-input>
        </el-form-item>
        <el-form-item :label="T('Memory')" prop="memory">
          <el-input v-model="formData.memory"></el-input>
        </el-form-item>
        <el-form-item :label="T('Os')" prop="os">
          <el-input v-model="formData.os"></el-input>
        </el-form-item>
        <el-form-item :label="T('Uuid')" prop="uuid">
          <el-input v-model="formData.uuid"></el-input>
        </el-form-item>
        <el-form-item :label="T('Version')" prop="version">
          <el-input v-model="formData.version"></el-input>
        </el-form-item>
        <el-form-item :label="T('Alias')" prop="alias">
          <el-input v-model="formData.alias"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button @click="formVisible = false">{{ T('Cancel') }}</el-button>
          <el-button @click="submit" type="primary">{{ T('Submit') }}</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <el-dialog v-model="showImport" width="600" :title="T('Import')">
      <el-upload drag accept=".csv" :before-upload="parseCsv">
        <el-icon class="el-icon--upload"><upload-filled/></el-icon>
        <div class="el-upload__text">{{ T('Drop file here or click to upload') }}</div>
        <template #tip>
          <div class="el-upload__tip">
            {{ T('Please upload csv file') }}<br>
            {{ T('Columns') }}: <code class="csv-columns">id,cpu,hostname,memory,os,username,uuid,version,group_id</code><br>
            {{ T('You can reference export file') }}
          </div>
        </template>
      </el-upload>
      <template #footer>
        <el-button @click="showImport=false">{{ T('Cancel') }}</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="ABFormVisible" width="800" :title="T('Create')" destroy-on-close>
      <createABForm :peer="clickRow" @success="ABFormVisible=false" @cancel="ABFormVisible=false"></createABForm>
    </el-dialog>

    <el-dialog v-model="batchABFormVisible" width="800" :title="T('Create')">
      <el-form class="dialog-form" ref="form" :model="batchABFormData" label-width="120px">
        <el-form-item :label="T('Owner')" prop="user_id" required>
          <el-select v-model="batchABFormData.user_id" @change="changeUserForBatchCreateAB">
            <el-option
                v-for="item in allUsers"
                :key="item.id"
                :label="item.username"
                :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="T('AddressBookName')" required prop="collection_id">
          <el-select v-model="batchABFormData.collection_id" clearable>
            <el-option :value="0" :label="T('MyAddressBook')"></el-option>
            <el-option v-for="c in collectionListResForBatchCreateAB.list" :key="c.id" :label="c.name" :value="c.id"></el-option>
          </el-select>
        </el-form-item>
        <!--        <el-form-item :label="T('Tags')" prop="tags">
                  <el-select v-model="batchABFormData.tags" multiple>
                    <el-option
                        v-for="item in tagListRes.list"
                        :key="item.name"
                        :label="item.name"
                        :value="item.name"
                    ></el-option>
                  </el-select>
                </el-form-item>-->
        <el-form-item>
          <el-button @click="batchABFormVisible = false">{{ T('Cancel') }}</el-button>
          <el-button @click="submitBatchAddToAB" type="primary">{{ T('Submit') }}</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <el-dialog v-model="columnSettingVisible" :title="T('ColumnSettings')" width="min(420px, 94vw)">
      <div v-for="(row, key) in visibleColumns" :key="row.name" class="column-setting">
        <el-checkbox v-model="row.visible">{{ T(row.label) }}</el-checkbox>
        <el-button link :icon="ArrowUp" :disabled="key === 0" :aria-label="T('MoveUp')" @click="upColumn(key)"></el-button>
        <el-button link :icon="ArrowDown" :disabled="key === visibleColumns.length - 1" :aria-label="T('MoveDown')" @click="downColumn(key)"></el-button>
      </div>
      <template #footer>
        <el-button @click="columnSettingVisible = false">{{ T('Cancel') }}</el-button>
        <el-button type="primary" @click="saveColumnSetting">{{ T('Save') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
  import CopyButton from '@/components/copyButton.vue'
  import { computed, onActivated, onMounted, reactive, ref, watch } from 'vue'
  import { batchRemove, create, list, remove, update } from '@/api/peer'
  import { list as groupList } from '@/api/device_group'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { toWebClientLink } from '@/utils/webclient'
  import { T } from '@/utils/i18n'
  import { jsonToCsv, downBlob } from '@/utils/file'
  import { loadAllUsers } from '@/global'
  import { useAppStore } from '@/store/app'
  import { connectByClient } from '@/utils/peer'
  import { ArrowDown, ArrowUp, Setting } from '@element-plus/icons'
  import { Download, Plus, Search, Upload } from '@element-plus/icons-vue'
  import ListToolbar from '@/components/listToolbar.vue'
  import OnlineStatus from '@/components/onlineStatus.vue'
  import { batchCreateFromPeers } from '@/api/address_book'
  import { useRepositories as useCollectionRepositories } from '@/views/address_book/collection'
  import createABForm from '@/views/peer/createABForm.vue'
  import { UploadFilled } from '@element-plus/icons-vue'

  const appStore = useAppStore()

  //group
  const groupListRes = reactive({
    list: [], total: 0, loading: false,
  })
  const groupListQuery = reactive({
    page: 1,
    page_size: 999,
  })
  const getGroupList = async () => {
    groupListRes.loading = true
    const res = await groupList(groupListQuery).catch(_ => false)
    groupListRes.loading = false
    if (res) {
      groupListRes.list = res.data.list
      groupListRes.total = res.data.total
    }
  }
  onMounted(getGroupList)
  //

  const listRes = reactive({
    list: [], total: 0, loading: false,
  })
  const listQuery = reactive({
    page: 1,
    page_size: 10,
    time_ago: null,
    id: '',
    hostname: '',
    username: '',
    ip: '',
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

  const del = async (row) => {
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
  }
  onMounted(getList)
  onActivated(getList)

  watch(() => listQuery.page, getList)

  watch(() => listQuery.page_size, handlerQuery)

  const formVisible = ref(false)
  const formData = reactive({
    row_id: 0,
    group_id: null,
    cpu: '',
    hostname: '',
    id: '',
    memory: '',
    os: '',
    username: '',
    uuid: '',
    version: '',
  })

  const toEdit = (row) => {
    formVisible.value = true
    //将row中的数据赋值给formData
    Object.keys(formData).forEach(key => {
      formData[key] = row[key]
    })
  }
  const toAdd = () => {
    formVisible.value = true
    //重置formData
    formData.row_id = 0
    formData.cpu = ''
    formData.hostname = ''
    formData.id = ''
    formData.memory = ''
    formData.os = ''
    formData.username = ''
    formData.uuid = ''
    formData.version = ''
  }
  const submit = async () => {
    const api = formData.row_id ? update : create
    const res = await api(formData).catch(_ => false)
    if (res) {
      ElMessage.success(T('OperationSuccess'))
      formVisible.value = false
      getList()
    }
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

  const showImport = ref(false)
  const canKeys = ['id', 'cpu', 'hostname', 'memory', 'os', 'username', 'uuid', 'version', 'group_id']
  const parseCsv = (file) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      const data = e.target.result
      console.log(data)
      //组装数据
      const rows = data.split('\n')
      const keys = rows[0].split(',')
      console.log(keys, rows.slice(1).map(row => row.split(',')))
      const values = rows.slice(1).map(row => {
        const obj = {}
        row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).forEach((v, i) => {
          //去掉两边的"
          obj[keys[i]] = v.trim().replace(/^"|"$/g, '')
        })
        return obj
      }).filter(item => item.id)
      // console.log(values)
      //移除不需要的key
      values.forEach(item => {
        item.group_id = parseInt(item.group_id)
        Object.keys(item).forEach(key => {
          if (!canKeys.includes(key)) {
            delete item[key]
          }
        })
      })
      console.log(values)
      const pa = []
      values.map(item => {
        pa.push(create(item))
      })
      const res = await Promise.all(pa).catch(_ => false)
      if (res) {
        ElMessage.success(T('OperationSuccess'))
        getList()
      }

    }
    reader.readAsText(file)
    return false
  }
  const toImport = () => {
    ElMessage.warning('暂未实现')
  }

  const ABFormVisible = ref(false)
  const clickRow = ref({})
  const toAddressBook = (row) => {
    clickRow.value = row
    ABFormVisible.value = true
  }

  const multipleSelection = ref([])
  const handleSelectionChange = (val) => {
    multipleSelection.value = val
  }
  const toBatchDelete = async () => {
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
  }

  // 批量添加到地址簿 start
  const { allUsers, getAllUsers } = loadAllUsers()
  onMounted(getAllUsers)
  const {
    listRes: collectionListResForBatchCreateAB,
    listQuery: collectionListQueryForBatchCreateAB,
    getList: getCollectionListForBatchCreateAB,
  } = useCollectionRepositories('admin')
  collectionListQueryForBatchCreateAB.page_size = 9999
  const changeUserForBatchCreateAB = (val) => {
    batchABFormData.value.collection_id = 0
    collectionListQueryForBatchCreateAB.user_id = val
    getCollectionListForBatchCreateAB()
  }
  const batchABFormVisible = ref(false)
  const toBatchAddToAB = () => {
    batchABFormVisible.value = true
  }
  const batchABFormData = ref({
    collection_id: 0,
    tags: [],
    peer_ids: [],
    user_id: null,
  })
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
  // 批量添加到地址簿 end

  const columnSettingVisible = ref(false)
  // Default view: identity, status and ownership first; hardware and audit columns can be enabled in column settings.
  const allColumns = ref([
    { name: 'id', visible: true, label: 'Id' },
    { name: 'hostname', visible: true, label: 'Hostname' },
    { name: 'alias', visible: true, label: 'Alias' },
    { name: 'last_online_time', visible: true, label: 'LastOnlineTime' },
    { name: 'os', visible: true, label: 'Os' },
    { name: 'version', visible: true, label: 'Version' },
    { name: 'username', visible: true, label: 'Username' },
    { name: 'group_id', visible: true, label: 'Group' },
    { name: 'last_online_ip', visible: false, label: 'LastOnlineIp' },
    { name: 'cpu', visible: false, label: 'Cpu' },
    { name: 'memory', visible: false, label: 'Memory' },
    { name: 'uuid', visible: false, label: 'Uuid' },
    { name: 'created_at', visible: false, label: 'CreatedAt' },
    { name: 'updated_at', visible: false, label: 'UpdatedAt' },
  ])
  const visibleColumns = ref(JSON.parse(localStorage.getItem('peer_visible_columns')) || allColumns.value)
  const showColumnSetting = () => {
    columnSettingVisible.value = true
  }
  const saveColumnSetting = () => {
    localStorage.setItem('peer_visible_columns', JSON.stringify(visibleColumns.value))
    ElMessage.success(T('OperationSuccess'))
    columnSettingVisible.value = false
  }

  const upColumn = (index) => {
    if (index === 0) return
    const col = visibleColumns.value[index]
    visibleColumns.value.splice(index, 1)
    visibleColumns.value.splice(index - 1, 0, col)

  }
  const downColumn = (index) => {
    if (index === visibleColumns.value.length - 1) return
    const col = visibleColumns.value[index]
    visibleColumns.value.splice(index, 1)
    visibleColumns.value.splice(index + 1, 0, col)

  }
</script>

<style scoped lang="scss">
.list-query .el-select {
  --el-select-width: 180px;
}

.csv-columns {
  font-family: ui-monospace, Consolas, monospace;
  font-weight: 600;
}

.column-setting {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  .el-checkbox { flex: 1; }
}
</style>
