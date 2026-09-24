<template>
  <button class="ex-icon" :aria-label="T('ToggleNavigation')" @click="expandOrFoldSlider">
    <el-icon>
    <el-icon-expand v-if="setting.sideIsCollapse"></el-icon-expand>
    <el-icon-fold v-else></el-icon-fold>
    </el-icon>
  </button>
  <div class="header-logo">
    <img :src="setting.logo" alt="" class="logo">
    <div class="title">{{setting.title}}</div>
  </div>
  <Setting></Setting>
</template>

<script>
  import { defineComponent, computed } from 'vue'
  import HeaderMenu from '@/layout/components/menu/index.vue'
  import Setting from '@/layout/components/setting/index.vue'
  import { useAppStore } from '@/store/app'
  import { T } from '@/utils/i18n'
  import GTags from '@/layout/components/tags/index.vue'

  export default defineComponent({
    name: 'LayerHeader',
    created () {
    },
    components: { HeaderMenu, Setting, GTags },
    watch: {},
    setup (props) {
      const appStore = useAppStore()
      const setting = computed(() => appStore.setting)
      const expandOrFoldSlider = () => {
        appStore.sideCollapse()
      }
      return {
        T,
        setting,
        expandOrFoldSlider,
      }
    },

  })
</script>

<style scoped lang="scss">
  .ex-icon {
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    border: none;
    border-radius: 8px;
    color: var(--el-text-color-regular);
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    cursor: pointer;
    &:hover { background: var(--el-fill-color-light); }
    &:focus-visible { outline: 2px solid var(--el-color-primary); outline-offset: 2px; }
  }

  .header-logo {
    display: flex;
    height: 100%;
    align-items: center;
    min-width: 0;

    .title {
      display: block;
      margin-left: 10px;
      font-weight: 600;
      font-size: 16px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .logo {
      display: block;
      width: 36px;
      height: 36px;
      border-radius: 10px;
    }
  }


  @media (max-width: 640px) {
    .header-logo .title { display: none; }
  }
</style>
<style lang="scss">

</style>
