<!--
      标题: forgotPassword.vue
      功能: 忘记密码页面
      说明: 用于用户忘记密码时，通过手机号获取短信验证码并重置密码。
      当前版本: 1.0
      开发信息: Created by 李春雷 2025-10-14
    -->
<template>
  <div class="forgot-password">
    <el-form @submit.prevent="handleSubmit" label-width="70px">
      <!-- 手机号输入框 -->
      <el-form-item label="手机号" :error="phoneError">
        <el-input v-model="phone" placeholder="请输入手机号" size="large" />
      </el-form-item>
      <!-- 短信验证码输入框 -->
      <el-form-item label="短信验证" :error="codeError">
        <el-input v-model="code" placeholder="六位短信验证码" maxlength="6" size="large">
          <template #append>
            <!-- 发送验证码按钮 -->
            <el-button type="primary" :disabled="countdown > 0" @click="sendCode">
              {{ countdown > 0 ? `${countdown}秒后重试` : '发送验证码' }}
            </el-button>
          </template>
        </el-input>
      </el-form-item>
      <!-- 设置密码输入框 -->
      <el-form-item label="设置密码" :error="passwordError">
        <el-input v-model="password" type="password" placeholder="输入密码" size="large" />
      </el-form-item>
      <!-- 确认密码输入框 -->
      <el-form-item label="确认密码" :error="confirmPasswordError">
        <el-input v-model="confirmPassword" type="password" placeholder="请再次输入密码" size="large" />
      </el-form-item>
      <!-- 提交按钮 -->
      <el-form-item>
        <el-button type="primary" @click="handleSubmit" class="w-100">提交</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { forgotPwd } from '@/api/login';
import { ElMessage } from 'element-plus';
import { sendSmsCode } from '@/api/register/accountRegiser';

import router from '@/router';
// 定义表单字段及其错误提示
const phone = ref('');
const code = ref('');
const password = ref('');
const confirmPassword = ref('');
const phoneError = ref('');
const codeError = ref(''); // 短信验证码错误提示
const passwordError = ref('');
const confirmPasswordError = ref('');
const countdown = ref(0); // 倒计时状态
let timer: NodeJS.Timeout | null = null;

// 表单提交处理逻辑
const handleSubmit = () => {
  // 验证各字段输入
  phoneError.value = validatePhone(phone.value);
  codeError.value = validateCode(code.value);
  passwordError.value = validatePassword(password.value);
  confirmPasswordError.value = validateConfirmPassword(password.value, confirmPassword.value);

  // 如果没有错误，执行提交逻辑
  if (!phoneError.value && !codeError.value && !passwordError.value && !confirmPasswordError.value) {
    forgotPwd({
      tenantId: '495799',
      phone: phone.value,
      code: code.value,
      password: password.value
    }).then((res) => {
      if (res.code === 200) {
        ElMessage.success('密码重置成功');
        router.push({ name: 'login' }); // 重置成功后跳转到登录页
      } else {
        ElMessage.error(res.msg || '密码重置失败');
      }
    });
  }
};

// 发送验证码
const sendCode = () => {
  if (countdown.value > 0) return;
  if (!phone.value) {
    ElMessage.error('请输入手机号');
    return;
  }
  // 正则表达式验证手机号格式
  const phoneRegex = /^1[3-9]\d{9}$/;
  if (!phoneRegex.test(phone.value)) {
    ElMessage.error('请输入正确的手机号');
    return;
  }

  sendSmsCode(phone.value).then((res) => {
    ElMessage.success('验证码已发送');
    // 模拟发送验证码请求
    countdown.value = 60;
    timer = setInterval(() => {
      if (countdown.value > 0) {
        countdown.value--;
      } else {
        clearInterval(timer!);
        timer = null;
      }
    }, 1000);
  });
};

// // 倒计时逻辑
// const startCountdown = () => {
//   countdown.value = 60; // 设置倒计时为60秒
//   const timer = setInterval(() => {
//     if (countdown.value > 0) {
//       countdown.value--; // 每秒减少1
//     } else {
//       clearInterval(timer); // 倒计时结束时清除定时器
//     }
//   }, 1000);
// };

// 验证手机号格式
const validatePhone = (phone: string): string => {
  if (!phone) return '请输入手机号';
  if (!/^1[3-9]\d{9}$/.test(phone)) return '手机号格式不正确';
  return '';
};

// 验证短信验证码格式
const validateCode = (code: string): string => {
  if (!code) return '请输入短信验证码';
  if (code.length !== 6) return '短信验证码长度为6位';
  return '';
};

// 验证密码格式
const validatePassword = (password: string): string => {
  if (password.length < 8 || password.length > 20) return '密码长度需为8-20位';
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}:"<>?]).{8,}/.test(password)) {
    return '密码需包含大小写字母、数字和符号中的至少三种';
  }
  return '';
};

// 验证确认密码是否一致
const validateConfirmPassword = (password: string, confirmPassword: string): string => {
  if (password !== confirmPassword) return '两次输入的密码不一致';
  return '';
};
</script>

<style scoped lang="scss">
.forgot-password {
  max-width: 460px;
  margin: 0 auto;
  margin-top: 20%;
  background-color: #f0f8ff;
  padding: 20px;
  border-radius: 8px;
}

.error {
  color: red;
  font-size: 12px;
}
.el-form-item {
  margin-bottom: 28px;
}
</style>
