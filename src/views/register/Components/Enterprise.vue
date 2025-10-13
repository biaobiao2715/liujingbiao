<template>
  <div>企业</div>
  <!-- 提交按钮 -->
  <el-button type="primary" @click="submitForm">提交</el-button>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { defineEmits } from 'vue';

const emit = defineEmits(['nextStep']); // 定义事件

// 提交表单
const submitForm = () => {
  console.log('表单已提交');
  // 表单验证通过后，触发事件通知父组件
  emit('nextStep');
};
</script>

<style scoped lang="scss"></style>
