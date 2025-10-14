<template>
  <div class="login-container">
    <div class="login-header">
      <!-- 登录页面标题 -->
      <h1>全国种子销售服务平台</h1>
    </div>
    <!-- 登录方式切换 -->
    <el-tabs v-model="activeTab" class="login-tabs">
      <!-- 账号密码登录 -->
      <el-tab-pane label="账号密码登录" name="account">
        <div class="form-item">
          <el-input v-model="accountForm.username" placeholder="账号" size="large" />
        </div>
        <div class="form-item">
          <el-input v-model="accountForm.password" type="password" placeholder="密码" size="large" />
        </div>
      </el-tab-pane>
      <!-- 手机号登录 -->
      <el-tab-pane label="手机号登录" name="phone">
        <div class="form-item">
          <el-input v-model="phoneForm.phone" placeholder="手机号" size="large" />
        </div>
        <div class="form-item">
          <el-input v-model="phoneForm.code" placeholder="验证码" size="large">
            <template #append>
              <!-- 获取验证码按钮 -->
              <el-button @click="sendCode" type="primary" size="small" :disabled="countdown > 0">
                {{ countdown > 0 ? `${countdown}s后重试` : '获取验证码' }}
              </el-button>
            </template>
          </el-input>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 记住密码选项 -->
    <div class="form-item align-left">
      <el-checkbox v-model="phoneForm.remember">记住密码</el-checkbox>
    </div>

    <!-- 登录按钮 -->
    <el-button type="primary" size="large" :loading="loading" class="login-button" @click="handleLogin">登录</el-button>

    <!-- 底部链接 -->
    <div class="login-footer flex-between">
      <router-link to="/forgot-password">忘记密码?</router-link>
      <router-link to="/register">立即注册</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
// 引入 Vue 的 ref 函数和 Element Plus 的组件
import { ref, onUnmounted } from 'vue';
import { ElInput, ElCheckbox, ElButton } from 'element-plus';

// 当前激活的登录方式
const activeTab = ref('account');

// 账号密码登录表单数据
const accountForm = ref({
  username: '', // 用户名
  password: '', // 密码
  remember: false // 是否记住密码
});

// 手机号登录表单数据
const phoneForm = ref({
  phone: '', // 手机号
  code: '', // 验证码
  remember: false // 是否记住密码
});

// 登录按钮加载状态
const loading = ref(false);

// 验证码倒计时
const countdown = ref(0);
let timer: NodeJS.Timeout | null = null;

// 登录逻辑
const handleLogin = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    ElMessage.success('登录成功');
  }, 2000);
};

// 发送验证码
const sendCode = () => {
  if (countdown.value > 0) return;

  console.log('发送验证码到', phoneForm.value.phone);
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
};

// 清除定时器（如果组件销毁）
onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<style scoped lang="scss">
.login-container {
  background-color: #f0f8ff;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  margin: 0 auto;
  text-align: center;
}

.login-header {
  margin-bottom: 20px;
}

.logo {
  width: 50px;
  height: 50px;
}

.login-tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.form-item {
  margin-bottom: 15px;

  input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  .code-button {
    margin-top: 10px;
    padding: 5px 10px;
    background-color: #007bff;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
}

.align-left {
  text-align: left;
}

.login-button {
  width: 100%;
}

.login-footer {
  margin-top: 20px;
  a {
    color: #007bff;
  }
}

::v-deep .el-tabs__nav-wrap:after {
  display: none !important;
}
</style>
