<template>
  <el-sub-menu v-if="visibleChildren(route).length>1"
               :key="route.name"
               :index="route.name"
  >
    <template #title>
      <el-icon v-if="route.meta?.icon">
        <component :is="`el-icon-${route.meta.icon}`"></component>
      </el-icon>
      <span>{{ T(route.meta?.title) || T(route.name) }}</span>
    </template>
    <template v-for="section in sections(route)" :key="section.group || 'default'">
      <el-menu-item-group v-if="section.group" :title="T(section.group)">
        <menu-item v-for="_route in section.routes" :route="_route" :key="_route.name"></menu-item>
      </el-menu-item-group>
      <menu-item v-else v-for="_route in section.routes" :route="_route" :key="_route.name"></menu-item>
    </template>
  </el-sub-menu>
  <el-menu-item v-else-if="!parseRoute(route).meta?.hide" :route="parseRoute(route)" :index="parseRoute(route).name">
    <el-icon v-if="parseRoute(route).meta?.icon">
      <component :is="`el-icon-${parseRoute(route).meta.icon}`"></component>
    </el-icon>
    <span>{{ T(parseRoute(route).meta?.title) || T(parseRoute(route).name) }}</span>
  </el-menu-item>
</template>

<script>
  import { defineComponent } from 'vue'
  import { T } from '@/utils/i18n'

  export default defineComponent({
    name: 'MenuItem',
    props: {
      route: {},
    },
    setup () {
      const visibleChildren = (route) => (route.children || []).filter(c => !c.meta?.hide)
      //判断仅有一个子项的route
      const parseRoute = (route) => {
        const children = visibleChildren(route)
        return children.length === 1 ? children[0] : route
      }
      // Children that declare meta.group are shown under that group heading, in order of first appearance.
      const sections = (route) => {
        const result = []
        for (const child of visibleChildren(route)) {
          const group = child.meta?.group || ''
          let section = result.find(s => s.group === group)
          if (!section) {
            section = { group, routes: [] }
            result.push(section)
          }
          section.routes.push(child)
        }
        return result
      }
      return {
        visibleChildren,
        parseRoute,
        sections,
        T,
      }
    },
  })
</script>
