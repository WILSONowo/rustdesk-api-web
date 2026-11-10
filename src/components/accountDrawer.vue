<template>
  <el-drawer v-model="accountDrawerVisible" :title="T('AccountSettings')" :size="drawerSize" append-to-body @open="loadOauth">
    <section class="account-section">
      <h3>{{ T('Profile') }}</h3>
      <dl class="account-fields">
        <dt>{{ T('Username') }}</dt>
        <dd>{{ userStore.username }}</dd>
        <template v-if="userStore.nickname && userStore.nickname !== userStore.username">
          <dt>{{ T('Nickname') }}</dt>
          <dd>{{ userStore.nickname }}</dd>
        </template>
      </dl>
    </section>
    <section class="account-section">
      <h3>{{ T('Email') }}</h3>
      <email-binding />
    </section>
    <section class="account-section">
      <h3>{{ T('Password') }}</h3>
      <p>{{ T('ChangePasswordHelp') }}</p>
      <el-button @click="changePwdVisible = true">{{ T('ChangePassword') }}</el-button>
    </section>
    <section v-if="oidcData.length" class="account-section">
      <h3>{{ T('LinkedAccounts') }}</h3>
      <ul class="linked-accounts" v-loading="oauthLoading">
        <li v-for="row in oidcData" :key="row.op">
          <span class="linked-name">{{ T(row.op) }}</span>
          <el-tag v-if="row.status === 1" type="success" size="small">{{ T('HasBind') }}</el-tag>
          <el-tag v-else type="info" size="small">{{ T('NoBind') }}</el-tag>
          <el-button v-if="row.status === 1" link type="danger" @click="toUnBind(row)">{{ T('UnBind') }}</el-button>
          <el-button v-else link type="primary" @click="toBind(row)">{{ T('ToBind') }}</el-button>
        </li>
      </ul>
    </section>
    <changePwdDialog v-model:visible="changePwdVisible"></changePwdDialog>
  </el-drawer>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { ElMessageBox } from 'element-plus'
import { T } from '@/utils/i18n'
import { useUserStore } from '@/store/user'
import { bind, unbind } from '@/api/oauth'
import { myOauth } from '@/api/user'
import { accountDrawerVisible } from '@/utils/accountDrawer'
import EmailBinding from '@/components/emailBinding.vue'
import changePwdDialog from '@/components/changePwdDialog.vue'

const userStore = useUserStore()
const changePwdVisible = ref(false)
const oidcData = ref([])
const oauthLoading = ref(false)

// Full width on phones, a side panel elsewhere.
const narrow = window.matchMedia('(max-width: 640px)')
const drawerSize = ref(narrow.matches ? '100%' : '440px')
const updateSize = () => { drawerSize.value = narrow.matches ? '100%' : '440px' }
onMounted(() => narrow.addEventListener('change', updateSize))
onBeforeUnmount(() => narrow.removeEventListener('change', updateSize))

async function loadOauth () {
  oauthLoading.value = true
  const res = await myOauth().catch(_ => false)
  oauthLoading.value = false
  if (res) oidcData.value = res.data || []
}
async function toBind (row) {
  const res = await bind({ op: row.op }).catch(_ => false)
  if (res) window.open(res.data.url)
}
async function toUnBind (row) {
  const cf = await ElMessageBox.confirm(T('Confirm?', { param: T('UnBind') }), {
    confirmButtonText: T('Confirm'),
    cancelButtonText: T('Cancel'),
    type: 'warning',
  }).catch(_ => false)
  if (!cf) return
  const res = await unbind({ op: row.op }).catch(_ => false)
  if (res) loadOauth()
}
</script>

<style scoped lang="scss">
.account-section {
  padding: 20px 0;
  border-top: 1px solid var(--el-border-color-lighter);
  &:first-child { padding-top: 0; border-top: 0; }
  h3 { margin: 0 0 12px; font-size: 15px; font-weight: 600; }
  p { margin: 0 0 12px; font-size: 13px; line-height: 1.6; color: var(--el-text-color-secondary); }
}
.account-fields {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 8px 16px;
  margin: 0;
  font-size: 14px;
  dt { color: var(--el-text-color-secondary); }
  dd { margin: 0; overflow-wrap: anywhere; }
}
.linked-accounts {
  list-style: none;
  margin: 0;
  padding: 0;
  li { display: flex; align-items: center; gap: 12px; padding: 8px 0; }
  .linked-name { flex: 1; font-size: 14px; }
}
:deep(.email-binding) { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 12px; }
</style>
