<!--
          标题: Purchaser.vue
          功能: 采购商表单组件
          说明: 用于采购商在注册时填写其个人信息。
          当前版本: 1.0
          开发信息: Created by 李春雷 2025-10-14
        -->
<template>
  <div class="purchaser-container">
    <!-- 表单，用于填写采购商的注册信息 -->
    <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
      <!-- 采购类型选择 -->
      <el-form-item label="采购类型" prop="purchaseType">
        <el-select v-model="form.purchaseType" placeholder="请选择">
          <el-option v-for="item in typeOptions" :key="item.dictCode" :label="item.dictLabel" :value="item.dictCode" />
        </el-select>
      </el-form-item>
      <!-- 姓名输入 -->
      <el-form-item label="姓名" prop="name">
        <el-input v-model="form.name" placeholder="请输入姓名" />
      </el-form-item>
      <!-- 手机号输入 -->
      <el-form-item label="手机号" prop="phoneNumber">
        <el-input v-model="form.phoneNumber" placeholder="请输入手机号" />
      </el-form-item>
      <!-- 短信验证码输入 -->
      <el-form-item label="短信验证码" prop="smsCode">
        <el-input v-model="form.smsCode" placeholder="请输入验证码" maxlength="6" autocomplete="off">
          <template #append>
            <!-- 发送验证码按钮 -->
            <el-button v-throttle  type="primary" :disabled="countdown > 0" @click="sendCode">
              {{ countdown > 0 ? `${countdown}秒后重试` : '发送验证码' }}
            </el-button>
          </template>
        </el-input>
      </el-form-item>
      <!-- 设置密码 -->
      <el-form-item label="设置密码" prop="password">
        <el-input v-model="form.password" :type="passwordVisible ? 'text' : 'password'" placeholder="请输入密码" autocomplete="off">
          <template #append>
            <div @click="togglePasswordVisibility">
              <el-icon>
                <View v-if="passwordVisible" />
                <Hide v-else />
              </el-icon>
            </div>
          </template>
        </el-input>
      </el-form-item>
      <!-- 确认密码 -->
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input v-model="form.confirmPassword" :type="confirmPasswordVisible ? 'text' : 'password'" placeholder="请再次输入密码" autocomplete="off">
          <template #append>
            <div @click="toggleConfirmPasswordVisibility">
              <el-icon>
                <View v-if="confirmPasswordVisible" />
                <Hide v-else />
              </el-icon>
            </div>
          </template>
        </el-input>
      </el-form-item>
      <!-- 下一步按钮 -->
      <el-form-item>
        <el-button v-throttle  class="next-button" type="primary" @click="submitForm">下一步</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
// 引入 Vue 的 ref 函数和 Element Plus 的消息提示
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { View, Hide } from '@element-plus/icons-vue';
import { getPurchaserTypeDict, registerPurchaser, checkPhoneUnique } from '@/api/register/purchaser';
import { sendSmsCode } from '@/api/register/accountRegiser';
const emit = defineEmits(['nextStep']); // 定义事件

// 表单数据
const form = ref({
  purchaseType: '', // 采购类型
  name: '', // 姓名
  phoneNumber: '', // 手机号
  smsCode: '', // 短信验证码
  password: '', // 密码
  confirmPassword: '' // 确认密码
});
const countdown = ref(0); // 验证码倒计时
let timer: NodeJS.Timeout | null = null;
// 采购类型选项
const typeOptions = ref([]);

// 表单引用
const formRef = ref();

const passwordVisible = ref(false);
const confirmPasswordVisible = ref(false);

// 表单验证规则
const rules = {
  purchaseType: [{ required: true, message: '请选择采购类型', trigger: 'change' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
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
  smsCode: [{ required: false, message: '请输入验证码', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 8, max: 20, message: '密码长度为8-20位', trigger: 'blur' },
    {
      validator: (rule, value) => {
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}:"<>?]).{8,}/.test(value)) {
          return new Error('密码需包含大小写字母、数字和符号中的至少三种');
        }
        return true;
      },
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (rule, value) => {
        if (value !== form.value.password) {
          return new Error('两次输入的密码不一致');
        }
        return true;
      },
      trigger: 'blur'
    }
  ]
};

const togglePasswordVisibility = () => {
  passwordVisible.value = !passwordVisible.value;
};

const toggleConfirmPasswordVisibility = () => {
  confirmPasswordVisible.value = !confirmPasswordVisible.value;
};

onMounted(() => {
  getPurchaserTypeDict('purchaser_type').then((res) => {
    if (res.code === 200) {
      typeOptions.value = res.data || [];
    }
  });
});

// 发送短信验证码
const sendCode = () => {
  if (!form.value.phoneNumber) {
    ElMessage.error('请输入手机号');
    return;
  }
  if (!/^1[3-9]\d{9}$/.test(form.value.phoneNumber)) {
    ElMessage.error('请输入正确的手机号');
    return;
  }

  sendSmsCode(form.value.phoneNumber).then((res) => {
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

// 提交表单
const submitForm = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      // 提交表单逻辑
      registerPurchaser(form.value).then((res) => {
        if (res.code === 200) {
          ElMessage.success('注册成功');
          setTimeout(() => {
            emit('nextStep');
          }, 1000);
        } else {
          ElMessage.error(res.msg || '注册失败');
        }
      });
    } else {
    }
  });
};
</script>

<style scoped lang="scss">
.purchaser-container {
  margin: 0 auto;
  width: 500px;
  padding: 20px;
}

.el-form-item {
  margin-bottom: 20px;
}

.next-button {
  width: 100%;
}
</style>
