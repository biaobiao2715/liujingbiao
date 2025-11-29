<!--
  标题: index.vue
  功能:  商城首页
  说明:  商城首页
  当前版本: 1.0
  开发信息: Created by 李春雷 2025-10-27
-->
<template>
  <div class="mall-container flex-column">
    <div class="home-content">
      <!-- 头部组件 -->
      <HeaderComponent />

      <!-- Tabs 切换 -->
      <div class="tabs-container flex-center gap-24">
        <!-- <el-tabs v-model="activeTab" @tab-click="handleTabClick">
          <el-tab-pane label="首页" name="goods"></el-tab-pane>
          <el-tab-pane label="供需大厅" name="demand"></el-tab-pane>
          <el-tab-pane label="市场行情" name="market"></el-tab-pane>
          <el-tab-pane label="专家学堂" name="expert"></el-tab-pane>
        </el-tabs> -->
        <div v-for="item in tabs" :key="item.name" :class="['tab-item', { 'is-active': activeTab === item.name }]" @click="handleTabClick(item.name)">
          {{ item.label }}
        </div>
      </div>

      <!-- 商品组件 -->
      <GoodsComponent v-if="activeTab === 'goods'" />
      <div v-else-if="activeTab === 'demand'">
        <DemandComponent :id="detailsId" :type="detailsType" />
      </div>
      <div v-else-if="activeTab === 'market'">
        <MarketComponent />
      </div>
      <div v-else-if="activeTab === 'expert'">
        <ExpertComponent />
      </div>
      <!-- 个人中心 -->
      <PersonalCenterComponent v-else-if="activeTab === 'personal'" :command="personalCommand" />
    </div>
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
const personalCommand = ref('');
const detailsId = ref<string | number>('');
const detailsType = ref('');
const tabs = [
  {
    label: '首页',
    name: 'goods'
  },
  {
    label: '供需大厅',
    name: 'demand'
  },
  {
    label: '市场行情',
    name: 'market'
  },
  {
    label: '专家学堂',
    name: 'expert'
  }
];

onMounted(() => {
  //  监听个人中心导航事件
  eventBus.on('navigateToPersonalCenter', (command: string) => {
    personalCommand.value = command;
    activeTab.value = 'personal';
  });
  // 监听切换Tabs事件
  eventBus.on('activeTabChange', (command: string) => {
    activeTab.value = command;
  });
  // 监听消息事件
  eventBus.on('supplyDemandmessage', (command: any) => {
    activeTab.value = command.type;
    detailsId.value = command.id;
    detailsType.value = 'supplyDemand';
  });
});

function handleTabClick(tab: any) {
  console.log(tab);

  activeTab.value = tab;
}
</script>

<style scoped lang="scss">
.mall-container {
  background: #fff;
  overflow: auto;
}

.tabs-container {
  padding: 12px;
  background-color: #108c58;
  // ::v-deep .is-active {
  //   color: #fff;
  // }
  // ::v-deep .el-tabs__nav-wrap:after {
  //   // display: none !important;
  //   background-color: #fff;
  // }
  .tab-item {
    cursor: pointer;
    color: #fff;
    font-size: 18px;
    font-weight: 500;
  }
  // 写一个类似于tabs的after效果, 当点击tab-item时, 下面的线会从左到右展开
  .tab-item::after {
    content: '';
    display: block;
    width: 100%;
    height: 4px;
    background-color: #fff;
    transform: scaleX(0);
    transition: transform 0.3s ease-in-out;
  }
  // .tab-item:hover::after {
  //   transform: scaleX(1);
  // }
  .is-active::after {
    transform: scaleX(1);
  }
}
</style>
