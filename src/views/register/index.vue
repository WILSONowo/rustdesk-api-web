<template>
  <AuthShell :title="T('Register')">
      <el-result v-if="pending" icon="success" :title="T('RegistrationSubmitted')" :sub-title="T('PendingApprovalHelp')">
        <template #extra><el-button type="primary" @click="toLogin">{{ T('AlreadyHaveAccountLogin') }}</el-button></template>
      </el-result>
      <el-form v-else id="register-form" method="post" @submit.prevent="submit" ref="f" :model="form" label-position="top" class="login-form" :rules="rules">
        <el-alert :title="T('RegistrationApprovalNotice')" type="info" :closable="false" show-icon />
        <el-alert v-if="mailRequired && !mailReady" :title="T('MailUnavailableHint')" type="warning" :closable="false" show-icon />
        <el-form-item :label="T('Username')" prop="username" :error="identityError('username')">
          <el-input v-model="form.username" name="username" autocomplete="username" class="login-input" :readonly="submitting" @input="clearIdentity('username')" @blur="checkIdentity('username')"></el-input>
          <span v-if="identity.username.state === 'checking' || identity.username.state === 'available'" class="identity-hint" :class="{ available: identity.username.state === 'available' }" aria-live="polite">{{ T(identity.username.state === 'checking' ? 'IdentityChecking' : 'IdentityAvailable') }}</span>
        </el-form-item>

        <el-form-item :label="T('Email')" prop="email" :error="identityError('email')">
          <el-input v-model="form.email" name="email" autocomplete="email" class="login-input" :readonly="submitting" @input="clearIdentity('email')" @blur="checkIdentity('email')"></el-input>
          <span v-if="identity.email.state === 'checking' || identity.email.state === 'available'" class="identity-hint" :class="{ available: identity.email.state === 'available' }" aria-live="polite">{{ T(identity.email.state === 'checking' ? 'IdentityChecking' : 'IdentityAvailable') }}</span>
        </el-form-item>
        <el-form-item :label="T('Captcha')" prop="captcha">
          <captcha-field v-model="form.captcha" :image="captchaImage" :loading="captchaLoading" :disabled="submitting"
                         @refresh="loadCaptcha" />
        </el-form-item>
        <el-form-item v-if="mailRequired" :label="T('EmailCode')" prop="code">
          <email-code purpose="register" :email="form.email" :disabled="!mailReady || submitting || captchaLoading" :before-send="beforeEmailSend"
                      :captcha-id="form.captcha_id" :captcha="form.captcha" @send-attempt="loadCaptcha"
                      v-model:challenge-id="form.challenge_id" v-model:code="form.code" />
        </el-form-item>

        <el-form-item :label="T('Password')" prop="password">
          <el-input v-model="form.password" name="password" type="password" autocomplete="new-password" show-password
                    class="login-input"></el-input>
        </el-form-item>
        <el-form-item :label="T('ConfirmPassword')" prop="confirm_password">
          <el-input v-model="form.confirm_password" name="confirm_password" type="password" autocomplete="new-password" show-password
                    class="login-input"></el-input>
        </el-form-item>
        <div>
          <el-button native-type="submit" :loading="submitting" :disabled="mailRequired && (!mailReady || !form.challenge_id)" class="auth-primary" type="primary">{{ T('Register') }}</el-button>
          <div class="auth-links"><el-button @click="toLogin" link>{{ T('AlreadyHaveAccountLogin') }}</el-button></div>
        </div>
      </el-form>
  </AuthShell>
</template>

