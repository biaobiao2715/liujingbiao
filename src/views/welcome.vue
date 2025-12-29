<!--
  标题: home.vue
  功能: 欢迎页组件
  说明: 
  当前版本: 1.0
  开发信息: Created by 李春雷 2025-12-15
-->

<template>
  <div class="welcome flex-center-center">
    <div class="title mb-24">欢迎登录全国种子销售服务平台</div>
    <div class="img"></div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.welcome {
  flex-direction: column;
  padding: 68px 10%;
  background-color: #fff;
  .title {
    font-family:
      PingFang SC Bold,
      PingFang SC Bold;
    font-weight: 400;
    font-size: 50px;
    color: #108c58;
  }
  .img {
    width: 100%;
    height: calc(100vh - 380px);
    background: url('@/assets/images/welcome.png') no-repeat center;
    background-size: 100% 100%;
  }
}
</style>
