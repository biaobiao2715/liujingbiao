<!--
  标题: Identity.vue
  功能: 身份选择组件
  说明: 用于用户在注册时选择其身份类型（采购商、供应商、企业、技术专家、法务专家）。
  当前版本: 1.0
  开发信息: Created by 李春雷 2025-10-14
-->
<template>
  <div class="identity-container flex-center-between">
    <div class="flex-center-center gap-12">
      <label class="identity-label">您的身份是</label>
      <el-select v-model="selectedIdentity" placeholder="请选择" class="identity-select" @change="emitIdentity">
        <el-option v-for="option in identityOptions" :key="option.value" :label="option.label" :value="option.value"> </el-option>
      </el-select>
    </div>
    <!-- 下一步按钮，只有在第一步选择身份后才可点击 -->
    <div class="flex-center-center mt-24">
      <el-button v-throttle  type="primary" class="next-step-button" @click="emitIdentity(false)" :disabled="!selectedIdentity">下一步</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { defineEmits } from 'vue';
import { IdentityType } from '@/views/register/index.vue';

const emit = defineEmits(['update-identity']); // 定义事件

const selectedIdentity = ref<IdentityType>('' as IdentityType);
const identityOptions = ref<{ label: string; value: IdentityType }[]>([
  { label: '采购商（农户、合作社、农资店、农场）', value: 'buyer' },
  { label: '供应商', value: 'supplier' },
  { label: '企业（育种机构、科研院所、种子企业、金融与保险机构）', value: 'enterprise' },
  { label: '技术专家', value: 'expert' },
  { label: '法务专家', value: 'legal' }
]);

// 触发事件，将选择的身份值传递给父组件
const emitIdentity = (e: IdentityType | boolean) => {
  emit('update-identity', e);
};
</script>

<style scoped lang="scss">
.identity-container {
  height: 100%;
  padding: 12% 0;
  flex-direction: column;
}
.identity-label {
  font-size: 14px;
  color: #666666;
}

.identity-select {
  width: 300px;
}

.next-step-button {
  width: 300px;
}
</style>
