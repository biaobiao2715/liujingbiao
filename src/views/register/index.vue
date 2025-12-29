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
        <img src="../../assets/images/logo-white.png" width="32" />
        <div>全国种子销售服务平台</div>
      </div>
    </div>

    <div class="content flex-between">
      <!-- 步骤条，动态展示不同身份的注册流程 -->
      <div class="steps-container">
        <el-steps :active="activeStep" align-center>
          <el-step v-for="(step, index) in computedSteps" :key="index" :title="step.title">
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
          <PurchaserFrom v-if="selectedIdentity === 'buyer'" @nextStep="nextStep" />
          <!-- 供应商注册流程 -->
          <SupplierForm
            v-if="selectedIdentity === 'supplier' || selectedIdentity === 'enterprise'"
            @nextStep="nextStep"
            :selectedIdentity="selectedIdentity"
          />
          <!-- 技术专家注册流程 -->
          <TechnicalExpertForm v-if="selectedIdentity === 'expert'" @nextStep="nextStep" />
          <!-- 法务专家注册流程 -->
          <LegalExpertForm v-if="selectedIdentity === 'legal'" @nextStep="nextStep" />
        </div>
        <!-- 注册成功组件 -->
        <Success :username="username" :account="account" :isBuyer="selectedIdentity === 'buyer'" v-if="activeStep === 3" />
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
import TechnicalExpertForm from './Components/TechnicalExpert.vue';
import LegalExpertForm from './Components/LegalExpert.vue';
import { useRoute } from 'vue-router';
// 引入成功组件
import Success from './Components/Success.vue';
import { computed, onMounted } from 'vue';

// 定义身份类型
export type IdentityType = 'buyer' | 'supplier' | 'enterprise' | 'expert' | 'legal';

const route = useRoute();

const activeStep = ref(1); // 当前步骤

const selectedIdentity = ref<IdentityType>('' as IdentityType); // 当前选择的身份

const username = ref('');

const account = ref('');

const phoneNumber = ref(route.query.phoneNumber); // 获取路由中的手机号参数

// 步骤与图标配置（英文标题），统一按身份生成
const STEP_ICONS = {
  step1: 'step-1.svg',
  step2: 'step-2.svg',
  step4: 'step-4.svg',
  step5: 'step-5.png',
  step6: 'step-6.png',
  buyerSelected: 'buyer-1.png',
  buyerUnselected: 'buyer-2.png',
  supplierSelected: 'supplier-1.png',
  supplierUnselected: 'supplier-2.png',
  enterpriseSelected: 'enterprise-1.png',
  enterpriseUnselected: 'enterprise-2.png',
  expertSelected: 'expert-1.png',
  expertUnselected: 'expert-2.png',
  legalSelected: 'legal-1.png',
  legalUnselected: 'legal-2.png'
} as const;

// 第二步标题按身份映射
const SECOND_TITLES: Record<IdentityType | 'default', string> = {
  default: '填写信息',
  buyer: '填写采购商信息',
  supplier: '填写供应商信息',
  enterprise: '填写企业信息',
  expert: '填写技术专家信息',
  legal: '填写法务专家信息'
};

// 生成第二步图标文件名：identity-1/2.png；默认身份用 step-2
const getStep2Icon = (id: IdentityType | 'default', selected: boolean): string => {
  if (id === 'default') return STEP_ICONS.step2;
  const num = selected ? 1 : 2;
  return `${id}-${num}.png`;
};

const computedSteps = computed(() => {
  const id = (selectedIdentity.value || 'default') as IdentityType | 'default';
  const step1 = { title: '选择身份信息', icon: STEP_ICONS.step1 };
  const step2 = {
    title: SECOND_TITLES[id],
    icon: getStep2Icon(id, activeStep.value >= 2)
  };
  const step3 = {
    title: '申请注册成功',
    icon: activeStep.value >= 3 ? STEP_ICONS.step5 : STEP_ICONS.step6
  };
  return [step1, step2, step3];
});

onMounted(() => {
  // 页面加载时，检查路由参数是否存在手机号
  console.log('注册页面手机号参数:', phoneNumber.value);
  if (phoneNumber.value) {
    selectedIdentity.value = route.query.type as IdentityType;
    handleIdentityUpdate(selectedIdentity.value);
    activeStep.value++;
  }
});

// 统一从 '@/assets/images/' 路径解析图标文件名
const getIcon = (fileName: string) => {
  // 使用相对路径以兼容 Vite 的 import.meta.url 解析
  return new URL(`../../assets/images/${fileName}`, import.meta.url).href;
};

// 更新身份选择
const handleIdentityUpdate = (identity: IdentityType) => {
  if (!identity) {
    nextStep();
    return;
  }
  selectedIdentity.value = identity;

  // 步骤标题已通过 STEPS_MAP 自动匹配，无需手动修改
};

// 下一步逻辑
const nextStep = (info?: { username: string; account: string }) => {
  if (info) {
    username.value = info.username;
    account.value = info.account;
  }
  if (activeStep.value < 3) {
    activeStep.value++;
  }
};
// const setSuccessInfo = (userName: string, accountName: string) => {
//   username.value = userName;
//   account.value = accountName;
// };
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

.step-icon {
  width: 32px;
  height: 32px;
}
</style>
