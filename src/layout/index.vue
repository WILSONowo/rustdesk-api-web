<template>
  <el-config-provider :locale="appStore.setting.locale.value">
    <el-container class="app-shell" :style="{'--sideBarWidth': sideBarWidth}">
      <el-aside :width="leftWidth" class="app-left">
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
  import { computed, ref, watch } from 'vue'
  import { useRoute } from 'vue-router'
  import { T } from '@/utils/i18n'
  import GAside from '@/layout/components/aside.vue'
  import GHeader from '@/layout/components/header.vue'

  const appStore = useAppStore()
  const route = useRoute()
  const mainContent = ref(null)
  const sideBarWidth = computed(() => appStore.setting.locale.sideBarWidth)
  const leftWidth = computed(() => appStore.setting.sideIsCollapse ? '64px' : 'var(--sideBarWidth)')

  watch(() => route.path, () => {
    mainContent.value?.$el?.scrollTo({ top: 0, left: 0 })
  }, { flush: 'post' })

</script>

<style lang="scss" scoped>
.app-shell {
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
}
.app-header {
  flex-shrink: 0;
  background: var(--el-bg-color-overlay);
  color: var(--el-text-color-primary);
  border-bottom: 1px solid var(--el-border-color-lighter);
  display: flex;
  align-items: center;
  height: 68px;
  gap: 16px;
  padding: 0 28px;
}

.app-left {
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;
  flex-shrink: 0;
  transition: width 0.2s;
  border-right: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color-overlay);
}

.app-container {
  height: 100%;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
}
.app-main {
  padding: 28px;
  min-width: 0;
  min-height: 0;
  overflow: auto;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
}
.page-title { margin: 0 0 24px; font-size: 26px; line-height: 1.3; font-weight: 600; letter-spacing: -.5px; }
@media (max-width: 768px) {
  .app-header { padding: 0 16px; gap: 10px; }
  .app-main { padding: 20px 16px; }
  .page-title { font-size: 22px; margin-bottom: 20px; }
}
</style>


