<template>
  <AuthShell :title="T('OauthLogining')" :subtitle="T('OauthCloseNote')">
    <dl class="oauth-details">
      <dt>{{ T('Device') }}</dt>
      <dd>{{ oauthInfo.device_name || '—' }}</dd>
      <dt>ID</dt>
      <dd class="device-id">{{ oauthInfo.id || '—' }}</dd>
    </dl>
    <el-button v-if="!resStatus" type="primary" class="auth-primary" @click="toConfirm">{{ T('ConfirmOauth') }}</el-button>
    <el-result v-else icon="success" :title="T('OperationSuccessAndCloseAfter3Seconds')" />
    <div class="auth-links">
      <el-button link @click="out">{{ T('Close') }}</el-button>
    </div>
  </AuthShell>
</template>

<script setup>
  import AuthShell from '@/components/authShell.vue'
  import { ref, onMounted } from 'vue'
  import { info, confirm } from '@/api/oauth'
  import { useRoute, useRouter } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import { T } from '@/utils/i18n'

  const oauthInfo = ref({})
  const route = useRoute()
  const router = useRouter()
  const code = route.params?.code
  if (!code) {
    // router.push('/')
  }
  const getInfo = async () => {
    const res = await info({ code }).catch(_ => false)
    if (res) {
      oauthInfo.value = res.data
    } else {
      // router.push('/')
    }
  }
  getInfo()
  const resStatus = ref(0)
  const toConfirm = async () => {
    const res = await confirm({ code }).catch(_ => false)
    if (res) {
      resStatus.value = 1
      ElMessage.success(T('OperationSuccessAndCloseAfter3Seconds'))
      setTimeout(_ => {
        out()
      }, 3000)
    }
  }
  const out = () => {
    window.close()
  }

</script>

<style scoped lang="scss">
.oauth-details {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 12px 16px;
  margin: 0 0 24px;
  padding: 16px;
  border-radius: 12px;
  background: var(--el-fill-color-light);
  font-size: 14px;
  dt { color: var(--el-text-color-secondary); }
  dd { margin: 0; font-weight: 600; overflow-wrap: anywhere; }
}
</style>
