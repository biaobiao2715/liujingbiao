<!--
      标题: index.vue
      功能: 注册页面
      说明: 注册页面，包含身份选择、采购商/供应商/企业/技术专家/法务专家的注册流程。
      当前版本: 1.0
      开发信息: Created by 李春雷 2025-10-14
    -->
<template>
  <div class="register-container">
    <!-- 大标题 -->
    <div class="title">
      <div class="flex-center gap-8">
        <img src="../../assets/images/logo-white.svg" width="32" />
        <div>全国种子销售服务平台</div>
      </div>
    </div>

    <div class="content flex-between">
      <!-- 步骤条，动态展示不同身份的注册流程 -->
      <div class="steps-container">
        <el-steps :active="activeStep" align-center>
          <el-step v-for="(step, index) in selectedIdentity === 'buyer' ? buyerSteps : steps" :key="index" :title="step.title">
            <template #icon>
              <img :src="getIcon(step.icon)" class="step-icon" />
            </template>
          </el-step>
        </el-steps>
      </div>
      <div class="form-container">
        <!-- 根据当前步骤动态展示对应的组件 -->
        <!-- 身份选择组件 -->
        <Identity @update-identity="handleIdentityUpdate" v-if="activeStep === 1" />
        <div v-else-if="activeStep === 2" class="form-content">
          <!-- 根据选择的身份展示对应的表单组件 -->
          <PurchaserFrom v-if="selectedIdentity === 'buyer'" />
          <!-- 供应商注册流程 -->
          <SupplierForm v-if="selectedIdentity === 'supplier'" />
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
      </div>
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
const steps = ref([
  { title: '选择身份信息', icon: '../../assets/images/step-1.svg' },
  { title: '填写信息', icon: '../../assets/images/step-2.svg' },
  { title: '创建账号', icon: '../../assets/images/step-3.svg' },
  { title: '申请注册成功', icon: '../../assets/images/step-4.svg' }
]);

// 采购商注册流程
const buyerSteps = ref([
  { title: '选择身份信息', icon: '../../assets/images/step-1.svg' },
  { title: '创建账号', icon: '../../assets/images/step-3.svg' },
  { title: '申请注册成功', icon: '../../assets/images/step-4.svg' }
]);

const getIcon = (svgName: string) => {
  return new URL(`${svgName}`, import.meta.url).href;
};

// 更新身份选择
const handleIdentityUpdate = (identity: IdentityType) => {
  if (!identity) {
    nextStep();
    return;
  }
  selectedIdentity.value = identity;

  // 根据选择的身份动态调整步骤条第二步的文字提示
  switch (identity) {
    case 'buyer':
      steps.value[1].title = '填写采购商信息';
      break;
    case 'supplier':
      steps.value[1].title = '填写供应商信息';
      break;
    case 'enterprise':
      steps.value[1].title = '填写企业信息';
      break;
    case 'expert':
      steps.value[1].title = '填写技术专家信息';
      break;
    case 'legal':
      steps.value[1].title = '填写法务专家信息';
      break;
    default:
      break;
  }
};
// 是否展示大标题
const large = computed(() => [1, 2].includes(activeStep.value));

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
  height: 100vh;
  flex-direction: column;
  background: #f7f8fb;
  .title {
    font-weight: bold;
    font-size: 20px;
    padding: 18px 20px;
    color: #ffffff;
    background-color: var(--el-color-primary);
  }
  .content {
    padding: 12px 12%;
    flex-direction: column;
    height: calc(100% - 68px);
    .steps-container {
      background-color: #ffffff;
      padding: 12px 0;
      margin-bottom: 24px;
    }
    .form-container {
      flex: 1;
      overflow: auto;
      background-color: #ffffff;
      .form-content {
        height: 100%;
      }
    }
  }
}

.step01 {
  background: url('../assets/images/step-1.svg') no-repeat center center;
  background-size: cover;
}
</style>
