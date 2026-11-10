<template>
  <el-menu
          class="menus"
          :collapse="isCollapse"
          :default-active="activeIndex"
          :default-openeds="openedSections"
          background-color="var(--el-bg-color-overlay)"
          text-color="var(--el-text-color-regular)"
          active-text-color="var(--el-color-primary)"
          router
  >
    <menu-item v-for="(route,index) in routes" :key="route.name" :route="route"></menu-item>
  </el-menu>
</template>

<script>
  import { defineComponent, ref, onMounted, watch, computed } from 'vue'
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
      const isCollapse = computed(() => app.setting.sideIsCollapse)
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
    min-height: 100%;
    width: 100%;
    border-right: none;
    padding: 16px 0;
    box-sizing: border-box;
    &:not(.el-menu--collapse) {
      width: 100%;
    }

    :deep(.el-menu-item), :deep(.el-sub-menu__title) {
      min-width: 0;
      height: 44px;
      line-height: 44px;
      margin: 4px 8px;
      border-radius: 8px;
    }
    :deep(.el-menu-item-group__title) {
      padding: 14px 0 4px 28px !important;
      font-size: 12px;
      line-height: 16px;
      color: var(--el-text-color-placeholder);
    }
    :deep(.el-menu-item.is-active) {
      background: var(--el-color-primary-light-9);
      font-weight: 600;
    }
    :deep(.el-sub-menu__title:hover), :deep(.el-menu-item:hover) {
      background: var(--el-fill-color-light);
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
    }
  }
</style>
<style>
</style>
