<template>
  <el-dialog v-model="v" :title="T('ChangePassword')" width="min(480px, 94vw)" :show-close="false" :close-on-click-modal="false" @closed="clearPasswords">
    <el-form id="change-password-form" method="post" @submit.prevent="changePassword" ref="cpwd" :model="changePwdForm" :rules="chagePwdRules" label-position="top">
      <input type="hidden" name="username" autocomplete="username" :value="userStore.username" />
      <el-form-item :label="T('OldPassword')" prop="old_password">
        <el-input v-model="changePwdForm.old_password" name="old_password" type="password" autocomplete="current-password" :placeholder="T('For OIDC login without a password, enter any 4-20 letters')" show-password></el-input>
      </el-form-item>
      <el-form-item :label="T('NewPassword')" prop="new_password">
        <el-input v-model="changePwdForm.new_password" name="new_password" type="password" autocomplete="new-password" show-password></el-input>
      </el-form-item>
      <el-form-item :label="T('ConfirmPassword')" prop="confirmPwd">
        <el-input v-model="changePwdForm.confirmPwd" name="confirm_password" type="password" autocomplete="new-password" show-password></el-input>
      </el-form-item>
      <el-form-item>
        <el-button native-type="button" @click="cancelChangePwd">{{ T('Cancel') }}</el-button>
        <el-button native-type="submit" type="primary" :loading="saving">{{ T('Confirm') }}</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script setup>

  import { computed, reactive, ref } from 'vue'
  import { ElMessageBox } from 'element-plus'
  import { changeCurPwd } from '@/api/user'
  import { useUserStore } from '@/store/user'
  import { T } from '@/utils/i18n'

  const props = defineProps({
    visible: Boolean,
  })
  const v = computed({
    get: () => props.visible,
    set: (val) => {
      emit('update:visible', val)
    },
  })
  const emit = defineEmits(['update:visible'])

  // Watch for changes to the prop and emit an event if necessary
  // watch(() => props.visible, (newVal) => {
  //   emit('update:visible', newVal);
  // });
  const showChangePwd = () => {
    emit('update:visible', true)
    changePwdForm.old_password = ''
    changePwdForm.new_password = ''
    changePwdForm.confirmPwd = ''
  }
  const changePwdForm = reactive({
    old_password: '',
    new_password: '',
    confirmPwd: '',
  })
  const chagePwdRules = computed(_ => ({
    old_password: [{ required: true, message: T('ParamRequired', { param: T('OldPassword') }), trigger: 'blur' }],
    new_password: [
      { required: true, message: T('ParamRequired', { param: T('NewPassword') }), trigger: 'blur' },
      {
        validator: (rule, value, callback) => {
          if (value === changePwdForm.old_password) {
            callback(new Error(T('NewPasswordEqualOldPassword'))) //'新密码不能与旧密码相同'
          } else {
            callback()
          }
        },
        trigger: 'blur',
      }],
    confirmPwd: [
      { required: true, message: T('ParamRequired', { param: T('ConfirmPassword') }), trigger: 'blur' },
      {
        validator: (rule, value, callback) => {
          if (value !== changePwdForm.new_password) {
            callback(new Error(T('PasswordNotMatchConfirmPassword')))
          } else {
            callback()
          }
        },
        trigger: 'blur',
      },
    ],
  }))
  const cpwd = ref(null)
  const saving = ref(false)
  const clearPasswords = () => {
    changePwdForm.old_password = ''
    changePwdForm.new_password = ''
    changePwdForm.confirmPwd = ''
    cpwd.value?.clearValidate()
  }
  const cancelChangePwd = () => {
    clearPasswords()
    emit('update:visible', false)
  }

  const userStore = useUserStore()

  const changePassword = async () => {
    if (saving.value) return
    saving.value = true
    try {
      //验证
      const valid = await cpwd.value.validate().catch(_ => false)
      if (!valid) {
        return
      }
      const confirm = await ElMessageBox.confirm(T('Confirm?', { param: T('ChangePassword') }), {
        confirmButtonText: T('Confirm'),
        cancelButtonText: T('Cancel'),
        closeOnClickModal: false,
      }).catch(_ => false)
      if (!confirm) {
        return
      }
      const res = await changeCurPwd(changePwdForm).catch(_ => false)
      if (!res) {
        return
      }
      clearPasswords()
      ElMessageBox.alert(T('OperationSuccess'), T('ChangePassword'), {
        autofocus: true,
        confirmButtonText: 'OK',
        callback: (action) => {
          userStore.clearSession()
          window.location.reload()
        },
      })
    } finally { saving.value = false }
  }
</script>

<style scoped lang="scss">

</style>
