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
      <!-- <el-tabs v-model="activeTab" @tab-click="handleTabClick">
          <el-tab-pane label="首页" name="goods"></el-tab-pane>
          <el-tab-pane label="供需大厅" name="demand"></el-tab-pane>
          <el-tab-pane label="市场行情" name="market"></el-tab-pane>
          <el-tab-pane label="专家学堂" name="expert"></el-tab-pane>
        </el-tabs> -->
      <div class="tab-content flex-center gap-24">
        <div v-for="item in tabs" :key="item.name" :class="['tab-item', { 'is-active': activeTab === item.name }]" @click="handleTabClick(item.name)">
          {{ item.label }}
        </div>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content-area">
      <!-- 商城首页 -->
      <GoodsComponent v-if="activeTab === 'goods'" />
      <!-- 商品详情 -->
      <GoodsDetailComponent v-else-if="activeTab === 'goodsDetail'" :id="goods.id" />
      <!-- 商品比价 -->
      <CompareGoodsComponent :goods="goods" v-else-if="activeTab === 'compareGoods'" />
      <!-- 商品比价详情 -->
      <CompareDetailComponent :compareGoodsList="compareGoodsList" v-else-if="activeTab === 'compareDetail'" />
      <!-- 供需大厅组件 -->
      <div v-else-if="activeTab === 'demand'">
        <DemandComponent :id="detailsId" :type="detailsType" />
      </div>
      <!-- 市场行情组件 -->
      <div v-else-if="activeTab === 'market'">
        <MarketComponent />
      </div>
      <!-- 专家学堂组件 -->
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
import GoodsComponent from './Components/GoodsComponent.vue'; // 商城首页组件
import GoodsDetailComponent from './Components/GoodsDetailComponent.vue'; // 商品详情组件
import CompareGoodsComponent from './Components/AboutCompareComponents/CompareGoodsComponent.vue'; // 商品比价组件
import CompareDetailComponent from './Components/AboutCompareComponents/CompareDetailComponent.vue'; // 商品比价详情组件
import DemandComponent from './Components/DemandComponent.vue'; // 需求组件
import MarketComponent from './Components/MarketComponent.vue'; // 市场组件
import ExpertComponent from './Components/ExpertComponent.vue'; // 专家组件
import PersonalCenterComponent from './personalCenter/index.vue'; // 个人中心组件
import { eventBus } from '@/utils/eventBus';

// 类型定义
type DetailView =
  | 'area'
  | 'GoodsComponent'
  | 'LoanProductsComponentDetails'
  | 'LoanProductsComponentApplyForm'
  | 'InsuranceproductComponentList'
  | 'InsuranceproductComponentDetails'
  | 'RiskCasesComponentList'
  | 'RiskCasesComponentDetails'
  | 'PolicyRulesComponentList'
  | 'PolicyRulesComponentDetails'
  | 'PersonalCenter';

const TITLE_MAP: Record<Exclude<DetailView, 'area'>, string> = {
  GoodsComponent: '商城首页',
  LoanProductsComponentDetails: '信贷产品详情',
  LoanProductsComponentApplyForm: '申请信贷产品',
  InsuranceproductComponentList: '保险产品列表',
  InsuranceproductComponentDetails: '保险产品详情',
  RiskCasesComponentList: '风险案例列表',
  RiskCasesComponentDetails: '风险案例详情',
  PolicyRulesComponentList: '政策法规列表',
  PolicyRulesComponentDetails: '政策法规详情',
  PersonalCenter: '个人中心'

  // // 以下内容只用来展示，不参与交互，无实际意义
  // MyCollections: '我的收藏',
  // CreditApplication: '信贷申请管理'
};

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
  //  监听个人中心导航事件
  eventBus.on('navigateToPersonalCenter', (command: string) => {
    personalCommand.value = command;
    activeTab.value = 'personal';
  });

  // 监听切换Tabs事件
  eventBus.on('activeTabChange', (data: any) => {
    console.log(data);
    activeTab.value = data.command;
    if (data.command === 'compareDetail') {
      compareGoodsList.value = data.compareGoodsList;
    }
    goods.value = data.goods;
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
