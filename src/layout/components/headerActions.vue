<template>
  <div class="header-actions">
    <el-tooltip :content="T(isDark ? 'LightMode' : 'DarkMode')" placement="bottom">
      <button type="button" class="icon-button" :aria-label="T(isDark ? 'LightMode' : 'DarkMode')" @click="isDark = !isDark">
        <el-icon><Sunny v-if="isDark"/><Moon v-else/></el-icon>
      </button>
    </el-tooltip>

    <el-dropdown trigger="click" placement="bottom-end">
      <button type="button" class="icon-button" :aria-label="T('Language')" :title="T('Language')">
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path fill="currentColor"
                d="m18.5 10l4.4 11h-2.155l-1.201-3h-4.09l-1.199 3h-2.154L16.5 10h2zM10 2v2h6v2h-1.968a18.222 18.222 0 0 1-3.62 6.301a14.864 14.864 0 0 0 2.336 1.707l-.751 1.878A17.015 17.015 0 0 1 9 13.725a16.676 16.676 0 0 1-6.201 3.548l-.536-1.929a14.7 14.7 0 0 0 5.327-3.042A18.078 18.078 0 0 1 4.767 8h2.24A16.032 16.032 0 0 0 9 10.877a16.165 16.165 0 0 0 2.91-4.876L2 6V4h6V2h2zm7.5 10.885L16.253 16h2.492L17.5 12.885z"></path>
        </svg>
      </button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item v-for="(v, k) in appStore.setting.langs" @click="appStore.changeLang(k)" :key="k"
                            :class="{ 'is-current': k === currentLang }" :aria-current="k === currentLang ? 'true' : undefined">
            <span class="lang-name">{{ v.name }}</span>
            <el-icon v-if="k === currentLang" class="lang-check"><Check/></el-icon>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <span class="divider" aria-hidden="true"></span>

    <el-dropdown trigger="click" placement="bottom-end">
      <button type="button" class="user-button" :aria-label="T('AccountMenu')">
        <span class="avatar" aria-hidden="true">{{ initial }}</span>
        <span class="user-name">{{ user.nickname || user.username }}</span>
        <el-icon class="user-chevron"><ArrowDown/></el-icon>
      </button>
      <template #dropdown>
        <el-dropdown-menu>
          <li class="menu-caption" role="presentation">{{ user.username }}</li>
          <el-dropdown-item :icon="Setting" @click="openAccountSettings">{{ T('AccountSettings') }}</el-dropdown-item>
          <el-dropdown-item :icon="Lock" @click="changePwdVisible = true">{{ T('ChangePassword') }}</el-dropdown-item>
          <el-dropdown-item divided :icon="SwitchButton" @click="logout">{{ T('Logout') }}</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <changePwdDialog v-model:visible="changePwdVisible"></changePwdDialog>
    <account-drawer />
  </div>
</template>

<script setup>
  import { computed, ref } from 'vue'
  import { useDark } from '@vueuse/core'
  import { ArrowDown, Check, Lock, Moon, Setting, Sunny, SwitchButton } from '@element-plus/icons-vue'
  import { useUserStore } from '@/store/user'
  import { useAppStore } from '@/store/app'
  import changePwdDialog from '@/components/changePwdDialog.vue'
  import AccountDrawer from '@/components/accountDrawer.vue'
  import { openAccountSettings } from '@/utils/accountDrawer'
  import { T } from '@/utils/i18n'

  const user = useUserStore()
  const appStore = useAppStore()
  const isDark = useDark()
  const changePwdVisible = ref(false)

  const initial = computed(() => (user.nickname || user.username || '?').trim().charAt(0).toUpperCase())
  // A browser locale such as en-US is not in the list; translations then fall back to English.
  const currentLang = computed(() => appStore.setting.langs[appStore.setting.lang] ? appStore.setting.lang : 'en')

  const logout = async () => {
    if (await user.logout().catch(() => false)) window.location.reload()
  }
</script>

<style lang="scss" scoped>
.header-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: var(--app-space-1);
}
.icon-button, .user-button {
  display: inline-flex;
  align-items: center;
  border: 0;
  background: transparent;
  color: var(--app-text-secondary);
  font: inherit;
  cursor: pointer;
  border-radius: var(--app-radius);
  transition: background-color .15s, color .15s;
  &:hover { background: var(--app-surface-muted); color: var(--app-text); }
  &:focus-visible { outline: 2px solid var(--app-accent); outline-offset: 2px; }
}
.icon-button {
  justify-content: center;
  width: 32px;
  height: 32px;
  .el-icon { font-size: 16px; }
}
.divider {
  width: 1px;
  height: 18px;
  margin: 0 var(--app-space-2);
  background: var(--app-border);
}
.user-button {
  gap: var(--app-space-2);
  height: 34px;
  padding: 0 var(--app-space-2) 0 4px;
}
.avatar {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 999px;
  background: var(--app-accent);
  color: var(--app-accent-contrast);
  font-size: var(--app-text-xs);
  font-weight: 600;
}
.user-name {
  max-width: 140px;
  font-size: var(--app-text-sm);
  font-weight: 500;
  color: var(--app-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.user-chevron { font-size: 12px; color: var(--app-text-muted); }

.menu-caption {
  list-style: none;
  padding: 6px 14px 8px;
  font-size: var(--app-text-xs);
  color: var(--app-text-muted);
  border-bottom: 1px solid var(--app-border);
  margin-bottom: 4px;
}
.lang-name { min-width: 96px; }
.lang-check { margin: 0 0 0 12px; color: var(--app-text); }
.is-current { font-weight: 600; color: var(--app-text); }

// Phones: avatar only, to leave room for the brand.
@media (max-width: 640px) {
  .user-name, .user-chevron, .divider { display: none; }
  .user-button { padding: 0 4px; }
}
</style>
