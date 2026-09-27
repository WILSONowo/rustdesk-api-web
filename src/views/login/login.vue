<template>
  <AuthShell :title="T('Login')" :subtitle="T('LoginAccountHelp')">

      <el-form v-if="!disablePwd" id="login-form" method="post" @submit.prevent="login" label-position="top" class="login-form">
        <el-form-item :label="T('Username')">
          <el-input v-model="form.username" id="login-username" name="username" autocomplete="username" :readonly="loggingIn" class="login-input"></el-input>
        </el-form-item>

        <el-form-item :label="T('Password')">
          <el-input v-model="form.password" id="login-password" name="password" type="password" autocomplete="current-password" :readonly="loggingIn" show-password
                    class="login-input"></el-input>
        </el-form-item>
        <el-form-item :label="T('Captcha')" v-if="captchaCode">
          <captcha-field v-model="form.captcha" :image="captchaCode.b64" :loading="captchaLoading"
                         :disabled="loggingIn" @refresh="loadCaptcha" />
        </el-form-item>
        <el-button native-type="submit" :loading="loggingIn" :disabled="captchaLoading" type="primary" class="auth-primary">{{ T('Login') }}</el-button>
        <div class="auth-links">
          <el-button v-if="allowRegister" link type="primary" @click="register">{{ T('Register') }}</el-button>
          <el-button link @click="router.push('/reset-password')">{{ T('ForgotPassword') }}</el-button>
        </div>
      </el-form>

      <div class="divider" v-if="options.length > 0 && !disablePwd">
        <span>{{ T('or login in with') }}</span>
      </div>

      <div class="oidc-options">
        <div v-for="(option, index) in options" :key="index" class="oidc-option">
          <el-button @click="handleOIDCLogin(option.name)" class="oidc-btn">
            <img :src="getProviderImage(option.name)" alt="provider" class="oidc-icon"/>
            <span>{{ T(option.name) }}</span>
          </el-button>
        </div>
      </div>
  </AuthShell>
</template>

