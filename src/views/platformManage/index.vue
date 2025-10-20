<!--
  标题: index.vue
  功能: 平台管理首页
  说明: 平台管理首页，展示平台管理相关的功能模块。
  当前版本: 1.0
  开发信息: Created by 李春雷 2025-10-20
-->

<template>
  <div>
    <!-- 头部的面包屑 展示用户的头像和用户名 -->
    <div></div>
    <h1>平台管理首页</h1>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/modules/user';

onMounted(() => {
  console.log('12312312312123');

  getUserInfo();
});

const getUserInfo = async () => {
  const res = await useUserStore().getInfo();
  console.log(res);
};
</script>

<style scoped></style>
