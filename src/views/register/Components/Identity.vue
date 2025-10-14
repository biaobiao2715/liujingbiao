<!--
  标题: Identity.vue
  功能: 身份选择组件
  说明: 用于用户在注册时选择其身份类型（采购商、供应商、企业、技术专家、法务专家）。
  当前版本: 1.0
  开发信息: Created by 李春雷 2025-10-14
-->
<template>
  <div class="identity-container flex-center-center">
    <label for="identity-select" class="identity-label">您的身份是：</label>
    <el-select v-model="selectedIdentity" placeholder="请选择" class="identity-select" @change="emitIdentity">
      <el-option v-for="option in identityOptions" :key="option.value" :label="option.label" :value="option.value"> </el-option>
    </el-select>
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
const emitIdentity = (e: IdentityType) => {
  emit('update-identity', e);
};
</script>

<style scoped lang="scss">
.identity-label {
  width: 160px;
  font-size: 16px;
  color: #007bff;
  margin-bottom: 8px;
}

.identity-select {
  width: 100%;
}
</style>
