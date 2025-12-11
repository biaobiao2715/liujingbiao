<!--
  标题: FooterComponents.vue
  功能: 底部组件
  说明: 底部组件，包含版权信息、联系我们等
  当前版本: 1.0
  开发信息: Created by 李春雷 2025-11-26
-->
<template>
  <div class="footer-container">
    <div class="footer-content flex-center-center">
      Copyright 2015-2022 服务有限公司 版权所有  |  police京公网安备 11010202007266号  |  京ICP备07033173号-1  |  经营证照  | 
      经营许可证编号：京ICP证161338号
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
</script>

<style scoped lang="scss">
.footer-container {
  background: #222020;
  color: #fff;
  padding: 40px 0;
  margin-top: 20px;
}
</style>
