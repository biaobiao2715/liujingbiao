<!--
  标题: index.vue
  功能:  商城首页
  说明:  商城首页
  当前版本: 1.0
  开发信息: Created by 李春雷 2025-10-27
-->
<template>
  <div class="mall-container flex-column">
    <div class="home-content" v-show="showHomeContent">
      <!-- 头部组件 -->
      <HeaderComponent />

      <!-- Tabs 切换 -->
      <div class="tabs-container">
        <el-tabs v-model="activeTab" @tab-click="handleTabClick">
          <el-tab-pane label="首页" name="goods"></el-tab-pane>
          <el-tab-pane label="供需大厅" name="demand"></el-tab-pane>
          <el-tab-pane label="市场行情" name="market"></el-tab-pane>
          <el-tab-pane label="专家学堂" name="expert"></el-tab-pane>
        </el-tabs>
        <div v-if="activeTab === 'goods'">
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
    <PersonalCenterComponent v-show="!showHomeContent" :command="personalCommand" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import HeaderComponent from './Components/HeaderComponent.vue'; // 头部组件
import GoodsComponent from './Components/GoodsComponent.vue'; // 商品组件
import DemandComponent from './Components/DemandComponent.vue'; // 需求组件
import MarketComponent from './Components/MarketComponent.vue'; // 市场组件
import ExpertComponent from './Components/ExpertComponent.vue'; // 专家组件
import PersonalCenterComponent from './personalCenter/index.vue'; // 个人中心组件
import { eventBus } from '@/utils/eventBus';

const activeTab = ref('goods');

const showHomeContent = ref(true);

const personalCommand = ref('');

onMounted(() => {
  eventBus.on('navigateToPersonalCenter', (command: string) => {
    personalCommand.value = command;
    showHomeContent.value = false;
  });
  eventBus.on('showHomeContentChange', (command: boolean) => {
    showHomeContent.value = command;
  });
});

function handleTabClick(tab: any) {
  console.log('切换到:', tab.name);
}
</script>

<style scoped lang="scss">
.mall-container {
}

.tabs-container {
  padding: 12px;
}
</style>
