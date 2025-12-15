<!--
  标题: index.vue
  功能:  商城首页
  说明:  商城首页
  当前版本: 1.0
  开发信息: Created by 李春雷 2025-10-27
-->
<template>
  <div :class="[{ 'is-home': activeTab === 'goods' }, 'mall-container flex-column']">
    <!-- 头部组件 -->
    <HeaderComponent />

    <!-- Tabs 切换 -->
    <div class="tabs-container">
      <div class="tab-content flex-center gap-24">
        <div v-for="item in tabs" :key="item.name" :class="['tab-item', { 'is-active': activeTab === item.name }]" @click="handleTabClick(item.name)">
          {{ item.label }}
        </div>
      </div>
    </div>

    <!-- 导航组件 -->
    <CommonNavigation />
    <!-- 内容区域 -->
    <div class="content-area">
      <!-- 商城首页 -->
      <GoodsComponent v-if="activeTab === 'goods'" />
      <!-- 供需大厅组件 -->
      <DemandComponent :id="detailsId" :type="detailsType" v-else-if="activeTab === 'demand'" />
      <!-- 市场行情组件 -->
      <MarketComponent v-else-if="activeTab === 'market'" />
      <!-- 专家学堂组件 -->
      <ExpertComponent v-else-if="activeTab === 'expert'" />
      <!-- 个人中心 -->
      <PersonalCenterComponent v-else-if="activeTab === 'personal'" :command="personalCommand" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import HeaderComponent from './Components/HeaderComponent.vue'; // 头部组件
import CommonNavigation from './Components/CommonNavigation.vue'; // 导航组件
import GoodsComponent from './Components/GoodsComponent.vue'; // 商城首页组件
import DemandComponent from './Components/DemandComponent.vue'; // 需求组件
import MarketComponent from './Components/MarketComponent.vue'; // 市场组件
import ExpertComponent from './Components/ExpertComponent.vue'; // 专家组件
import PersonalCenterComponent from './personalCenter/index.vue'; // 个人中心组件

import { eventBus } from '@/utils/eventBus';

const activeTab = ref('goods');

const personalCommand = ref('');

const detailsId = ref<string | number>('');

const detailsType = ref('');

const goods = ref<any>({});

const compareGoodsList = ref<any>([]); // 商品比价列表

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
  // 监听切换Tabs事件
  eventBus.on('activeTabChange', (data: any) => {
    console.log(data);

    activeTab.value = data.command;

    if (data.command === 'compareDetail') {
      compareGoodsList.value = data.compareGoodsList;
    }

    if (data.command === 'personal') {
      personalCommand.value = data.personalTab;
      const psersonalCommand = data.command + ',' + data.personalTab;
      eventBus.emit('navigationChange', psersonalCommand);
      return;
    }

    goods.value = data.goods;
    // 给导航栏添加对应的名称
    eventBus.emit('navigationChange', data.command);
  });

  // 监听消息事件
  eventBus.on('supplyDemandmessage', (command: any) => {
    activeTab.value = command.type;
    detailsId.value = command.id;
    detailsType.value = 'supplyDemand';
  });

  // 首次加载默认首页的导航
  eventBus.emit('navigationChange', tabs[0].name);
});

// 点击Tabs切换事件
function handleTabClick(tab: any) {
  if (tab !== activeTab.value) {
    eventBus.emit('navigationChange', tab);
  }
  activeTab.value = tab;
}

onUnmounted(() => {
  // 移除监听事件
  eventBus.off('activeTabChange');
  eventBus.off('supplyDemandmessage');
});
</script>

<style scoped lang="scss">
.mall-container {
  background-color: #f6f7fb;
  overflow: auto;
}
.is-home {
  background-color: #fff !important;
}

.content-area {
  width: 1500px;
  margin: 0 auto;
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
  .tab-content {
    width: 1400px;
    margin: 0 auto;
  }
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
