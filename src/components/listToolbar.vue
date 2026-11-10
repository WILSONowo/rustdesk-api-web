<template>
  <div class="list-toolbar">
    <div class="list-toolbar__actions" role="toolbar" :aria-label="T('Actions')">
      <slot />
    </div>
    <div v-if="$slots.selection" class="list-toolbar__selection" :class="{ 'is-active': selected > 0 }" aria-live="polite">
      <template v-if="selected > 0">
        <span class="list-toolbar__count">{{ T('SelectedCount', { count: String(selected) }) }}</span>
        <slot name="selection" />
      </template>
      <span v-else class="list-toolbar__hint">{{ T('SelectRowsHint') }}</span>
    </div>
    <div v-if="$slots.extra" class="list-toolbar__extra">
      <slot name="extra" />
    </div>
  </div>
</template>

<script setup>
import { T } from '@/utils/i18n'

defineProps({
  // Number of selected table rows; batch actions are shown only when it is positive.
  selected: { type: Number, default: 0 },
})
</script>

<style scoped lang="scss">
.list-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.list-toolbar__actions, .list-toolbar__selection, .list-toolbar__extra {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  :deep(.el-button) { margin: 0; }
}
.list-toolbar__selection {
  min-height: 40px;
  padding: 0 12px;
  border-radius: 8px;
  &.is-active { background: var(--el-color-primary-light-9); }
}
.list-toolbar__count { font-size: 13px; font-weight: 600; color: var(--el-color-primary); margin-right: 4px; }
.list-toolbar__hint { font-size: 13px; color: var(--el-text-color-placeholder); }
.list-toolbar__extra { margin-left: auto; }
</style>
