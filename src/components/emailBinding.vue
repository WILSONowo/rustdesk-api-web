<template>
  <div class="email-binding">
    <span>{{ user.email || T('NoEmailBound') }}</span>
    <el-tag :type="user.email_verified ? 'success' : 'warning'">{{ T(user.email_verified ? 'EmailVerified' : 'EmailUnverified') }}</el-tag>
    <el-button @click="open">{{ T(user.email_verified ? 'ChangeEmail' : 'VerifyEmail') }}</el-button>
  </div>
  <el-dialog v-model="visible" :title="T('EmailBindingTitle')" width="min(480px, 94vw)" :close-on-click-modal="false" @close="form.password = ''" append-to-body destroy-on-close>
    <el-alert :title="T('EmailBindingHelp')" type="info" :closable="false" />
    <el-alert v-if="!available" :title="T('MailUnavailableHint')" type="warning" :closable="false" />
    <el-form id="email-binding-form" method="post" @submit.prevent="save" :model="form" ref="formRef" label-position="top" :rules="rules">
      <input type="hidden" name="username" autocomplete="username" :value="user.username" />
      <el-form-item :label="T('Email')" prop="email"><el-input v-model="form.email" autocomplete="email" /></el-form-item>
      <el-form-item :label="T('CurrentPassword')" prop="password"><el-input v-model="form.password" type="password" show-password autocomplete="current-password" /></el-form-item>
      <el-form-item :label="T('EmailCode')" prop="code"><email-code purpose="bind" :email="form.email" :password="form.password" :disabled="!available" v-model:challenge-id="form.challenge_id" v-model:code="form.code" /></el-form-item>
    </el-form>
    <template #footer><el-button @click="visible = false">{{ T('Cancel') }}</el-button><el-button type="primary" :loading="saving" :disabled="!available || !form.challenge_id" @click="save">{{ T('Confirm') }}</el-button></template>
  </el-dialog>
</template>
<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'
import { bindEmail, emailOptions } from '@/api/email'
import EmailCode from '@/components/emailCode.vue'
import { T } from '@/utils/i18n'
const user = useUserStore()
const visible = ref(false), available = ref(false), saving = ref(false), formRef = ref(null)
const form = reactive({ email: '', password: '', challenge_id: '', code: '' })
const rules = {
  email: [{ required: true, type: 'email', message: T('ValidEmailRequired'), trigger: 'blur' }],
  password: [{ required: true, message: T('CurrentPassword'), trigger: 'blur' }],
  code: [{ pattern: /^\d{8}$/, required: true, message: T('EmailCodeLength'), trigger: 'blur' }],
}
const open = async () => {
  Object.assign(form, { email: user.email, password: '', challenge_id: '', code: '' })
  available.value = false
  visible.value = true
  const res = await emailOptions().catch(() => null)
  available.value = Boolean(res?.data?.available)
}
const save = async () => {
  if (saving.value || !available.value || !form.challenge_id || !await formRef.value.validate().catch(() => false)) return
  saving.value = true
  const res = await bindEmail(form).catch(() => null).finally(() => { saving.value = false })
  if (res) { form.password = ''; visible.value = false; await user.info(); ElMessage.success(T('EmailBindingSuccess')) }
}
</script>
<style scoped>
.email-binding { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
.el-alert { margin-bottom: 16px; }
</style>
