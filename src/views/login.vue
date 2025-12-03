<template>
  <div class="login-container flex-center-between" @keydown.enter="handleLogin">
    <div class="left-container"></div>
    <div class="right-container">
      <div class="login-header flex-center-center">
        <!-- 登录页面标题 -->
        <img src="../assets/images/logo.svg" width="32" />
        <div>全国种子销售服务平台</div>
      </div>
      <!-- 添加租户选择 -->
      <!-- <el-select v-model="accountForm.tenantId" placeholder="选择租户" size="large">
        <el-option v-for="tenantList in tenants" :key="tenant.tenantId" :label="tenant.companyName" :value="tenant.tenantId" />
      </el-select> -->

      <!-- 登录方式切换 -->
      <el-tabs v-model="activeTab" class="login-tabs">
        <div class="form-item">
          <el-input v-model="accountForm.phone" type="text" placeholder="手机号" size="large" :prefix-icon="UserFilled" />
        </div>
        <!-- 账号密码登录 -->
        <el-tab-pane label="手机号密码登录" name="account">
          <div class="form-item">
            <el-input v-model="accountForm.password" type="password" placeholder="密码" size="large" :prefix-icon="Lock" />
          </div>
          <div class="form-item"></div>
        </el-tab-pane>
        <!-- 手机号登录 -->
        <el-tab-pane label="验证码登录" name="phone">
          <div class="form-item">
            <el-input v-model="accountForm.smsCode" placeholder="验证码" size="large">
              <template #append>
                <!-- 获取验证码按钮 -->
                <el-button v-throttle @click="sendCode" type="primary" size="small" :disabled="countdown > 0">
                  {{ countdown > 0 ? `${countdown}s后重试` : '获取验证码' }}
                </el-button>
              </template>
            </el-input>
          </div>
        </el-tab-pane>
      </el-tabs>

      <!-- 记住密码选项 -->
      <div class="form-item align-left">
        <el-checkbox v-model="accountForm.rememberMe">记住密码</el-checkbox>
      </div>

      <!-- 登录按钮 -->
      <el-button v-throttle type="primary" size="large" :loading="loading" class="login-button" @click="handleLogin">登录</el-button>

      <!-- 底部链接 -->
      <div class="login-footer flex-between">
        <router-link to="/forgot-password">忘记密码?</router-link>
        <router-link to="/register">立即注册</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { to as tos } from 'await-to-js';
import { ElInput, ElCheckbox, ElButton } from 'element-plus';
import { isAccountExist, login, getTenantList, getInfo } from '@/api/login';
import { useUserStore } from '@/store/modules/user';
import { setToken } from '@/utils/auth';
import { UserFilled, Lock } from '@element-plus/icons-vue';
import { sendSmsCode } from '@/api/register/accountRegiser';
import CryptoJS from 'crypto-js'; // 引入加密库
import router from '@/router';
const LoginMethod = {
  '502': 'expert',
  '503': 'legal',
  '504': 'supplier'
};

// 当前激活的登录方式
const activeTab = ref('account');

// 加密密钥
const SECRET_KEY = 'grain_sales_secret_key';

// 账号密码登录表单数据
const accountForm = ref({
  username: '', // 用户名
  password: '', // 密码
  tenantId: '', // 租户ID
  phone: '', // 手机号
  smsCode: '', // 短信验证码
  rememberMe: false // 是否记住密码
});

// 登录按钮加载状态
const loading = ref(false);

// 验证码倒计时
const countdown = ref(0);
let timer: NodeJS.Timeout | null = null;

const tenantList = ref([]); // 租户列表

const tenantMap = ref({}); // 租户映射表

onMounted(() => {
  // 获取租户列表
  initTenantList();

  // 检查是否有保存的账户信息
  const rememberedAccount = localStorage.getItem('rememberedAccount');
  if (rememberedAccount) {
    try {
      const decryptedData = CryptoJS.AES.decrypt(rememberedAccount, SECRET_KEY).toString(CryptoJS.enc.Utf8);
      const accountData = JSON.parse(decryptedData);
      accountForm.value.phone = accountData.phone;
      accountForm.value.password = accountData.password;
      accountForm.value.rememberMe = true;
    } catch (err) {
      console.error('解密失败', err);
    }
  }
});

// 获取租户列表
const initTenantList = async () => {
  const { data } = await getTenantList(true);
  tenantList.value = data.voList;
  tenantMap.value = data.tenantMap;
};

