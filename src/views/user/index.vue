<template>
  <div>
    <el-card class="list-query" shadow="hover">
      <el-form inline label-width="80px">
        <el-form-item :label="T('Username')">
          <el-input v-model="listQuery.username"></el-input>
        </el-form-item>
        <el-form-item>
          <el-select v-model="listQuery.status" style="width: 150px; margin-right: 12px" :aria-label="T('Status')">
            <el-option :value="0" :label="T('AllStatuses')" />
            <el-option :value="USER_PENDING_STATUS" :label="T('PendingApproval')" />
            <el-option :value="ENABLE_STATUS" :label="T('AccountEnabled')" />
            <el-option :value="DISABLE_STATUS" :label="T('AccountDisabled')" />
          </el-select>
          <el-button type="primary" @click="handlerQuery">{{ T('Filter') }}</el-button>
          <el-button type="danger" @click="toAdd">{{ T('Add') }}</el-button>
          <el-button type="success" @click="toExport">{{ T('Export') }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card class="list-body" shadow="hover">
      <el-table :data="listRes.list" v-loading="listRes.loading" border>
        <el-table-column :resizable="false" prop="id" label="ID" align="center" width="65"></el-table-column>
        <el-table-column :resizable="false" prop="username" :label="T('Username')" align="center" min-width="180" show-overflow-tooltip/>
        <el-table-column :resizable="false" prop="email" :label="T('Email')" align="center" min-width="210" show-overflow-tooltip/>
        <el-table-column :resizable="false" prop="nickname" :label="T('Nickname')" align="center" min-width="150" show-overflow-tooltip/>
        <el-table-column :resizable="false" :label="T('Group')" align="center" min-width="120">
          <template #default="{row}">
            <span v-if="row.group_id"> <el-tag>{{ listRes.groups?.find(g => g.id === row.group_id)?.name }} </el-tag> </span>
            <span v-else> - </span>
          </template>
        </el-table-column>
        <el-table-column :resizable="false" :label="T('Status')" align="center" min-width="150">
          <template #default="{row}">
            <el-tag v-if="row.status === USER_PENDING_STATUS" type="warning">{{ T('PendingApproval') }}</el-tag>
            <el-switch v-else v-model="row.status"
                       :active-value="ENABLE_STATUS"
                       :inactive-value="DISABLE_STATUS"
                       @change="changeStatus(row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column :resizable="false" prop="remark" :label="T('Remark')" align="center" min-width="200" show-overflow-tooltip/>
        <el-table-column :resizable="false" :label="T('RegistrationReview')" align="center" width="190" fixed="right">
          <template #default="{row}">
            <template v-if="row.status === USER_PENDING_STATUS">
              <el-button size="small" type="success" :disabled="reviewing.has(row.id)" @click="review(row, true)">{{ T('ApproveRegistration') }}</el-button>
              <el-button size="small" type="danger" :disabled="reviewing.has(row.id)" @click="review(row, false)">{{ T('RejectRegistration') }}</el-button>
            </template>
            <span v-else>—</span>
          </template>
        </el-table-column>
        <el-table-column :resizable="false" prop="created_at" :label="T('CreatedAt')" align="center" min-width="180" show-overflow-tooltip/>
        <el-table-column :resizable="false" prop="updated_at" :label="T('UpdatedAt')" align="center" min-width="180" show-overflow-tooltip/>
        <el-table-column :resizable="false" :label="T('Actions')" align="center" width="320" class-name="table-actions">
          <template #default="{row}">
            <el-button @click="toTag(row)">{{ T('UserTags') }}</el-button>
            <el-button @click="toAddressBook(row)">{{ T('UserAddressBook') }}</el-button>
            <el-button @click="toEdit(row)">{{ T('Edit') }}</el-button>
            <el-button type="warning" @click="changePass(row)">{{ T('ResetPassword') }}</el-button>
            <el-button type="danger" @click="remove(row)">{{ T('Delete') }}</el-button>
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
  import { useRepositories, useDel, useToEditOrAdd, useChangePwd } from '@/views/user/composables'
  import { T } from '@/utils/i18n'
  import { DISABLE_STATUS, ENABLE_STATUS, USER_PENDING_STATUS } from '@/utils/common_options'
  import { update, reviewRegistration } from '@/api/user'
  import { ElMessageBox, ElMessage } from 'element-plus'
  import { onMounted, watch, reactive } from 'vue'
  const reviewing = reactive(new Set())
  const review = async (row, approve) => {
    if (reviewing.has(row.id)) return
    reviewing.add(row.id)
    try {
      const confirmed = await ElMessageBox.confirm(
        T(approve ? 'ApproveRegistrationConfirm' : 'RejectRegistrationConfirm', { username: row.username }),
        { confirmButtonText: T('Confirm'), cancelButtonText: T('Cancel'), type: 'warning' },
      ).catch(() => false)
      if (!confirmed) return
      const res = await reviewRegistration(row.id, approve).catch(() => false)
      if (res) ElMessage.success(T('OperationSuccess'))
      await getList()
    } finally {
      reviewing.delete(row.id)
    }
  }
  //列表
  const {
    listRes,
    listQuery,
    handlerQuery,
    getList,
    getGroups,
    toExport,
  } = useRepositories()

  onMounted(getGroups)

  onMounted(getList)

  watch(() => listQuery.page, getList)
  watch(() => listQuery.page_size, handlerQuery)

  const { toEdit, toAdd, toAddressBook, toTag } = useToEditOrAdd()

  const { changePass } = useChangePwd()

  //删除
  const { del } = useDel()
  const remove = async (row) => {
    const res = await del(row.id)
    if (res) {
      getList(listQuery)
    }
  }

  const changeStatus = async (row) => {
    /*const confirm = await ElMessageBox.confirm(T('Confirm?', { param: T('Update') }), {
      confirmButtonText: T('Confirm'),
      cancelButtonText: T('Cancel'),
    }).catch(_ => false)
    if (!confirm) {
      return false
    }*/
    const res = await update(row).catch(_ => false)
    if (res) {
      ElMessage.success(T('OperationSuccess'))
    }
    getList()
  }

</script>

<style scoped>
</style>
