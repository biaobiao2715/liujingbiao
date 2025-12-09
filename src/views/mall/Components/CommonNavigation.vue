<!--
  标题: CommonNavigation.vue
  功能:  公共导航组件
  说明: 公共导航组件，用于页面顶部导航
  当前版本: 1.0
  开发信息: Created by 李春雷 2025-12-09
-->
<template>
  <div class="common-navigation-container" v-if="naviteList.length > 1">
    <el-breadcrumb :separator-icon="ArrowRight" class="braed-navigate">
      <el-breadcrumb-item
        :class="{ 'able-click': index + 1 !== naviteList.length }"
        v-for="(item, index) in naviteList"
        :key="item.uniqueId"
        @click="switchComponent(item, index === 0)"
        >{{ TITLE_MAP[item.type] }}</el-breadcrumb-item
      >
    </el-breadcrumb>
  </div>
</template>

<script setup lang="ts">
import { ArrowRight } from '@element-plus/icons-vue';

import { eventBus } from '@/utils/eventBus';

// 类型定义
type DetailView =
  // 首页相关
  | 'goods'
  | 'demand'
  | 'market'
  | 'expert'
  // 商城相关
  | 'goodsDetail'
  | 'demandDetail'
  | 'marketDetail'
  | 'compareGoods'
  //   专家学堂相关
  | 'expertDetail'
  | 'qaMoreList'
  | 'qaDetail'
  | 'essayList'
  | 'essayDetail'
  | 'couMetList'
  | 'courseDetail'
  | 'meetingDetail'
  | 'livingDetail'
  | 'lawList'
  | 'lawContentDetail'
  | 'lawActivityDetail'
  | 'whitepaperDetail'
  | 'livingList';

interface DetailPayload {
  uniqueId: number;
  id: string;
  type: Exclude<DetailView, never>;
}

const TITLE_MAP: Record<Exclude<DetailView, never>, string> = {
  goods: '首页',
  demand: '供需大厅',
  market: '市场行情',
  expert: '专家学堂',
  // 商城相关
  goodsDetail: '商品详情',
  demandDetail: '供需详情',
  marketDetail: '行情详情',
  compareGoods: '对比商品',
  // 专家学堂相关
  expertDetail: '专家详情',
  qaMoreList: '问答列表',
  qaDetail: '问答详情',
  essayList: '文章专栏',
  essayDetail: '文章详情',
  couMetList: '培训课堂',
  courseDetail: '课程详情',
  meetingDetail: '会议详情',
  livingDetail: '直播详情',
  lawList: '普法专栏',
  lawContentDetail: '普法内容详情',
  lawActivityDetail: '普法活动详情',
  whitepaperDetail: '普法白皮书详情',
  livingList: '直播列表'
};

const naviteList = ref([]);

onMounted(() => {
  eventBus.on('navigationChange', (command: string) => {
    const uniqueId = new Date().getTime();
    // 如果是大类，那么就清空导航列表，重新添加
    if (command === 'goods' || command === 'demand' || command === 'market' || command === 'expert') {
      naviteList.value = [
        {
          uniqueId,
          type: command
        }
      ];
      return;
    }
    naviteList.value.push({
      uniqueId,
      type: command
    });
    console.log(naviteList.value);
  });
});

// 点击面包屑导航切换显示区域
const switchComponent = (item: DetailPayload, isHome: boolean) => {
  //   点击tabs的路径
  //   if (isHome) {
  //     eventBus.emit('activeTabChange', { command: item.type });
  //   }

  // 向其他模块发送导航切换事件
  eventBus.emit('navigateToEach', { command: item.type });

  //  如果点击的是已经存在的路径，那么就把该路径后面的路径都移除
  const targetIndex = naviteList.value.findIndex((e) => e.type === item.type);
  if (targetIndex !== -1) {
    naviteList.value = naviteList.value.slice(0, targetIndex + 1);
    return;
  }

  //   selectNavigateByType(item.type);
};
</script>

<style scoped lang="scss">
.common-navigation-container {
  width: 1500px;
  margin: 0 auto;
  padding: 12px;
}
</style>
