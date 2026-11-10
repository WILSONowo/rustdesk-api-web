<template>
  <main class="auth-page">
    <div class="auth-tools">
      <el-tooltip :content="T(isDark ? 'LightMode' : 'DarkMode')" placement="bottom">
        <button type="button" class="tool-button" :aria-label="T(isDark ? 'LightMode' : 'DarkMode')" @click="isDark = !isDark">
          <el-icon><Sunny v-if="isDark"/><Moon v-else/></el-icon>
        </button>
      </el-tooltip>
    </div>
    <section class="auth-card" :aria-label="title">
      <div class="auth-brand"><img :src="appStore.setting.logo" alt="" /><span>{{ appStore.setting.title }} <span class="brand-caption">{{ T('AccountCenter') }}</span></span></div>
      <header class="auth-heading"><h1>{{ title }}</h1><p v-if="subtitle">{{ subtitle }}</p></header>
      <slot />
    </section>
  </main>
</template>
<script setup>
import { T } from '@/utils/i18n'
import { useAppStore } from '@/store/app'
import { useDark } from '@vueuse/core'
import { Moon, Sunny } from '@element-plus/icons-vue'
defineProps({ title: String, subtitle: String })
// Use the configured admin title and logo, as the header does after sign-in.
const appStore = useAppStore()
// Same preference as the toggle in the admin top bar (stored by useDark).
const isDark = useDark()
</script>
<style scoped lang="scss">
.auth-page {
  position: relative;
  min-height: 100vh; min-height: 100svh; box-sizing: border-box;
  display: flex; padding: 40px 20px;
  background: var(--account-page-background);
  color: var(--el-text-color-primary);
}
.auth-tools { position: absolute; top: var(--app-space-4); right: var(--app-space-4); display: flex; gap: var(--app-space-1); }
.tool-button {
  display: inline-flex; align-items: center; justify-content: center;
  width: 34px; height: 34px; border: 1px solid var(--app-border); border-radius: var(--app-radius);
  background: var(--app-surface); color: var(--app-text-secondary); cursor: pointer;
  box-shadow: var(--app-shadow-sm); transition: background-color .15s, color .15s;
  .el-icon { font-size: 16px; }
  &:hover { background: var(--app-surface-muted); color: var(--app-text); }
  &:focus-visible { outline: 2px solid var(--app-accent); outline-offset: 2px; }
}
.auth-card {
  box-sizing: border-box; width: 100%; max-width: 440px; margin: auto;
  padding: 32px; background: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color-lighter); border-radius: var(--account-card-radius);
  box-shadow: var(--account-card-shadow);
}
.auth-brand { display: flex; align-items: center; gap: var(--app-space-3); font-weight: 600; font-size: var(--app-text-base); line-height: 20px; }
.auth-brand img { width: 32px; height: 32px; border-radius: var(--app-radius); }
.brand-caption { display: block; color: var(--app-text-muted); font-size: var(--app-text-xs); line-height: 16px; font-weight: 400; margin-top: 2px; }
.auth-heading { margin: var(--app-space-6) 0 var(--app-space-5); }
h1 { font-size: 22px; line-height: 30px; letter-spacing: -.3px; margin: 0; font-weight: 600; color: var(--app-text); }
p { font-size: var(--app-text-sm); line-height: 20px; color: var(--app-text-muted); margin: var(--app-space-2) 0 0; }
:deep(.el-form-item) { margin-bottom: 18px; }
:deep(.el-form-item__label) { padding-bottom: 6px; line-height: 20px; font-size: var(--app-text-sm); font-weight: 500; color: var(--app-text-secondary); }
:deep(.el-input__wrapper) { min-height: 40px; box-sizing: border-box; border-radius: var(--app-radius); padding: 1px 12px; }
:deep(.el-input__inner) { font-size: 14px; }
:deep(.el-button:not(.is-link)) { min-height: 40px; border-radius: var(--app-radius); }
:deep(.auth-primary) { width: 100%; margin: 2px 0 0; font-weight: 600; }
:deep(.auth-links) { display: flex; justify-content: center; align-items: center; flex-wrap: wrap; gap: 16px; margin-top: 20px; }
:deep(.auth-links .el-button) { margin: 0; }
:deep(.el-alert) { margin-bottom: 20px; text-align: left; padding: 12px; border-radius: 8px; }
:deep(.el-alert__title) { font-size: 13px; line-height: 1.6; }
:deep(.el-result) { padding: 12px 0; }
@media (max-width: 480px) {
  // Leave room above the card for the theme button.
  .auth-page { padding: 62px 12px 20px; }
  .auth-tools { top: var(--app-space-3); right: var(--app-space-3); }
  .auth-card { padding: 24px 20px; }
}
</style>