// 登录逻辑
const handleLogin = async () => {
  loading.value = true;
  accountForm.value.username = accountForm.value.phone; // 将手机号赋值给用户名字段
  if (!tenantMap.value || Object.keys(tenantMap.value).length === 0) {
    ElMessage.error('租户列表为空,请刷新页面重试');
    loading.value = false;
    return;
  }

  try {
    if (!validatePhoneNumber()) return; // 校验手机号
    if (!tenantMap.value[accountForm.value.phone]) {
      if (!(await checkAccountStatus())) {
        return; // 校验账号状态
      }
    }

    // 调用登录 API
    login({
      ...accountForm.value,
      tenantId: tenantMap.value[accountForm.value.phone],
      grantType: activeTab.value === 'account' ? 'password' : 'sms',
      clientId: import.meta.env.VITE_APP_CLIENT_ID
    })
      .then(async (res: any) => {
        if (res.code !== 200) {
          ElMessage.error(res.msg || '登录失败,请稍后重试');
          loading.value = false;
          return;
        }
        ElMessage.success('登录成功');
        // 存储 token
        setToken(res.data.access_token);
        // 如果选择记住密码，保存加密后的账户信息
        if (accountForm.value.rememberMe) {
          const encryptedData = CryptoJS.AES.encrypt(
            JSON.stringify({
              phone: accountForm.value.phone,
              password: accountForm.value.password
            }),
            SECRET_KEY
          ).toString();
          localStorage.setItem('rememberedAccount', encryptedData);
        } else {
          // 未选择记住密码时清除本地存储
          localStorage.removeItem('rememberedAccount');
        }
        loading.value = false;
        router.push('/home'); // 所有用户统一跳转门户
      })
      .catch((err) => {
        console.error('登录失败', err);
      });
  } catch (err) {
    console.error('登录失败', err);
    loading.value = false;
  } finally {
    setTimeout(() => {
      loading.value = false;
    }, 5000);
  }
};

// 判断租户是否存在
const checkTenantExist = () => {
  if (tenantMap.value[accountForm.value.phone]) {
    accountForm.value.tenantId = tenantMap.value[accountForm.value.phone];
    return true;
  } else {
    ElMessage.error('该手机号不存在');
    return false;
  }
};

// 校验账号状态
const checkAccountStatus = async () => {
  const phoneNumber = activeTab.value === 'account' ? accountForm.value.username : accountForm.value.phone;
  try {
    const res: any = await isAccountExist(phoneNumber);
    if (res.code === 200) {
      if (res.msg === '502' || res.msg === '503' || res.msg === '504') {
        const data = res.data;
        if (data?.reviewStatus === '0') {
          ElMessage.error('您的注册信息正在审核中，请耐心等待');
          return false;
        } else if (res.data?.reviewStatus === '99') {
          // 弹窗提示重新注册
          ElMessageBox.confirm(`您的注册信息审核未通过，驳回原因：${data?.reviewRemark}`, '提示', {
            confirmButtonText: '修改信息并重新注册',
            showCancelButton: false,
            type: 'warning'
          })
            .then(() => {
              // 点击确认后，跳转到注册页面 并且携带手机号参数
              router.push({
                path: '/register',
                query: {
                  phoneNumber: accountForm.value.phone,
                  type: data.enterpriseType === '1' ? 'enterprise' : LoginMethod[res.msg]
                }
              });
            })
            .catch(() => {});
          return false;
        }
      }
      return false;
    }
    return true;
  } catch (err) {
    return false;
  }
};

// 发送验证码
const sendCode = () => {
  if (!validatePhoneNumber()) return;
  if (countdown.value > 0) return;

  sendSmsCode(accountForm.value.phone).then((res) => {
    ElMessage.success('验证码已发送');
    console.log(res);
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

// 封装一个校验手机号的函数
const validatePhoneNumber = (): boolean => {
  if (!accountForm.value.phone) {
    ElMessage.error('请输入手机号');
    return false;
  }
  // 正则表达式验证手机号格式
  const phoneRegex = /^1[3-9]\d{9}$/;
  if (!phoneRegex.test(accountForm.value.phone)) {
    ElMessage.error('请输入正确的手机号');
    return false;
  }
  return true;
};

// 清除定时器（如果组件销毁）
onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<style scoped lang="scss">
.login-container {
  background-color: #f0f8ff;
  width: 100%;
  height: 100vh;
}

.left-container {
  flex: 2;
  height: 100%;
  background: url('../assets/images/login-bg.png') no-repeat center center;
  background-size: cover;
}

.right-container {
  flex: 1;
  padding: 0 10%;
  .login-header {
    margin-bottom: 20px;
    font-size: 24px;
    font-weight: bold;
    color: #000;
    gap: 8px;
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
    font-size: 14px;
    a:last-child {
      color: var(--el-color-primary);
    }
  }

  ::v-deep .el-tabs__nav-wrap:after {
    display: none !important;
  }

  ::v-deep .el-tabs__nav-scroll {
    display: flex;
    justify-content: center;
  }
  ::v-deep .el-icon.el-input__icon {
    color: var(--el-color-primary);
  }
}
</style>
