<!-- 
标题: Layout/index.vue
功能: 注册页面布局组件
说明: 该组件负责注册页面的整体布局，包括步骤条、身份选择、表单展示和账号注册等。
开发信息: Create by 李刘超 2025-10-14 15:12:21
当前版本: 1.0
-->

<template>
  <div class="layout">
    <Header :large="large" />
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import Header from './Header.vue';
const { large } = defineProps({
  large: {
    type: Boolean,
    default: false
  }
});
</script>

<style scoped lang="scss">
.layout {
  max-width: 1500px;
  min-width: 800px;
  margin: 0 auto;
}
</style>
