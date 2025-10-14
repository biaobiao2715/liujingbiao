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
      <el-form-item label="采购类型" prop="type">
        <el-select v-model="form.type" placeholder="请选择">
          <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <!-- 姓名输入 -->
      <el-form-item label="姓名" prop="name">
        <el-input v-model="form.name" placeholder="请输入姓名" />
      </el-form-item>
      <!-- 手机号输入 -->
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="form.phone" placeholder="请输入手机号" />
      </el-form-item>
      <!-- 短信验证码输入 -->
      <el-form-item label="短信验证码" prop="smsCode">
        <el-input v-model="form.smsCode" placeholder="请输入验证码" maxlength="6">
          <template #append>
            <!-- 获取验证码按钮 -->
            <el-button @click="sendSmsCode">获取短信验证码</el-button>
          </template>
        </el-input>
      </el-form-item>
      <!-- 设置密码 -->
      <el-form-item label="设置密码" prop="password">
        <el-input v-model="form.password" type="password" placeholder="请输入密码" />
      </el-form-item>
      <!-- 确认密码 -->
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input v-model="form.confirmPassword" type="password" placeholder="请再次输入密码" />
      </el-form-item>
      <!-- 下一步按钮 -->
      <el-form-item>
        <el-button class="next-button" type="primary" @click="submitForm">下一步</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
// 引入 Vue 的 ref 函数和 Element Plus 的消息提示
import { ref } from 'vue';
import { ElMessage } from 'element-plus';

// 表单数据
const form = ref({
  type: '', // 采购类型
  name: '', // 姓名
  phone: '', // 手机号
  smsCode: '', // 短信验证码
  password: '', // 密码
  confirmPassword: '' // 确认密码
});

// 采购类型选项
const typeOptions = [
  { label: '农户', value: 'farmer' },
  { label: '农场', value: 'farm' },
  { label: '农村合作社', value: 'cooperative' },
  { label: '农资店', value: 'store' },
  { label: '其他', value: 'other' }
];

// 表单验证规则
const rules = {
  type: [{ required: true, message: '请选择采购类型', trigger: 'change' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  smsCode: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 8, max: 20, message: '密码长度为8-20位', trigger: 'blur' }
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

// 表单引用
const formRef = ref();

// 发送短信验证码
const sendSmsCode = () => {
  if (!form.value.phone || !/^1[3-9]\d{9}$/.test(form.value.phone)) {
    ElMessage.error('请输入正确的手机号');
    return;
  }
  // 模拟发送短信验证码
  ElMessage.success('验证码已发送');
};

// 提交表单
const submitForm = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success('表单验证通过');
      // 提交表单逻辑
    } else {
      ElMessage.error('表单验证失败');
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
