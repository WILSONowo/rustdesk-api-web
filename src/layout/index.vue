<template>
  <el-config-provider :locale="appStore.setting.locale.value">
    <el-container class="app-shell" :class="{'mobile-nav-open': !appStore.setting.sideIsCollapse}" :style="{'--sideBarWidth': sideBarWidth}">
      <button v-if="!appStore.setting.sideIsCollapse" class="mobile-backdrop" :aria-label="T('ToggleNavigation')" @click="appStore.sideCollapse()"></button>
      <el-aside id="primary-navigation" :width="leftWidth" class="app-left">
        <g-aside></g-aside>
      </el-aside>
      <el-container class="app-container ">
        <el-header class="app-header">
          <g-header></g-header>
        </el-header>
        <el-main ref="mainContent" class="app-main">
          <h1 class="page-title">{{ T(route.meta.title) }}</h1>
          <router-view v-slot="{ Component }">
            <transition mode="out-in" name="el-fade-in-linear">
              <component :is="Component"/>
            </transition>
          </router-view>
        </el-main>
      </el-container>
    </el-container>
  </el-config-provider>
</template>

<script setup>
  import { useAppStore } from '@/store/app'
  import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
  import { useRoute } from 'vue-router'
  import { T } from '@/utils/i18n'
  import GAside from '@/layout/components/aside.vue'
  import GHeader from '@/layout/components/header.vue'

  const appStore = useAppStore()
  const route = useRoute()
  const mainContent = ref(null)
  const mobileMedia = window.matchMedia('(max-width: 768px)')
  const collapseMobileNavigation = () => {
    if (mobileMedia.matches) appStore.setting.sideIsCollapse = true
  }
  onMounted(() => {
    collapseMobileNavigation()
    mobileMedia.addEventListener('change', collapseMobileNavigation)
  })
  onBeforeUnmount(() => mobileMedia.removeEventListener('change', collapseMobileNavigation))
  const sideBarWidth = computed(() => appStore.setting.locale.sideBarWidth)
  const leftWidth = computed(() => appStore.setting.sideIsCollapse ? '64px' : 'var(--sideBarWidth)')

  watch(() => route.path, () => {
    collapseMobileNavigation()
    mainContent.value?.$el?.scrollTo({ top: 0, left: 0 })
  }, { flush: 'post' })

</script>

<style lang="scss" scoped>
.mobile-backdrop { display: none; }
.app-shell {
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
}
.app-header {
  flex-shrink: 0;
  background: var(--app-bg);
  color: var(--app-text);
  border-bottom: 1px solid var(--app-border);
  // Desktop shows the brand and controls in the sidebar; the top bar is for phones only.
  display: none;
  align-items: center;
  height: 56px;
  gap: var(--app-space-3);
  padding: 0 var(--app-space-4);
}

.app-left {
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;
  flex-shrink: 0;
  transition: width 0.2s;
  background: var(--app-bg);
}

.app-container {
  height: 100%;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
}
.app-main {
  // 22px top + 28px title line keeps the page title on the sidebar brand's center line (36px).
  padding: 22px var(--app-space-8) var(--app-space-8);
  min-width: 0;
  min-height: 0;
  overflow: auto;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
}
.page-title { margin: 0 0 var(--app-space-5); font-size: var(--app-text-title); line-height: 28px; font-weight: 600; letter-spacing: -.2px; color: var(--app-text); }
@media (max-width: 768px) {
  .app-left { position: fixed; top: 56px; left: 0; height: calc(100dvh - 56px); width: var(--sideBarWidth) !important; z-index: 1001; transform: translateX(-100%); visibility: hidden; border-right: 1px solid var(--app-border); box-shadow: var(--el-box-shadow); }
  .mobile-nav-open .app-left { transform: translateX(0); visibility: visible; }
  .mobile-backdrop { display: block; position: fixed; inset: 56px 0 0; background: var(--el-mask-color-extra-light); border: 0; z-index: 1000; }

  .app-header { display: flex; }
  .app-main { padding: var(--app-space-5) var(--app-space-4); }
  .page-title { font-size: 18px; line-height: 26px; margin-bottom: var(--app-space-4); }
}
</style>


