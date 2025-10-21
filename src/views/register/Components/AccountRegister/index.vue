<!-- 
标题: AccountRegister/index.vue
功能: 账号注册
说明: 
开发信息: Create by 李刘超 2025-10-14 11:22
当前版本: 1.0
-->

<template>
  <div class="account-register">
    <div class="register-form">
      <el-form
        class="register-form-content"
        ref="registerFormRef"
        :model="registerForm"
        :rules="registerRules"
        label-position="right"
        label-width="200px"
      >
        <el-form-item :label="nameLabel" prop="userName" required>
          <el-input v-model="registerForm.userName" placeholder="注册人姓名，填写身份证上的真实姓名，不要填写昵称" />
        </el-form-item>

        <el-form-item v-if="isShowIdCard" label="身份证号" prop="idCard">
          <el-input v-model="registerForm.idCard" placeholder="请输入身份证号" />
        </el-form-item>

        <el-form-item label="手机号" prop="phoneNumber" required>
          <el-input v-model="registerForm.phoneNumber" placeholder="请输入手机号" />
        </el-form-item>

        <el-form-item label="短信验证码" prop="smsCode" required>
          <div class="sms-code-container">
            <el-input v-model="registerForm.smsCode" maxlength="6" placeholder="六位短信验证码" />
            <el-button v-throttle  type="primary" class="sms-code-btn" :disabled="isSendingSms" @click="sendSmsCode">
              {{ smsButtonText }}
            </el-button>
          </div>
        </el-form-item>

        <el-form-item label="设置密码" prop="password" required>
          <el-input v-model="registerForm.password" type="password" placeholder="输入密码，包含8-20位大小写字母、符号或数字两种以上" show-password />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword" required>
          <el-input v-model="registerForm.confirmPassword" type="password" placeholder="请再次输入密码" show-password />
        </el-form-item>

        <el-form-item>
          <el-button v-throttle  type="primary" :loading="loading" class="submit-btn" @click="submitForm">提交</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { FormInstance, FormRules } from 'element-plus';
import { type IdentityType } from '@/views/register/index.vue';
import { storeToRefs } from 'pinia';
import { useRegisterDataStore } from '@/store/modules/registerData';
const { registerData } = storeToRefs(useRegisterDataStore());
import { technicalExpertInfoRegister } from '@/api/register/technicalExpert';
import { legalExpertInfoRegister } from '@/api/register/legalExpert';
import { supplierRegister } from '@/api/register/supplier';
import { enterpriseRegister } from '@/api/register/enterprise';
import { sendSmsCode as sendSmsCodeApi } from '@/api/register/accountRegiser';
import { checkPhoneUnique } from '@/api/register/purchaser';

const loading = ref(false);
const emit = defineEmits(['nextStep', 'setSuccessInfo']);

// 计算属性：是否显示身份证号输入框
const isShowIdCard = computed(() => identity !== 'enterprise' && identity !== 'supplier');
// 计算属性：姓名标签
const nameLabel = computed(() => (identity === 'enterprise' || identity === 'supplier' ? '姓名' : '专家姓名'));
const { identity } = defineProps({
  identity: {
    type: String as PropType<IdentityType>,
    default: ''
  }
});
const registerFormRef = ref<FormInstance>();

// 表单数据
const registerForm = reactive({
  userName: '',
  idCard: '',
  phoneNumber: '',
  smsCode: '',
  password: '',
  confirmPassword: ''
});

// 短信验证码相关
const isSendingSms = ref(false);
const smsCountdown = ref(0);
const smsButtonText = ref('获取验证码');

let smsTimer: NodeJS.Timeout | null = null;

// 发送短信验证码
const sendSmsCode = async () => {
  if (isSendingSms.value) return;

  // 验证手机号
  try {
    await registerFormRef.value?.validateField('phoneNumber');
    // 发送验证码逻辑
    isSendingSms.value = true;
    smsCountdown.value = 60;
    // 倒计时
    smsTimer = setInterval(() => {
      smsCountdown.value--;
      smsButtonText.value = `${smsCountdown.value}秒后重新获取`;
      if (smsCountdown.value <= 0) {
        clearInterval(smsTimer);
        isSendingSms.value = false;
        smsButtonText.value = '获取验证码';
      }
    }, 1000);
    const res = await sendSmsCodeApi(registerForm.phoneNumber);
    if (res.code === 200) {
      ElMessage.success('短信验证码发送成功');
    }
  } catch (error) {
    // 手机号验证失败
    console.error('手机号验证失败', error);
  }
};

