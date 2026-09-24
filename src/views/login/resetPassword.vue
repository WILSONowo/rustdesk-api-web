<template>
  <AuthShell :title="T('ForgotPassword')">
    <el-result v-if="complete" icon="success" :title="T('PasswordResetSuccess')"><template #extra><el-button type="primary" @click="router.push('/login')">{{ T('Login') }}</el-button></template></el-result>
    <template v-else>
      <el-alert :title="T('PasswordResetHelp')" type="info" :closable="false" />
      <el-alert v-if="!available" :title="T('MailUnavailableHint')" type="warning" :closable="false" />
      <el-form id="reset-password-form" method="post" @submit.prevent="submit" ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item :label="T('Email')" prop="email"><el-input v-model="form.email" autocomplete="email" /></el-form-item>
        <el-form-item :label="T('EmailCode')" prop="code"><email-code purpose="reset" :email="form.email" :disabled="!available" v-model:challenge-id="form.challenge_id" v-model:code="form.code" /></el-form-item>
        <el-form-item :label="T('NewPassword')" prop="new_password"><el-input v-model="form.new_password" type="password" show-password autocomplete="new-password" /></el-form-item>
        <el-form-item :label="T('ConfirmPassword')" prop="confirm_password"><el-input v-model="form.confirm_password" type="password" show-password autocomplete="new-password" /></el-form-item>
        <el-button native-type="submit" class="auth-primary" type="primary" :loading="saving" :disabled="!available || !form.challenge_id">{{ T('ResetPassword') }}</el-button>
        <div class="auth-links"><el-button link @click="router.push('/login')">{{ T('Login') }}</el-button></div>
      </el-form>
    </template>
  </AuthShell>
</template>
<script setup>
import AuthShell from '@/components/authShell.vue'
import { ref, reactive, onMounted, nextTick } from 'vue'
import { onBeforeRouteLeave, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { emailOptions, resetEmailPassword } from '@/api/email'
import EmailCode from '@/components/emailCode.vue'
import { T } from '@/utils/i18n'
const router = useRouter()
const available = ref(false), saving = ref(false), complete = ref(false), formRef = ref(null)
const form = reactive({ email: '', challenge_id: '', code: '', new_password: '', confirm_password: '' })
const rules = {
  email: [{ required: true, type: 'email', message: T('ValidEmailRequired'), trigger: 'blur' }],
  code: [{ required: true, pattern: /^\d{8}$/, message: T('EmailCodeLength'), trigger: 'blur' }],
  new_password: [{ required: true, min: 8, max: 32, message: T('RegistrationPasswordLength'), trigger: 'blur' }],
  confirm_password: [
    { required: true, message: T('ParamRequired', { param: T('ConfirmPassword') }), trigger: 'blur' },
    { validator: (_, value, callback) => callback(!value || value === form.new_password ? undefined : new Error(T('PasswordNotMatchConfirmPassword'))), trigger: 'blur' },
  ],
}
onMounted(async () => { const res = await emailOptions().catch(() => null); available.value = Boolean(res?.data?.available) })
const submit = async () => {
  if (saving.value || !available.value || !form.challenge_id || !await formRef.value.validate().catch(() => false)) return
  saving.value = true
  const res = await resetEmailPassword(form).catch(() => null).finally(() => { saving.value = false })
  if (res) { form.new_password = ''; form.confirm_password = ''; useUserStore().clearSession(); complete.value = true }
}
onBeforeRouteLeave(async () => {
  form.new_password = ''
  form.confirm_password = ''
  await nextTick()
})
</script>
