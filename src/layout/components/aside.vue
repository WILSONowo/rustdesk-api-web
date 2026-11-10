<template>
  <div class="sidebar" :class="{ 'is-collapsed': collapsed }">
    <router-link to="/" class="sidebar-brand" :title="setting.title">
      <img :src="setting.logo" alt="" class="brand-logo">
      <span v-if="!collapsed" class="brand-title">{{ setting.title }}</span>
    </router-link>
    <el-scrollbar class="sidebar-scroll">
      <menus></menus>
    </el-scrollbar>
    <sidebar-footer />
  </div>
</template>

<script setup>
  import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
  import { useRoute } from 'vue-router'
  import Menus from '@/layout/components/menu/index.vue'
  import SidebarFooter from '@/layout/components/sidebarFooter.vue'
  import { useAppStore } from '@/store/app'

  const appStore = useAppStore()
  const setting = computed(() => appStore.setting)
  const mobileMedia = window.matchMedia('(max-width: 768px)')
  const mobile = ref(mobileMedia.matches)
  const updateMobile = () => { mobile.value = mobileMedia.matches }
  onMounted(() => mobileMedia.addEventListener('change', updateMobile))
  onBeforeUnmount(() => mobileMedia.removeEventListener('change', updateMobile))
  const collapsed = computed(() => !mobile.value && setting.value.sideIsCollapse)

  // Keep the current page's menu item visible above the footer, e.g. after a reload deep in the list.
  const route = useRoute()
  const revealActive = () => nextTick(() => {
    document.querySelector('.sidebar-scroll .el-menu-item.is-active')?.scrollIntoView({ block: 'nearest' })
  })
  onMounted(revealActive)
  watch(() => route.name, revealActive)
</script>

<style scoped lang="scss">
.sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--app-bg);
}
.sidebar-brand {
  flex: none;
  display: flex;
  align-items: center;
  gap: 10px;
  height: 72px;
  padding: 0 var(--app-space-4);
  color: var(--app-text);
  text-decoration: none;
  border-radius: var(--app-radius);
  &:focus-visible { outline: 2px solid var(--app-accent); outline-offset: -4px; }
}
.brand-logo { flex: none; width: 28px; height: 28px; border-radius: var(--app-radius); }
.brand-title {
  min-width: 0;
  font-size: var(--app-text-base);
  font-weight: 600;
  line-height: 20px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sidebar-scroll { flex: 1; min-height: 0; }
.is-collapsed .sidebar-brand { justify-content: center; padding: 0; }

// The brand row is shown in the mobile top bar instead.
@media (max-width: 768px) {
  .sidebar-brand { display: none; }
}
</style>
