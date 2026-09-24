<template>
  <div class="email-code">
    <el-input :model-value="code" @update:model-value="$emit('update:code', $event)"
              :placeholder="T('EmailCode')" :aria-label="T('EmailCode')" maxlength="8" inputmode="numeric" autocomplete="one-time-code" />
    <el-button :loading="sending" :disabled="disabled || remaining > 0 || !email || (purpose === 'bind' && !password)" @click="send">
      {{ remaining > 0 ? `${remaining}s` : T('SendEmailCode') }}
    </el-button>
  </div>
</template>
<script setup>
import { ref, watch, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { requestEmailCode } from '@/api/email'
import { T } from '@/utils/i18n'
const props = defineProps({ purpose: String, email: String, password: String, challengeId: String, code: String, disabled: Boolean,
  captchaId: String, captcha: String, beforeSend: Function })
const emit = defineEmits(['update:challengeId', 'update:code', 'sendAttempt'])
const sending = ref(false)
const remaining = ref(0)
let timer
watch(() => [props.email, props.password], () => { emit('update:challengeId', ''); emit('update:code', '') })
const send = async () => {
  if (sending.value || remaining.value || props.disabled) return
  sending.value = true
  if (props.beforeSend && !(await props.beforeSend().catch(() => false))) { sending.value = false; return }
  const email = props.email
  const password = props.password
  const res = await requestEmailCode(props.purpose, { email, password, captcha_id: props.captchaId, captcha: props.captcha }).catch(() => null).finally(() => { sending.value = false })
  emit('sendAttempt')
  if (!res) return
  if (email === props.email && password === props.password) emit('update:challengeId', res.data.challenge_id)
  ElMessage.success(T('EmailCodeRequested'))
  remaining.value = res.data.retry_after || 60
  clearInterval(timer)
  timer = setInterval(() => { if (--remaining.value <= 0) clearInterval(timer) }, 1000)
}
onUnmounted(() => clearInterval(timer))
</script>
<style scoped>
.email-code { display: flex; width: 100%; gap: 8px; }
.email-code .el-input { min-width: 0; }
</style>
