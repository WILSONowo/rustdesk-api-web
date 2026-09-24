<template>
  <main class="auth-page">
    <section class="auth-card" :aria-label="title">
      <div class="auth-brand"><img src="@/assets/logo.png" alt="" /><span>RustDesk <span class="brand-caption">{{ T('AccountCenter') }}</span></span></div>
      <header class="auth-heading"><h1>{{ title }}</h1><p v-if="subtitle">{{ subtitle }}</p></header>
      <slot />
    </section>
  </main>
</template>
<script setup>
import { T } from '@/utils/i18n'
defineProps({ title: String, subtitle: String })
</script>
<style scoped lang="scss">
.auth-page {
  min-height: 100vh; min-height: 100svh; box-sizing: border-box;
  display: flex; padding: 40px 20px;
  background: var(--account-page-background);
  color: var(--el-text-color-primary);
}
.auth-card {
  box-sizing: border-box; width: 100%; max-width: 440px; margin: auto;
  padding: 32px; background: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color-lighter); border-radius: var(--account-card-radius);
  box-shadow: var(--account-card-shadow);
}
.auth-brand { display: flex; align-items: center; gap: 12px; font-weight: 600; font-size: 16px; }
.auth-brand img { width: 36px; height: 36px; border-radius: 10px; }
.brand-caption { display: block; color: var(--el-text-color-secondary); font-size: 12px; font-weight: 400; margin-top: 3px; }
.auth-heading { margin: 28px 0 24px; }
h1 { font-size: 26px; line-height: 1.3; letter-spacing: -.5px; margin: 0; font-weight: 600; }
p { font-size: 14px; line-height: 1.6; color: var(--el-text-color-secondary); margin: 10px 0 0; }
:deep(.el-form-item) { margin-bottom: 22px; }
:deep(.el-form-item__label) { padding-bottom: 8px; line-height: 20px; color: var(--el-text-color-regular); }
:deep(.el-input__wrapper) { min-height: 42px; box-sizing: border-box; border-radius: 8px; padding: 1px 12px; }
:deep(.el-input__inner) { font-size: 14px; }
:deep(.el-button:not(.is-link)) { min-height: 42px; border-radius: 8px; }
:deep(.auth-primary) { width: 100%; margin: 2px 0 0; font-weight: 600; }
:deep(.auth-links) { display: flex; justify-content: center; align-items: center; flex-wrap: wrap; gap: 16px; margin-top: 20px; }
:deep(.auth-links .el-button) { margin: 0; }
:deep(.el-alert) { margin-bottom: 20px; text-align: left; padding: 12px; border-radius: 8px; }
:deep(.el-alert__title) { font-size: 13px; line-height: 1.6; }
:deep(.el-result) { padding: 12px 0; }
@media (max-width: 480px) {
  .auth-page { padding: 20px 12px; }
  .auth-card { padding: 24px 20px; }
}
</style>
