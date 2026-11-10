<template>
  <el-tooltip :content="toggleLabel" placement="bottom" :show-after="400">
    <button class="ex-icon" :aria-expanded="!setting.sideIsCollapse" aria-controls="primary-navigation" :aria-label="toggleLabel" @click="appStore.sideCollapse()">
      <el-icon>
        <el-icon-expand v-if="setting.sideIsCollapse"></el-icon-expand>
        <el-icon-fold v-else></el-icon-fold>
      </el-icon>
    </button>
  </el-tooltip>
  <!-- On wider screens the brand sits at the top of the sidebar. -->
  <router-link to="/" class="header-logo">
    <img :src="setting.logo" alt="" class="logo">
    <span class="title">{{ setting.title }}</span>
  </router-link>
  <header-actions />
</template>

<script setup>
  import { computed } from 'vue'
  import { useAppStore } from '@/store/app'
  import { T } from '@/utils/i18n'
  import HeaderActions from '@/layout/components/headerActions.vue'

  const appStore = useAppStore()
  const setting = computed(() => appStore.setting)
  const toggleLabel = computed(() => T(setting.value.sideIsCollapse ? 'ExpandSidebar' : 'CollapseSidebar'))
</script>

<style scoped lang="scss">
  .ex-icon {
    width: 32px;
    height: 32px;
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
    display: none;
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

  @media (max-width: 768px) {
    .header-logo { display: flex; }
  }
</style>
