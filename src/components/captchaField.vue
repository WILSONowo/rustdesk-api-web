<template>
  <div class="captcha-field">
    <div class="captcha-row">
      <el-input :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)"
                :placeholder="T('CaptchaPlaceholder')" :aria-label="T('Captcha')" name="captcha"
                autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="12"
                :disabled="disabled || loading" class="login-input" />
      <button type="button" class="captcha-image" :disabled="disabled || loading"
              :aria-label="T('RefreshCaptcha')" :title="T('RefreshCaptcha')" @click="$emit('refresh')">
        <span v-if="loading">{{ T('CaptchaLoading') }}</span>
        <img v-else-if="image" :src="image" :alt="T('Captcha')" />
        <span v-else>{{ T('RefreshCaptcha') }}</span>
      </button>
    </div>
    <div class="captcha-footer">
      <span v-if="hint">{{ hint }}</span>
      <el-button link type="primary" :disabled="disabled || loading" @click="$emit('refresh')">{{ T('RefreshCaptcha') }}</el-button>
    </div>
  </div>
</template>
<script setup>
import { T } from '@/utils/i18n'
defineProps({ modelValue: String, image: String, loading: Boolean, disabled: Boolean, hint: String })
defineEmits(['update:modelValue', 'refresh'])
</script>
<style scoped>
.captcha-field { width: 100%; }
.captcha-row { display: flex; align-items: stretch; gap: 12px; }
.captcha-row .el-input { flex: 1; min-width: 0; }
.captcha-image { display: flex; align-items: center; justify-content: center; flex: 0 0 144px; height: 50px; padding: 0; overflow: hidden; border: 1px solid var(--el-border-color); border-radius: 12px; background: #fff; color: #536477; cursor: pointer; }
.captcha-image img { display: block; width: 100%; height: 100%; object-fit: contain; }
.captcha-image:hover { border-color: var(--el-color-primary); }
.captcha-image:focus-visible { outline: 2px solid var(--el-color-primary); outline-offset: 3px; }
.captcha-image:disabled { cursor: wait; opacity: .65; }
.captcha-footer { display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 4px 12px; margin-top: 6px; font-size: 12px; line-height: 1.5; color: var(--el-text-color-secondary); }
.captcha-footer .el-button { margin-left: auto; font-size: 12px; }
@media (max-width: 400px) { .captcha-image { flex-basis: 116px; } .captcha-row { gap: 8px; } }
</style>
