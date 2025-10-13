<template>
  <div class="forgot-password">
    <form @submit.prevent="handleSubmit">
      <div>
        <label for="phone">*手机号</label>
        <input id="phone" v-model="phone" type="text" placeholder="请输入手机号" />
        <p v-if="phoneError" class="error">{{ phoneError }}</p>
      </div>
      <div>
        <label for="code">*短信验证</label>
        <input id="code" v-model="code" type="text" placeholder="六位短信验证码" />
        <button type="button" @click="sendCode">获取短信验证码</button>
      </div>
      <div>
        <label for="password">*设置密码</label>
        <input id="password" v-model="password" type="password" placeholder="输入密码" />
        <p v-if="passwordError" class="error">{{ passwordError }}</p>
      </div>
      <div>
        <label for="confirmPassword">*确认密码</label>
        <input id="confirmPassword" v-model="confirmPassword" type="password" placeholder="请再次输入密码" />
        <p v-if="confirmPasswordError" class="error">{{ confirmPasswordError }}</p>
      </div>
      <button type="submit">提交</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const phone = ref('');
const code = ref('');
const password = ref('');
const confirmPassword = ref('');
const phoneError = ref('');
const passwordError = ref('');
const confirmPasswordError = ref('');

const handleSubmit = () => {
  phoneError.value = validatePhone(phone.value);
  passwordError.value = validatePassword(password.value);
  confirmPasswordError.value = validateConfirmPassword(password.value, confirmPassword.value);

  if (!phoneError.value && !passwordError.value && !confirmPasswordError.value) {
    // 提交逻辑
    console.log('提交成功');
  }
};

const sendCode = () => {
  // 短信验证码发送逻辑
  console.log('发送验证码');
};

const validatePhone = (phone: string): string => {
  if (!phone) return '请输入手机号';
  if (!/^1[3-9]\d{9}$/.test(phone)) return '手机号格式不正确';
  return '';
};

const validatePassword = (password: string): string => {
  if (password.length < 8 || password.length > 20) return '密码长度需为8-20位';
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}:"<>?]).{8,}/.test(password)) {
    return '密码需包含大小写字母、数字和符号中的至少三种';
  }
  if (/password|admin/i.test(password)) return '密码不能包含“password”或“admin”';
  if (/(.)\1{2,}/.test(password)) return '密码不能包含连续3位及以上重复字符';
  if (/(\d{3,}|[a-zA-Z]{3,})/.test(password)) return '密码不能包含连续3位及以上相邻字符';
  if (/(\w{2,})\1/.test(password)) return '密码不能包含2位及以上连续重复型字符';
  return '';
};

const validateConfirmPassword = (password: string, confirmPassword: string): string => {
  if (password !== confirmPassword) return '两次输入的密码不一致';
  return '';
};
</script>

<style scoped lang="scss">
.forgot-password {
  max-width: 400px;
  margin: 0 auto;
}

.error {
  color: red;
  font-size: 12px;
}
</style>
