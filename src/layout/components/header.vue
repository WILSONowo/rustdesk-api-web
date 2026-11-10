<template>
  <button class="ex-icon" :aria-expanded="!setting.sideIsCollapse" aria-controls="primary-navigation" :aria-label="T('ToggleNavigation')" @click="appStore.sideCollapse()">
    <el-icon>
      <el-icon-expand v-if="setting.sideIsCollapse"></el-icon-expand>
      <el-icon-fold v-else></el-icon-fold>
    </el-icon>
  </button>
  <router-link to="/" class="header-logo">
    <img :src="setting.logo" alt="" class="logo">
    <span class="title">{{ setting.title }}</span>
  </router-link>
</template>

<script setup>
  // Top bar shown on phones only; on wider screens the brand and controls live in the sidebar.
  import { computed } from 'vue'
  import { useAppStore } from '@/store/app'
  import { T } from '@/utils/i18n'

  const appStore = useAppStore()
  const setting = computed(() => appStore.setting)
</script>

<style scoped lang="scss">
  .ex-icon {
    width: 34px;
    height: 34px;
    flex-shrink: 0;
    border: none;
    border-radius: var(--app-radius);
    color: var(--app-text-secondary);
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    cursor: pointer;
    &:hover { background: var(--app-surface-muted); color: var(--app-text); }
    &:focus-visible { outline: 2px solid var(--app-accent); outline-offset: 2px; }
  }

  .header-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
    height: 100%;
    color: var(--app-text);
    text-decoration: none;

    .logo {
      flex: none;
      width: 28px;
      height: 28px;
      border-radius: var(--app-radius);
    }

    .title {
      font-weight: 600;
      font-size: var(--app-text-base);
      line-height: 20px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
</style>
