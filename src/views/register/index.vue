<template>
  <!-- 步骤条 -->
  <el-steps :active="activeStep" align-center>
    <el-step title="选择身份信息"></el-step>
    <el-step title="填写基础信息"></el-step>
    <el-step title="账号注册"></el-step>
    <el-step title="申请注册成功"></el-step>
  </el-steps>

  <!-- 动态展示组件 -->
  <div v-if="activeStep === 1">
    <Identity @update-identity="handleIdentityUpdate" />
  </div>
  <div v-else-if="activeStep === 2">
    <PurchaserFrom v-if="selectedIdentity === 'buyer'" />
    <SupplierForm v-if="selectedIdentity === 'supplier'" />
    <EnterpriseForm v-if="selectedIdentity === 'enterprise'" @nextStep="nextStep" />
    <TechnicalExpertForm v-if="selectedIdentity === 'expert'" @nextStep="nextStep" />
    <LegalExpertForm v-if="selectedIdentity === 'legal'" />
  </div>

  <!-- 下一步按钮 -->
  <el-button type="primary" @click="nextStep" :disabled="!selectedIdentity" v-if="activeStep === 1">下一步</el-button>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import Identity from './Components/Identity.vue'; // 引入身份选择组件
import PurchaserFrom from './Components/Purchaser.vue'; // 引入采购商表单组件
import SupplierForm from './Components/Supplier.vue'; // 引入供应商表单组件
import EnterpriseForm from './Components/Enterprise.vue'; // 引入企业表单组件
import TechnicalExpertForm from './Components/TechnicalExpert.vue'; // 引入技术专家表单组件
import LegalExpertForm from './Components/LegalExpert.vue'; // 引入法务专家表单组件

const activeStep = ref(1); // 当前步骤
const selectedIdentity = ref(''); // 选择的身份

// 更新身份值
const handleIdentityUpdate = (identity: string) => {
  selectedIdentity.value = identity;
};

// 下一步
const nextStep = () => {
  if (activeStep.value < 3) {
    activeStep.value++;
  }
};
</script>

<style scoped lang="scss">
.el-steps {
  margin-bottom: 24px;
}
</style>
