<template>
  <div>
    <el-card class="list-query" shadow="hover">
      <el-form inline label-width="80px" @submit.prevent="handlerQuery">
        <el-form-item :label="T('User')">
          <el-select v-model="listQuery.user_id" clearable>
            <el-option
                v-for="item in allUsers"
                :key="item.id"
                :label="item.username"
                :value="item.id"
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
        <template #selection>
          <el-button type="danger" plain @click="toBatchDelete">{{ T('BatchDelete') }}</el-button>
        </template>
      </list-toolbar>
      <el-table :data="listRes.list" v-loading="listRes.loading" border @selection-change="handleSelectionChange">
        <el-table-column :resizable="false" type="selection" align="center" width="50"/>
        <el-table-column :resizable="false" prop="id" label="id" width="100" show-overflow-tooltip/>
        <el-table-column min-width="150" :resizable="false" :label="T('Owner')">
          <template #default="{row}">
            <span v-if="row.user_id"> <el-tag>{{ allUsers?.find(u => u.id === row.user_id)?.username }}</el-tag> </span>
          </template>
        </el-table-column>
        <el-table-column min-width="150" :resizable="false" :label="T('Token')">
          <template #default="{row}">
            <span> {{ maskToken(row.token) }} </span>
          </template>
        </el-table-column>
        <el-table-column min-width="180" :resizable="false" prop="created_at" :label="T('CreatedAt')" show-overflow-tooltip/>
        <el-table-column min-width="180" :resizable="false" :label="T('ExpireTime')" prop="expired_at">
          <template #default="{row}">
            <el-tag :type="expired(row)?'info':'success'">{{ row.expired_at ? new Date(row.expired_at * 1000).toLocaleString() : '-' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :resizable="false" :label="T('Actions')" align="center" width="90" class-name="table-actions">
          <template #default="{row}">
            <el-button link type="danger" @click="del(row)">{{ T('Logout') }}</el-button>
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
  import { Search } from '@element-plus/icons-vue'
  import { onActivated, onMounted, ref, watch } from 'vue'
  import { loadAllUsers } from '@/global'
  import { useRepositories } from '@/views/user/token.js'
  import { T } from '@/utils/i18n'

  const { allUsers, getAllUsers } = loadAllUsers()
  getAllUsers()

  const {
    listRes,
    listQuery,
    getList,
    handlerQuery,
    del,
    batchDelete,
  } = useRepositories()

  onMounted(getList)
  onActivated(getList)

  watch(() => listQuery.page, getList)

  watch(() => listQuery.page_size, handlerQuery)
  const maskToken = (token) => {
    return token.slice(0, 4) + '****' + token.slice(-4)
  }
  const expired = (row) => {
    const now = new Date().getTime()
    return row.expired_at * 1000 < now
  }

  const multipleSelection = ref([])
  const handleSelectionChange = (val) => {
    multipleSelection.value = val
  }
  const toBatchDelete = () => {
    if (multipleSelection.value.length === 0) {
      return
    }
    batchDelete(multipleSelection.value.map(v => v.id))
  }
</script>

<style scoped lang="scss">
.list-query .el-select {
  --el-select-width: 160px;
}


</style>
