<!--
  标题: index.vue
  功能: 个人中心首页 
  说明: 个人中心首页，展示用户个人信息和操作入口
  当前版本: 1.0
  开发信息: Created by 李春雷 2025-11-21
-->
<template>
  <div class="personal-center"></div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const props = defineProps<{
  activeTab: string;
}>();
const activeTab = ref(props.activeTab || 'profile');
</script>

<style scoped lang="scss"></style>
