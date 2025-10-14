<!-- 
标题: Layout/Header.vue
功能: 注册页面布局组件-标题
说明: 该组件负责注册页面的标题布局，包括标题展示和标题样式等。
开发信息: Create by 李刘超 2025-10-14 15:12:21
当前版本: 1.0
-->

<template>
  <div class="header" :style="{ 'height': large ? '100px' : '50px' }">
    <div :class="(large ? 'logo-large' : 'logo') + ' flex-center-center'">logo</div>
    <span :class="large ? 'title-large' : 'title'"> 全国种子销售服务平台 </span>
  </div>
</template>

<script setup lang="ts">
const { large } = defineProps({
  large: {
    type: Boolean,
    default: false
  }
});
</script>

<style scoped lang="scss">
.header {
  border-bottom: 1px solid #0a50b4;
  display: flex;
  align-items: center;
  gap: 10px;
  .logo {
    width: 63px;
    height: 35px;
    border: 1px solid #666;
    border-radius: 4px;
  }
  .logo-large {
    width: 77px;
    height: 53px;
    border: 1px solid #666;
    border-radius: 4px;
  }
  .title-large {
    font-size: 36px;
    font-weight: 400;
    color: #333;
  }
  .title {
    font-size: 20px;
    font-weight: 700;
    color: #333;
  }
}
</style>
