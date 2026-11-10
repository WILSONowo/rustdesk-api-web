<template>
  <main class="auth-page">
    <section class="auth-card" :aria-label="title">
      <div class="auth-top">
        <div class="auth-brand"><img :src="appStore.setting.logo" alt="" /><span>{{ appStore.setting.title }} <span class="brand-caption">{{ T('AccountCenter') }}</span></span></div>
        <div class="auth-tools">
          <el-dropdown trigger="click" placement="bottom-end">
            <button type="button" class="tool-button tool-lang" :aria-label="T('Language')" :title="T('Language')">
              <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
                <path fill="currentColor"
                      d="m18.5 10l4.4 11h-2.155l-1.201-3h-4.09l-1.199 3h-2.154L16.5 10h2zM10 2v2h6v2h-1.968a18.222 18.222 0 0 1-3.62 6.301a14.864 14.864 0 0 0 2.336 1.707l-.751 1.878A17.015 17.015 0 0 1 9 13.725a16.676 16.676 0 0 1-6.201 3.548l-.536-1.929a14.7 14.7 0 0 0 5.327-3.042A18.078 18.078 0 0 1 4.767 8h2.24A16.032 16.032 0 0 0 9 10.877a16.165 16.165 0 0 0 2.91-4.876L2 6V4h6V2h2zm7.5 10.885L16.253 16h2.492L17.5 12.885z"></path>
              </svg>
              <span>{{ appStore.setting.langs[currentLang]?.name }}</span>
            </button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-for="(v, k) in appStore.setting.langs" :key="k" @click="appStore.changeLang(k)"
                                  :class="{ 'is-current': k === currentLang }" :aria-current="k === currentLang ? 'true' : undefined">
                  <span class="lang-name">{{ v.name }}</span>
                  <el-icon v-if="k === currentLang" class="lang-check"><Check/></el-icon>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-tooltip :content="T(isDark ? 'LightMode' : 'DarkMode')" placement="bottom">
            <button type="button" class="tool-button" :aria-label="T(isDark ? 'LightMode' : 'DarkMode')" @click="isDark = !isDark">
              <el-icon><Sunny v-if="isDark"/><Moon v-else/></el-icon>
            </button>
          </el-tooltip>
        </div>
      </div>
      <header class="auth-heading"><h1>{{ title }}</h1><p v-if="subtitle">{{ subtitle }}</p></header>
      <slot />
    </section>
  </main>
</template>
<script setup>
import { T } from '@/utils/i18n'
import { useAppStore } from '@/store/app'
import { computed } from 'vue'
import { useDark } from '@vueuse/core'
import { Check, Moon, Sunny } from '@element-plus/icons-vue'
defineProps({ title: String, subtitle: String })
// Use the configured admin title and logo, as the header does after sign-in.
const appStore = useAppStore()
// Same preference as the toggle in the admin top bar (stored by useDark).
const isDark = useDark()
// A browser locale such as en-US is not in the list; translations then fall back to English.
const currentLang = computed(() => appStore.setting.langs[appStore.setting.lang] ? appStore.setting.lang : 'en')
</script>
<style scoped lang="scss">
.auth-page {
  min-height: 100vh; min-height: 100svh; box-sizing: border-box;
  display: flex; padding: 40px 20px;
  background: var(--account-page-background);
  color: var(--el-text-color-primary);
}
.auth-top { display: flex; align-items: center; justify-content: space-between; gap: var(--app-space-3); }
.auth-tools { flex: none; display: flex; align-items: center; gap: 2px; margin-right: -8px; } // icons line up with the content edge
.tool-button {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  min-width: 32px; height: 32px; padding: 0 8px; box-sizing: border-box;
  border: 0; border-radius: var(--app-radius); background: transparent;
  color: var(--app-text-muted); font: inherit; font-size: var(--app-text-xs); cursor: pointer;
  transition: background-color .15s, color .15s;
  .el-icon { font-size: 16px; }
  &:hover { background: var(--app-surface-muted); color: var(--app-text); }
  &:focus-visible { outline: 2px solid var(--app-accent); outline-offset: 2px; }
}
.tool-lang span { white-space: nowrap; }
.lang-name { min-width: 96px; }
.lang-check { margin: 0 0 0 12px; color: var(--app-text); }
.is-current { font-weight: 600; color: var(--app-text); }
.auth-card {
  box-sizing: border-box; width: 100%; max-width: 440px; margin: auto;
  padding: 32px; background: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color-lighter); border-radius: var(--account-card-radius);
  box-shadow: var(--account-card-shadow);
}
.auth-brand { min-width: 0; display: flex; align-items: center; gap: var(--app-space-3); font-weight: 600; font-size: var(--app-text-base); line-height: 20px; }
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
  .auth-page { padding: 20px 12px; }
  // Narrow cards: keep just the globe icon for the language menu.
  .tool-lang span { display: none; }
  .auth-card { padding: 24px 20px; }
}
</style>
