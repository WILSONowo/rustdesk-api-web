<template>
  <div>
    <el-card class="list-query" shadow="hover">
      <el-form inline label-width="80px" @submit.prevent="handlerQuery">
        <el-form-item :label="T('Peer')">
          <el-input v-model="listQuery.peer_id" clearable></el-input>
        </el-form-item>
        <el-form-item :label="T('FromPeer')">
          <el-input v-model="listQuery.from_peer" clearable></el-input>
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
          <el-button type="danger" plain @click="toBatchDelete">{{ T('BatchDelete') }}</el-button>
        </template>
      </list-toolbar>
      <el-table :data="listRes.list" v-loading="listRes.loading" border @selection-change="handleSelectionChange">
        <el-table-column :resizable="false" type="selection" align="center" width="50"/>
        <el-table-column :resizable="false" prop="id" label="ID" width="100" show-overflow-tooltip/>
        <el-table-column :resizable="false" :label="T('Peer')" prop="peer_id" min-width="150" show-overflow-tooltip/>
        <el-table-column :resizable="false" :label="T('FromPeer')" prop="from_peer" width="120" show-overflow-tooltip/>
        <el-table-column :resizable="false" :label="T('FromName')" prop="from_name" width="120" show-overflow-tooltip/>
        <el-table-column :resizable="false" :label="T('Ip')" prop="ip" min-width="170" show-overflow-tooltip/>
        <el-table-column :resizable="false" pop="type" :label="T('Type')" width="120">
          <template #default="{row}">
            <el-tag v-if="row.type === 1" type="warning">{{ T('File') }}</el-tag>
            <el-tag v-else>{{ T('Common') }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :resizable="false" prop="uuid" label="uuid" min-width="200" show-overflow-tooltip/>
        <el-table-column min-width="180" :resizable="false" prop="created_at" :label="T('CreatedAt')" show-overflow-tooltip/>
        <el-table-column min-width="180" :resizable="false" :label="T('CloseTime')" prop="close_time" show-overflow-tooltip/>
        <el-table-column :resizable="false" :label="T('Actions')" align="center" width="90" class-name="table-actions">
          <template #default="{row}">
            <el-button link type="danger" @click="del(row)">{{ T('Delete') }}</el-button>
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
  </div>
</template>

<script setup>
  import ListToolbar from '@/components/listToolbar.vue'
  import { Download, Search } from '@element-plus/icons-vue'
  import { onActivated, onMounted, ref, watch } from 'vue'
  import { useRepositories } from '@/views/audit/reponsitories'
  import { T } from '@/utils/i18n'

  const {
    listRes,
    listQuery,
    getList,
    handlerQuery,
    del,
    batchdel,
    toExport,
  } = useRepositories()

  onMounted(getList)
  onActivated(getList)

  watch(() => listQuery.page, getList)

  watch(() => listQuery.page_size, handlerQuery)
  const multipleSelection = ref([])
  const handleSelectionChange = (val) => {
    multipleSelection.value = val
  }
  const toBatchDelete = () => {
    if (multipleSelection.value.length === 0) {
      return
    }
    batchdel(multipleSelection.value)
  }
</script>

<style scoped lang="scss">

</style>
