<!--
  标题: index.vue
  功能:  商城首页
  说明:  商城首页
  当前版本: 1.0
  开发信息: Created by 李春雷 2025-10-27
-->
<template>
  <div>
    <!-- 头部组件 -->
    <HeaderComponent />

    <!-- 搜索组件 -->
    <SearchComponent />

    <!-- Tabs 切换 -->
    <div>
      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
        <el-tab-pane label="全部" name="all"></el-tab-pane>
        <el-tab-pane label="最新" name="demand"></el-tab-pane>
        <el-tab-pane label="价格" name="market"></el-tab-pane>
        <el-tab-pane label="销量" name="expert"></el-tab-pane>
      </el-tabs>
      <div v-if="activeTab === 'home'">
        <GoodsComponent />
      </div>
      <div v-else-if="activeTab === 'demand'">
        <DemandComponent />
      </div>
      <div v-else-if="activeTab === 'market'">
        <MarketComponent />
      </div>
      <div v-else-if="activeTab === 'expert'">
        <ExpertComponent />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import HeaderComponent from './Components/HeaderComponent.vue'; // 头部组件
import SearchComponent from './Components/SearchComponent.vue'; // 搜索组件
import GoodsComponent from './Components/GoodsComponent.vue'; // 首页组件
import DemandComponent from './Components/DemandComponent.vue'; // 需求组件
import MarketComponent from './Components/MarketComponent.vue'; // 市场组件
import ExpertComponent from './Components/ExpertComponent.vue'; // 专家组件

const activeTab = ref('all');

function handleTabClick(tab: any) {
  console.log('切换到:', tab.name);
}
</script>

<style scoped lang="scss">
/* 样式保持不变 */
</style>
