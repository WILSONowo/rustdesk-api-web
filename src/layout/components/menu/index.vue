<template>
  <el-menu
          class="menus"
          :collapse="isCollapse"
          :collapse-transition="false"
          :default-active="activeIndex"
          :default-openeds="openedSections"
          background-color="var(--app-bg)"
          text-color="var(--app-text-secondary)"
          active-text-color="var(--app-text)"
          router
  >
    <menu-item v-for="(route,index) in routes" :key="route.name" :route="route"></menu-item>
  </el-menu>
</template>

<script>
  import { defineComponent, ref, onMounted, onBeforeUnmount, computed } from 'vue'
  import { useRouteStore } from '@/store/router'
  import MenuItem from '@/layout/components/menu/item.vue'
  import { useRoute } from 'vue-router'
  import { useAppStore } from '@/store/app'

  export default defineComponent({
    name: 'Menu',
    created () {
    },
    components: { MenuItem },
    setup () {
      const routes = ref([])
      const route = useRoute()
      const app = useAppStore()
      // On phones the sidebar is a hidden-or-full-width overlay, so the menu never uses icon-only mode.
      const mobileMedia = window.matchMedia('(max-width: 768px)')
      const mobile = ref(mobileMedia.matches)
      const updateMobile = () => { mobile.value = mobileMedia.matches }
      onMounted(() => mobileMedia.addEventListener('change', updateMobile))
      onBeforeUnmount(() => mobileMedia.removeEventListener('change', updateMobile))
      const isCollapse = computed(() => !mobile.value && app.setting.sideIsCollapse)
      const activeIndex = computed(() => route.name)
      // Open the section that contains the current page, e.g. after a reload.
      const openedSections = computed(() => route.matched.length > 1 && route.matched[0].name ? [route.matched[0].name] : [])

      routes.value = useRouteStore().routes
      return {
        routes,
        activeIndex,
        openedSections,
        isCollapse,
      }
    },

  })
</script>

<style lang="scss" scoped>
  .menus {
    --el-menu-item-height: 34px;
    --el-menu-sub-item-height: 34px;
    --el-menu-item-font-size: var(--app-text-sm);
    --el-menu-base-level-padding: 12px;
    --el-menu-level-padding: 12px;
    --el-menu-icon-width: 18px;
    --el-menu-hover-bg-color: var(--app-surface-muted);
    min-height: 100%;
    width: 100%;
    border-right: none;
    padding: var(--app-space-2) 0 var(--app-space-4);
    box-sizing: border-box;
    background: transparent;

    :deep(.el-menu) { background: transparent; }
    :deep(.el-menu-item), :deep(.el-sub-menu__title) {
      min-width: 0;
      height: 34px;
      line-height: 34px;
      margin: 2px var(--app-space-2);
      border-radius: var(--app-radius);
      font-size: var(--app-text-sm);
      font-weight: 500;
      .el-icon { font-size: 16px; width: 18px; margin-right: 10px; color: var(--app-text-muted); }
    }
    // Top-level sections ("My", "System") read as quiet headings.
    :deep(.el-sub-menu__title) {
      color: var(--app-text);
      font-weight: 600;
      .el-icon { color: var(--app-text-secondary); }
    }
    :deep(.el-sub-menu .el-menu-item) { padding-left: 40px !important; }
    :deep(.el-sub-menu__icon-arrow) { font-size: 12px; color: var(--app-text-muted); }
    :deep(.el-menu-item-group__title) {
      display: flex;
      align-items: center;
      gap: 6px;
      // Bar lines up with the item icons below (8px margin + 40px indent).
      padding: 12px 0 4px 48px !important;
      font-size: var(--app-text-xs);
      line-height: 16px;
      font-weight: 500;
      color: var(--app-text-muted);
      &::before {
        content: '';
        flex: 0 0 3px;
        height: 10px;
        border-radius: 2px;
        background: var(--app-border-strong);
      }
    }
    :deep(.el-sub-menu__title:hover), :deep(.el-menu-item:hover) {
      background: var(--app-surface-muted);
      color: var(--app-text);
    }
    :deep(.el-menu-item.is-active) {
      background: var(--app-nav-active-bg);
      box-shadow: var(--app-nav-active-shadow);
      color: var(--app-text);
      font-weight: 600;
      .el-icon { color: var(--app-text); }
    }
    &.el-menu--collapse {
      :deep(.el-menu-item), :deep(.el-sub-menu__title) {
        padding: 0 !important;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      :deep(.el-menu-tooltip__trigger) {
        padding: 0 !important;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      :deep(.el-icon) { margin-right: 0; }
      :deep(.el-sub-menu__icon-arrow) { display: none; }
    }
  }
</style>
