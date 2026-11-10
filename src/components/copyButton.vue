<template>
  <el-tooltip :content="T('Copy')" placement="top" :show-after="400">
    <el-button class="copy-button" link :icon="CopyDocument" :aria-label="`${T('Copy')} ${text}`" @click.stop="copy"></el-button>
  </el-tooltip>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { CopyDocument } from '@element-plus/icons-vue'
import { copyText } from '@/utils/clipboard'
import { T } from '@/utils/i18n'

const props = defineProps({ text: { type: [String, Number], required: true } })
async function copy () {
  try {
    await copyText(String(props.text))
    ElMessage.success(T('CopySuccess'))
  } catch {
    ElMessage.error(T('CopyFailed'))
  }
}
</script>

<style scoped>
.copy-button { margin-left: 4px; vertical-align: middle; color: var(--el-text-color-secondary); }
</style>
