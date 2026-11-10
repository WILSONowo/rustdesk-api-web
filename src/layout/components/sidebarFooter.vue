<template>
  <div class="sidebar-footer" :class="{ 'is-collapsed': collapsed }">
    <el-dropdown trigger="click" placement="top-start" class="footer-user">
      <button type="button" class="user-button" :aria-label="T('AccountMenu')" :title="collapsed ? user.username : undefined">
        <span class="avatar" aria-hidden="true">{{ initial }}</span>
        <span v-if="!collapsed" class="user-name">{{ user.nickname || user.username }}</span>
        <el-icon v-if="!collapsed" class="user-more"><MoreFilled/></el-icon>
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

    <div class="footer-tools">
      <el-tooltip :content="T(isDark ? 'LightMode' : 'DarkMode')" :placement="collapsed ? 'right' : 'top'">
        <button type="button" class="tool-button" :aria-label="T(isDark ? 'LightMode' : 'DarkMode')" @click="isDark = !isDark">
          <el-icon><Sunny v-if="isDark"/><Moon v-else/></el-icon>
        </button>
      </el-tooltip>
      <el-dropdown trigger="click" :placement="collapsed ? 'right-end' : 'top-start'">
        <button type="button" class="tool-button" :aria-label="T('Language')" :title="T('Language')">
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path fill="currentColor"
                  d="m18.5 10l4.4 11h-2.155l-1.201-3h-4.09l-1.199 3h-2.154L16.5 10h2zM10 2v2h6v2h-1.968a18.222 18.222 0 0 1-3.62 6.301a14.864 14.864 0 0 0 2.336 1.707l-.751 1.878A17.015 17.015 0 0 1 9 13.725a16.676 16.676 0 0 1-6.201 3.548l-.536-1.929a14.7 14.7 0 0 0 5.327-3.042A18.078 18.078 0 0 1 4.767 8h2.24A16.032 16.032 0 0 0 9 10.877a16.165 16.165 0 0 0 2.91-4.876L2 6V4h6V2h2zm7.5 10.885L16.253 16h2.492L17.5 12.885z"></path>
          </svg>
          <span v-if="!collapsed" class="tool-label">{{ appStore.setting.langs[currentLang]?.name }}</span>
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
      <el-tooltip v-if="!mobile" :content="T(collapsed ? 'ExpandSidebar' : 'CollapseSidebar')" :placement="collapsed ? 'right' : 'top'">
        <button type="button" class="tool-button tool-collapse" :aria-label="T(collapsed ? 'ExpandSidebar' : 'CollapseSidebar')"
                :aria-expanded="!collapsed" aria-controls="primary-navigation" @click="appStore.sideCollapse()">
          <el-icon><Expand v-if="collapsed"/><Fold v-else/></el-icon>
        </button>
      </el-tooltip>
    </div>

    <changePwdDialog v-model:visible="changePwdVisible"></changePwdDialog>
    <account-drawer />
  </div>
</template>

<script setup>
  import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
  import { useDark } from '@vueuse/core'
  import { Check, Expand, Fold, Lock, Moon, MoreFilled, Setting, Sunny, SwitchButton } from '@element-plus/icons-vue'
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

  // On phones the sidebar is an overlay that is either open (full width) or hidden.
  const mobileMedia = window.matchMedia('(max-width: 768px)')
  const mobile = ref(mobileMedia.matches)
  const updateMobile = () => { mobile.value = mobileMedia.matches }
  onMounted(() => mobileMedia.addEventListener('change', updateMobile))
  onBeforeUnmount(() => mobileMedia.removeEventListener('change', updateMobile))
  const collapsed = computed(() => !mobile.value && appStore.setting.sideIsCollapse)

  const initial = computed(() => (user.nickname || user.username || '?').trim().charAt(0).toUpperCase())
  // A browser locale such as en-US is not in the list; translations then fall back to English.
  const currentLang = computed(() => appStore.setting.langs[appStore.setting.lang] ? appStore.setting.lang : 'en')

  const logout = async () => {
    if (await user.logout().catch(() => false)) window.location.reload()
  }
</script>

<style lang="scss" scoped>
.sidebar-footer {
  display: flex;
  flex-direction: column;
  gap: var(--app-space-1);
  padding: var(--app-space-2) var(--app-space-2) var(--app-space-3);
  border-top: 1px solid var(--app-border);
}
.footer-user { display: block; width: 100%; }
.user-button, .tool-button {
  display: flex;
  align-items: center;
  gap: var(--app-space-2);
  border: 0;
  background: transparent;
  color: var(--app-text-secondary);
  font: inherit;
  cursor: pointer;
  border-radius: var(--app-radius);
  transition: background-color .15s, color .15s;
  &:hover { background: var(--app-surface-muted); color: var(--app-text); }
  &:focus-visible { outline: 2px solid var(--app-accent); outline-offset: -2px; }
}
.user-button {
  width: 100%;
  height: 40px;
  padding: 0 var(--app-space-2);
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
  flex: 1;
  min-width: 0;
  text-align: left;
  font-size: var(--app-text-sm);
  font-weight: 500;
  color: var(--app-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.user-more { flex: none; color: var(--app-text-muted); }
.footer-tools {
  display: flex;
  align-items: center;
  gap: 2px;
}
.tool-button {
  height: 30px;
  min-width: 30px;
  padding: 0 7px;
  justify-content: center;
  font-size: var(--app-text-xs);
  .el-icon { font-size: 16px; }
}
.tool-label { white-space: nowrap; }
.tool-collapse { margin-left: auto; }

.is-collapsed {
  align-items: center;
  padding: var(--app-space-2) 0 var(--app-space-3);
  .user-button { width: 40px; justify-content: center; padding: 0; }
  .footer-tools { flex-direction: column; }
  .tool-collapse { margin-left: 0; }
}

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
</style>