// 表单验证规则
const validatePass = (rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请输入密码'));
  } else {
    // 密码强度验证
    const hasLetter = /[a-zA-Z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);

    if (value.length < 8 || value.length > 20) {
      callback(new Error('密码长度应为8-20位'));
    } else if (!(hasLetter && hasNumber) && !(hasLetter && hasSymbol) && !(hasNumber && hasSymbol)) {
      callback(new Error('密码应包含字母、数字、符号中的至少两种'));
    } else {
      if (registerForm.confirmPassword !== '') {
        registerFormRef.value?.validateField('confirmPassword');
      }
      callback();
    }
  }
};

const validateConfirmPass = (rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'));
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致'));
  } else {
    callback();
  }
};

const validateIdCard = (rule: any, value: string, callback: any) => {
  if (value === '') {
    callback();
  } else if (!/^\d{17}[\dXx]$/.test(value)) {
    callback(new Error('请输入正确的身份证号'));
  } else {
    callback();
  }
};

const registerRules = reactive<FormRules>({
  userName: [{ required: true, message: '请输入专家姓名', trigger: 'blur' }],
  phoneNumber: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        checkPhoneUnique(value)
          .then((res) => {
            if (res.code === 200) {
              callback();
            } else {
              callback(new Error('手机号已被注册'));
            }
          })
          .catch(() => {
            callback(new Error('手机号码已存在'));
          });
      },
      trigger: 'blur'
    }
  ],
  smsCode: [{ required: true, message: '请输入短信验证码', trigger: 'blur' }],
  password: [{ validator: validatePass, trigger: 'blur' }],
  confirmPassword: [{ validator: validateConfirmPass, trigger: 'blur' }],
  idCard: [{ validator: validateIdCard, trigger: 'blur', required: false }]
});
// 提交表单
const submitForm = async () => {
  if (!registerFormRef.value) return;
  loading.value = true;
  try {
    await registerFormRef.value.validate();
    const temp = {
      ...registerForm,
      ...registerData.value
    };
    const fun = () => {
      emit('setSuccessInfo', registerForm.userName, registerForm.phoneNumber);
      emit('nextStep');
    };
    // 技术专家
    if (identity === 'expert') {
      const res = await technicalExpertInfoRegister(temp);
      if (res.code === 200) {
        fun();
      }
    } else if (identity === 'legal') {
      // 法务专家
      const res = await legalExpertInfoRegister(temp);
      if (res.code === 200) {
        fun();
      }
    } else if (identity === 'enterprise') {
      // 企业
      registerData.value.enterpriseInfo = {
        ...registerData.value.enterpriseInfo,
        enterpriseType: '1', //注册类型
        reviewStatus: '0', //状态
        loginUserName: registerForm.userName,
        phoneNumber: registerForm.phoneNumber,
        password: registerForm.password
      };
      registerData.value.code = registerForm.smsCode;
      const res = await enterpriseRegister(registerData.value);
      if (res.code === 200) {
        fun();
      }
    } else if (identity === 'supplier') {
      // 供应商
      registerData.value.enterpriseInfo = {
        ...registerData.value.enterpriseInfo,
        enterpriseType: '0', //注册类型
        reviewStatus: '0', //状态
        loginUserName: registerForm.userName,
        phoneNumber: registerForm.phoneNumber,
        password: registerForm.password
      };
      registerData.value.code = registerForm.smsCode;
      const res = await supplierRegister(registerData.value);
      if (res.code === 200) {
        fun();
      }
    }
    // 注册成功后的处理
  } catch (error) {
    console.error('表单验证失败', error);
  } finally {
    loading.value = false;
  }
};
// 清除定时器（如果组件销毁）
onUnmounted(() => {
  if (smsTimer) clearInterval(smsTimer);
});
</script>

<style lang="scss" scoped>
.account-register {
  margin-top: 80px;
  .register-form {
    max-width: 600px;
    margin: 0 auto;
    .register-form-content {
      --el-font-size-base: 13px;
    }
    :deep(.el-form-item__label) {
      font-size: 26px;
      color: #333;
      font-weight: 400;
      &::before {
        color: #f56c6c;
      }
    }

    :deep(.el-input__wrapper) {
      height: 55px;
    }
    :deep(.el-form-item) {
      margin-bottom: 45px;
      align-items: center;
    }
    .sms-code-btn {
      height: 55px;
    }
    .phone-tips {
      margin-top: 5px;
      font-size: 12px;
      color: #f56c6c;

      p {
        margin: 2px 0;
      }
    }

    .sms-code-container {
      display: flex;
      width: 100%;
      .el-input {
        flex: 1;
        --el-input-border-radius: 0px;
      }

      .el-button {
        width: 120px;
        border-radius: 0px;
      }
    }

    .submit-btn {
      width: 100%;
      margin-top: 24px;
      height: 55px;
      border-radius: 5px;
    }
  }
}
</style>