<script setup>
  import AuthShell from '@/components/authShell.vue'
  import CaptchaField from '@/components/captchaField.vue'
  import { registrationCaptcha, registrationAvailability } from '@/api/registration'
  import { computed, reactive, ref, onMounted, nextTick } from 'vue'
  import EmailCode from '@/components/emailCode.vue'
  import { emailOptions } from '@/api/email'
  import { T } from '@/utils/i18n'
  import { onBeforeRouteLeave, useRouter } from 'vue-router'
  import { register } from '@/api/user'

  const router = useRouter()
  const pending = ref(false)
  const submitting = ref(false)
  const mailRequired = ref(true)
  const mailReady = ref(false)
  const captchaImage = ref('')
  const captchaLoading = ref(false)
  const loadCaptcha = async () => {
    if (captchaLoading.value) return
    captchaLoading.value = true
    form.captcha = ''
    form.captcha_id = ''
    captchaImage.value = ''
    const res = await registrationCaptcha().catch(() => null).finally(() => { captchaLoading.value = false })
    if (res) { form.captcha_id = res.data.captcha.id; captchaImage.value = res.data.captcha.b64 }
  }
  onMounted(async () => {
    loadCaptcha()
    const res = await emailOptions().catch(() => null)
    if (res) { mailRequired.value = res.data.registration_verification; mailReady.value = res.data.available }
  })
  const form = reactive({
    username: '',
    email: '',
    challenge_id: '',
    code: '',
    password: '',
    confirm_password: '',
    captcha: '',
    captcha_id: '',
  })
  const identity = reactive({ username: { state: '', value: '', seq: 0 }, email: { state: '', value: '', seq: 0 } })
  const clearIdentity = (field) => { identity[field].seq++; identity[field].state = ''; identity[field].value = '' }
  const identityError = (field) => {
    const state = identity[field].state
    return state === 'used' ? T(field === 'username' ? 'RegistrationUsernameUsed' : 'RegistrationEmailUsed') : state === 'error' ? T('IdentityCheckFailed') : ''
  }
  const checkIdentity = async (field, force = false) => {
    const value = form[field]
    if (field === 'username' ? value.replaceAll(' ', '').length < 2 || value.length > 32 : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return false
    const item = identity[field]
    if (!force && item.value === value && item.state === 'available') return true
    const seq = ++item.seq
    item.value = value
    item.state = 'checking'
    const res = await registrationAvailability(field, value).catch(() => null)
    if (seq !== item.seq || value !== form[field]) return false
    item.state = !res ? 'error' : res.data.available ? 'available' : 'used'
    return item.state === 'available'
  }
  const beforeEmailSend = async () => {
    if (!form.captcha_id || !form.captcha.trim()) {
      await f.value.validateField('captcha').catch(() => false)
      return false
    }
    if (!(await f.value.validateField(['username', 'email']).catch(() => false))) return false
    return (await Promise.all([checkIdentity('username'), checkIdentity('email')])).every(Boolean)
  }
  const rules = computed(() => ({
    username: [
      { required: true, message: T('ParamRequired', { param: T('Username') }), trigger: 'blur' },
      { min: 2, max: 32, message: T('RegistrationUsernameLength'), trigger: 'blur' },
    ],
    email: [{ required: mailRequired.value, type: 'email', message: T('ValidEmailRequired'), trigger: 'blur' }],
    code: [{ required: mailRequired.value, pattern: /^\d{8}$/, message: T('EmailCodeLength'), trigger: 'blur' }],
    captcha: [{ required: !mailRequired.value || !form.challenge_id, whitespace: true, message: T('CaptchaPlaceholder'), trigger: 'blur' }],
    password: [
      { required: true, message: T('ParamRequired', { param: T('Password') }), trigger: 'blur' },
      { min: 8, max: 32, message: T('RegistrationPasswordLength'), trigger: 'blur' },
    ],
    confirm_password: [
      { required: true, message: T('ParamRequired', { param: T('ConfirmPassword') }), trigger: 'blur' },
      {
        validator: (rule, value, callback) => {
          if (value !== form.password) {
            callback(new Error(T('PasswordNotMatchConfirmPassword')))
          } else {
            callback()
          }
        }, trigger: 'blur',
      },
    ],
  }))
  const f = ref(null)
  onBeforeRouteLeave(async () => {
    form.password = ''
    form.confirm_password = ''
    await nextTick()
  })
  const submit = async () => {
    if (submitting.value || pending.value || (mailRequired.value && (!mailReady.value || !form.challenge_id))) return
    submitting.value = true
    const v = await f.value.validate().catch(_ => false)
    if (!v) {
      submitting.value = false
      return
    }
    const available = await Promise.all([checkIdentity('username', true), form.email ? checkIdentity('email', true) : Promise.resolve(!mailRequired.value)])
    if (!available.every(Boolean)) { submitting.value = false; return }
    const res = await register(form).catch(_ => false).finally(() => { submitting.value = false })
    if (!res) {
      if (!mailRequired.value) loadCaptcha()
      return
    }
    form.password = ''
    form.confirm_password = ''
    pending.value = true
  }
  const toLogin = () => {
    router.push('/login')

  }
</script>
<style scoped>
.identity-hint { display: block; width: 100%; margin-top: 4px; font-size: 12px; color: var(--el-text-color-secondary); line-height: 1.5; }
.identity-hint.available { color: var(--el-color-success); }
:deep(.el-form-item__error) { position: static; width: 100%; padding-top: 4px; line-height: 1.5; }
</style>