<script setup>
  import AuthShell from '@/components/authShell.vue'
  import CaptchaField from '@/components/captchaField.vue'
  import { reactive, onMounted, onBeforeUnmount, nextTick, ref } from 'vue'
  import { useUserStore } from '@/store/user'
  import { useAppStore } from '@/store/app'
  import { ElMessage } from 'element-plus'
  import { T } from '@/utils/i18n'
  import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
  import { offerAuthenticatedPassword } from '@/utils/passwordCredentials.mjs'
  import { login as authenticate } from '@/api/user'
  import { loginOptions, captcha } from '@/api/login'
  import { getCode, removeCode } from '@/utils/auth'

  const oauthInfo = ref({})
  const userStore = useUserStore()
  const route = useRoute()
  const router = useRouter()
  const options = reactive([]) // 存储 OIDC 登录选项

  let platform = window.navigator.platform
  if (navigator.platform.indexOf('Mac') === 0) {
    platform = 'mac'
  } else if (navigator.platform.indexOf('Win') === 0) {
    platform = 'windows'
  } else if (navigator.platform.indexOf('Linux armv') === 0) {
    platform = 'android'
  } else if (navigator.platform.indexOf('Linux') === 0) {
    platform = 'linux'
  }
  const userAgent = navigator.userAgent
  let browser = 'Unknown Browser'
  if (/chrome|crios/i.test(userAgent)) browser = 'Chrome'
  else if (/firefox|fxios/i.test(userAgent)) browser = 'Firefox'
  else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) browser = 'Safari'
  else if (/edg/i.test(userAgent)) browser = 'Edge'

  const form = reactive({
    username: '',
    password: '',
    platform: platform,
    captcha: '',
    captcha_id: ''
  })

  const captchaCode = ref('')
  const captchaLoading = ref(false)
  const loggingIn = ref(false)
  let loginSucceeded = false
  let leaving = false
  const clearUnsubmittedPassword = () => { form.password = ''; form.captcha = '' }
  onBeforeRouteLeave(async () => {
    leaving = true
    if (!loginSucceeded) {
      clearUnsubmittedPassword()
      await nextTick()
    }
  })
  onBeforeUnmount(() => {
    leaving = true
    if (!loginSucceeded) clearUnsubmittedPassword()
  })
  const login = async () => {
    if (loggingIn.value || captchaLoading.value || leaving || !form.username || !form.password) return
    loggingIn.value = true
    const submitted = { ...form }
    const response = await authenticate(submitted).catch(e => e)
    loggingIn.value = false
    if (leaving) { submitted.password = ''; return }
    const res = response?.code === 0 ? response.data : null
    if (res?.token) {
      loginSucceeded = true
      userStore.saveUserData(res)
      useAppStore().loadConfig()
      offerAuthenticatedPassword(res, submitted)
      submitted.password = ''
      ElMessage.success(T('LoginSuccess'))
      const redirect = route.query.redirect
      const target = typeof redirect === 'string' ? router.resolve(redirect) : null
      const allowed = target?.name && (res.route_names?.includes('*') || res.route_names?.includes(target.name))
      router.push({ path: allowed ? redirect : '/', replace: true })
      return
    }
    submitted.password = ''
    clearUnsubmittedPassword()
    if (response?.code === 110 || captchaCode.value) {
      // need captcha
      loadCaptcha()
    }
  }

  const loadCaptcha = async () => {
    if (captchaLoading.value) return
    captchaLoading.value = true
    form.captcha = ''
    form.captcha_id = ''
    const captchaRes = await captcha().catch(_ => false).finally(() => { captchaLoading.value = false })
    if (!captchaRes?.data?.captcha) return
    captchaCode.value = captchaRes.data.captcha
    form.captcha_id = captchaRes.data.captcha.id
  }

  const handleOIDCLogin = (provider) => {
    userStore.oidc(provider, platform, browser)
  }

  import googleImage from '@/assets/google.png'
  import githubImage from '@/assets/github.png'
  import oidcImage from '@/assets/oidc.png'
  import webauthImage from '@/assets/webauth.png'
  import defaultImage from '@/assets/oidc.png'

  const providerImageMap = {
    google: googleImage,
    github: githubImage,
    oidc: oidcImage,
    // WebAuth: webauthImage,
    default: defaultImage,
  }

  const getProviderImage = (provider) => {
    return providerImageMap[provider.toLowerCase()] || providerImageMap.default
  }

  const allowRegister = ref(false)
  const disablePwd = ref(false)
  const loadLoginOptions = async () => {
    try {
      const res = await loginOptions().catch(_ => false)
      if (!res || !res.data) return console.error('No valid response received')
      res.data.ops.map(option => (options.push({ name: option }))) // 创建新的对象数组
      if (res.data.auto_oidc) {
        // 如果有自动OIDC登录选项，直接调用第一个
        handleOIDCLogin(res.data.ops[0])
      }
      disablePwd.value = res.data.disable_pwd
      allowRegister.value = res.data.register
      if (res.data.need_captcha) {
        loadCaptcha()
      }
    } catch (error) {
      console.error('Error loading login options:', error.message)
    }
  }

  onMounted(async () => {
    const code = getCode()
    if (code) {
      // 如果code存在，进行query获取user info
      const res = await userStore.query(code)
      if (res) {
        // 删除code，确保跳转之前对code进行清楚
        removeCode()
        ElMessage.success(T('LoginSuccess'))
        router.push({ path: redirect || '/', replace: true })
      }
    } else {
      // 如果code不存在, 现实登陆页面
      loadLoginOptions() // 组件挂载后调用登录选项加载函数
    }
  })

  const register = () => {
    router.push('/register')
  }
</script>

<style scoped lang="scss">
.divider { display: flex; align-items: center; gap: 12px; margin: 24px 0; font-size: 12px; color: var(--el-text-color-secondary); }
.divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: var(--el-border-color); }
.oidc-options { display: grid; gap: 10px; }
.oidc-btn { width: 100%; }
.oidc-icon { width: 20px; height: 20px; margin-right: 10px; }
</style>
