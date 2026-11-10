<template>
  <AuthShell :title="T('PageNotFound')" :subtitle="T('PageNotFoundHelp')">
    <p class="error-code" aria-hidden="true">404</p>
    <el-button type="primary" class="auth-primary" @click="router.replace('/')">{{ T('BackToHome') }}</el-button>
    <div class="auth-links">
      <el-button link @click="router.back()">{{ T('GoBack') }}</el-button>
    </div>
  </AuthShell>
</template>

<script setup>
  import { useRouter } from 'vue-router'
  import AuthShell from '@/components/authShell.vue'
  import { T } from '@/utils/i18n'

  const router = useRouter()
</script>

<style scoped>
.error-code {
  margin: 0 0 24px;
  font-size: 64px;
  line-height: 1;
  font-weight: 700;
  letter-spacing: -2px;
  color: var(--el-color-primary-light-5);
}
</style>
