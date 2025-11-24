<!--
  标题: index.vue
  功能: 个人中心首页 
  说明: 个人中心首页，展示用户个人信息和操作入口
  当前版本: 1.0
  开发信息: Created by 李春雷 2025-11-21
-->
<template>
  <div class="personal-center flex gap-24">
    <!-- 左侧菜单 -->
    <div class="left-menu">
      <div class="header">
        <div class="title">个人中心</div>
      </div>
      <div class="menu-list">
        <div class="menu-item" :class="{ 'active': activeTab === item.value }" @click="activeTab = item.value" v-for="item in menuList">
          {{ item.label }}
        </div>
      </div>
    </div>
    <!-- 右侧内容区域 -->
    <div class="right-content">
      <MyCollections v-show="activeTab === 'collections'"></MyCollections>
      <MyApplications v-show="activeTab === 'applications'"></MyApplications>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const props = defineProps<{
  activeTab: string;
}>();

const MyCollections = defineAsyncComponent(() => import('./MyCollections.vue')); // 我的收藏组件
const MyApplications = defineAsyncComponent(() => import('./CreditApplication.vue')); // 信贷申请管理组件

const activeTab = ref(props.activeTab || 'collections');

const menuList = ref([
  {
    label: '我的收藏',
    value: 'collections'
  },
  {
    label: '信用申请管理',
    value: 'applications'
  }
]);
</script>

<style scoped lang="scss">
.personal-center {
  height: calc(100vh - 200px);
}

.left-menu {
  height: 100%;
  width: 210px;
  background-color: #fff;
  border-radius: 8px;
}

.right-content {
  width: calc(100% - 234px);
  height: 100%;
  background-color: #fff;
  border-radius: 8px;
}

.header {
  padding: 20px;
  border-bottom: 1px solid #d8d8d8;
}

.title {
  height: 20px;
  line-height: 20px;
  font-size: 20px;
  font-weight: 500;
  color: #000000;
  border-left: 3px solid #108c58;
  padding-left: 12px;
}

.menu-list {
  padding: 20px;
}

.menu-item {
  padding: 12px 20px;
  color: #3d3d3d;
  font-size: 14px;
  font-weight: 400;
  cursor: pointer;
}

.active {
  color: #108c58;
  border-radius: 8px;
  background: rgba(16, 140, 88, 0.1);
}
</style>
