<!--
      标题: index.vue
      功能: 注册页面
      说明: 注册页面，包含身份选择、采购商/供应商/企业/技术专家/法务专家的注册流程。
      当前版本: 1.0
      开发信息: Created by 李春雷 2025-10-14
    -->
<template>
  <div class="register-container">
    <!-- 步骤条，动态展示不同身份的注册流程 -->
    <el-steps :active="activeStep" align-center>
      <el-step v-for="(step, index) in selectedIdentity === 'buyer' ? buyerSteps : steps" :key="index" :title="step"></el-step>
    </el-steps>

    <!-- 根据当前步骤动态展示对应的组件 -->
    <div v-if="activeStep === 1">
      <!-- 身份选择组件 -->
      <Identity @update-identity="handleIdentityUpdate" />
    </div>
    <div v-else-if="activeStep === 2">
      <!-- 根据选择的身份展示对应的表单组件 -->
      <PurchaserFrom v-if="selectedIdentity === 'buyer'" />
      <!-- 供应商注册流程 -->
      <SupplierForm v-if="selectedIdentity === 'supplier'" @nextStep="nextStep" />
      <!-- 企业注册流程 -->
      <EnterpriseForm v-if="selectedIdentity === 'enterprise'" @nextStep="nextStep" />
      <!-- 技术专家注册流程 -->
      <TechnicalExpertForm v-if="selectedIdentity === 'expert'" @nextStep="nextStep" />
      <!-- 法务专家注册流程 -->
      <LegalExpertForm v-if="selectedIdentity === 'legal'" @nextStep="nextStep" />
    </div>
    <div v-else-if="activeStep === 3">
      <!-- 账号注册组件 -->
      <AccountRegister :identity="selectedIdentity" />
    </div>

    <!-- 下一步按钮，只有在第一步选择身份后才可点击 -->
    <div class="flex-center-center mt-24">
      <el-button type="primary" class="next-step-button" @click="nextStep" :disabled="!selectedIdentity" v-if="activeStep === 1">下一步</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
// 引入 Vue 的 ref 函数
import { ref } from 'vue';

// 引入各个子组件
import Identity from './Components/Identity.vue';
import PurchaserFrom from './Components/Purchaser.vue';
import SupplierForm from './Components/Supplier.vue';
import EnterpriseForm from './Components/Enterprise.vue';
import TechnicalExpertForm from './Components/TechnicalExpert.vue';
import LegalExpertForm from './Components/LegalExpert.vue';
// 账号注册组件
import AccountRegister from './Components/AccountRegister/index.vue';

// 定义身份类型
export type IdentityType = 'buyer' | 'supplier' | 'enterprise' | 'expert' | 'legal';

// 定义当前步骤的状态
const activeStep = ref(1); // 当前步骤
const selectedIdentity = ref<IdentityType>('' as IdentityType); // 当前选择的身份

// 定义步骤标题数组
const steps = ref(['选择身份信息', '填写信息', '创建账号', '申请注册成功']);
// 采购商注册流程
const buyerSteps = ref(['选择身份信息', '创建账号', '申请注册成功']);

// 更新身份选择
const handleIdentityUpdate = (identity: IdentityType) => {
  selectedIdentity.value = identity;

  // 根据选择的身份动态调整步骤条第二步的文字提示
  switch (identity) {
    case 'buyer':
      steps.value[1] = '填写采购商信息';
      break;
    case 'supplier':
      steps.value[1] = '填写供应商信息';
      break;
    case 'enterprise':
      steps.value[1] = '填写企业信息';
      break;
    case 'expert':
      steps.value[1] = '填写技术专家信息';
      break;
    case 'legal':
      steps.value[1] = '填写法务专家信息';
      break;
    default:
      break;
  }
};

// 下一步逻辑
const nextStep = () => {
  if (activeStep.value < (selectedIdentity.value === 'buyer' ? 3 : 4)) {
    activeStep.value++;
  }
};
</script>

<style scoped lang="scss">
.register-container {
  width: 100%;
  padding: 12px;
  flex-direction: column;
}

.el-steps {
  margin-bottom: 24px;
}

.next-step-button {
  width: 300px;
}
</style>
