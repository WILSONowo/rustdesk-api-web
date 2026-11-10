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
        <el-table-column :resizable="false" prop="id" label="ID" align="center" width="100" show-overflow-tooltip/>
        <el-table-column :resizable="false" :label="T('User')" align="center" width="120">
          <template #default="{row}">
            <span v-if="row.user_id"> <el-tag>{{ allUsers?.find(u => u.id === row.user_id)?.username }}</el-tag> </span>
          </template>
        </el-table-column>
        <el-table-column min-width="150" :resizable="false" prop="peer_id" :label="T('Peer')" align="center" show-overflow-tooltip/>
        <el-table-column min-width="180" :resizable="false" prop="created_at" :label="T('CreatedAt')" align="center" show-overflow-tooltip/>
        <el-table-column min-width="150" :resizable="false" :label="`${T('ExpireTime')} (${T('Second')})`" prop="expire" align="center">
          <template #default="{row}">
            <el-tag :type="expired(row)?'info':'success'">{{ row.expire ? row.expire : T('Forever') }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :resizable="false" :label="T('Actions')" align="center" width="90" class-name="table-actions">
          <template #default="{row}">
            <el-button link type="danger" @click="del(row)">{{ T('Delete') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-card class="list-page" shadow="hover">
      <el-pagination background
                     layout="prev, pager, next, sizes, jumper"
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
  import { onActivated, onMounted, ref, watch, reactive } from 'vue'
  import { loadAllUsers } from '@/global'
  import { T } from '@/utils/i18n'
  import { remove, list, batchDelete } from '@/api/share_record'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { useRepositories } from '@/views/share_record/index'

  const { allUsers, getAllUsers } = loadAllUsers()
  getAllUsers()

  const {
    listRes,
    listQuery,
    getList,
    handlerQuery,
    del,
    multipleSelection,
    toBatchDelete,
    expired,
  } = useRepositories('admin')

  onMounted(getList)
  onActivated(getList)

  watch(() => listQuery.page, getList)

  watch(() => listQuery.page_size, handlerQuery)
  const handleSelectionChange = (val) => {
    multipleSelection.value = val
  }


</script>

<style scoped lang="scss">
.list-query .el-select {
  --el-select-width: 160px;
}


</style>
