<!--
  标题: index.vue
  功能: 个人中心
  说明: 个人中心，包含我的订单、我的收藏/我的提问/地址管理/我发布的需求。
  当前版本: 1.0
  开发信息: Created by 李春雷 2025-10-14
-->
<template>
  <div class="personal-center-page">
    <div class="container_width">
      <!-- 顶部可点击返回条 -->
      <div class="pc-breadcrumb" @click="goBack" :title="`返回上一页`">
        <span class="crumb">首页</span>
        <span class="crumb-sep">&gt;</span>
        <span class="crumb">个人中心</span>
        <span class="crumb-sep">&gt;</span>
        <span class="crumb">{{ currentTitle }}</span>
      </div>
      <div class="main-row">
        <!-- 侧边栏菜单 -->
        <div class="menu-col">
          <div class="menu-title">个人中心</div>
          <ul class="menu">
            <li v-for="item in menuItems" :key="item.id" :class="{ active: item.component == selectedComponent }" @click="selectMenu(item.component)">
              {{ item.title }}
            </li>
          </ul>
          <div class="menu-bottom-bg"></div>
        </div>
        <!-- 主内容区域 -->
        <div class="content-col">
          <orders v-if="selectedComponent === 'order'" />
          <favorites v-if="selectedComponent === 'collection'" />
          <questions v-if="selectedComponent === 'question'" />
          <addressManagement v-if="selectedComponent === 'address'" />
          <requests v-if="selectedComponent === 'demand'" />
          <participatedRequests v-if="selectedComponent === 'participated'" />
          <myReport v-if="selectedComponent === 'myReport'" />
          <varietyIdentification v-if="selectedComponent === 'varietyIdentification'" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { eventBus } from '@/utils/eventBus';
import orders from './Components/orders.vue';
import favorites from './Components/favorites.vue';
import addressManagement from './Components/addressManagement.vue';
import questions from './Components/questions.vue';
import requests from './Components/requests.vue';
import participatedRequests from './Components/participatedRequests.vue';
import myReport from './Components/myReport.vue';
import varietyIdentification from './Components/varietyIdentification.vue';
import { pushNoAnswerQuestionMessage } from '@/api/mall/personalCenter/orders';
interface Props {
  command?: string | number | object;
}

const props = withDefaults(defineProps<Props>(), {
  command: 'order'
});

const emit = defineEmits<{
  (e: 'nextStep'): void;
}>();

const menuItems = ref([
  { id: 1, title: '我的订单', component: 'order' },
  { id: 2, title: '我的收藏', component: 'collection' },
  { id: 3, title: '我的提问', component: 'question' },
  { id: 4, title: '地址管理', component: 'address' },
  { id: 5, title: '我发布的需求', component: 'demand' },
  { id: 6, title: '我参与的', component: 'participated' },
  { id: 7, title: '我的举报', component: 'myReport' },
  { id: 8, title: '品种识别记录', component: 'varietyIdentification' }
]);

const selectedComponent = ref(menuItems.value[0].component);

const currentTitle = computed(() => {
  const map: Record<string, string> = {
    order: '我的订单',
    collection: '我的收藏',
    question: '我的提问',
    address: '地址管理',
    demand: '我发布的需求',
    participated: '我参与的',
    myReport: '我的举报',
    varietyIdentification: '品种识别记录'
  };
  return map[selectedComponent.value] || '我的订单';
});

function goBack() {
  eventBus.emit('activeTabChange', 'goods');
}

function selectMenu(val: any) {
  const selectedMenu = menuItems.value.find((item) => item.component === val);
  if (selectedMenu) {
    selectedComponent.value = selectedMenu.component;
  }
}

onMounted(() => {
  // 推送未回答问题提示信息
  pushNoAnswerQuestionMessage();
});

watch(
  () => props.command,
  (newCommand) => {
    if (newCommand) {
      selectMenu(newCommand);
    }
  },
  { immediate: true }
);
</script>

<style scoped lang="scss">
.personal-center-page {
  background-color: #f6f7fb;
  // min-height: 800px;
  height: 100%;
  --el-color-primary: #108c58;
}

.container_width {
  width: 1494px;
  margin: 0 auto;
}
/* 顶部可点击返回条 */
.pc-breadcrumb {
  font-size: 14px;
  color: #999;
  line-height: 32px;
  margin: 0 0 16px 0;
  padding: 0;
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.crumb {
  color: #7c7c7c;
  font-weight: 400;
}
.crumb-sep {
  margin: 0 8px;
  color: #7c7c7c;
  font-weight: 400;
  font-size: 14px;
}
/* 主体行，控制整体宽度和居中 */
.main-row {
  display: flex;
  flex-wrap: nowrap; // 关键：不允许子项换行
  min-height: 600px;
  padding-bottom: 40px;
  align-items: stretch;
}

/* 左侧菜单卡片 */
.menu-col {
  width: 210px;
  min-width: 210px;
  max-width: 210px;
  flex-shrink: 0; // 不允许缩小
  display: flex;
  flex-direction: column;
  background: #fff;
}

.menu-title {
  display: flex;
  align-items: center;
  height: 60px; /* 或你需要的高度 */
  padding-left: 20px;
  font-size: 20px;
  font-weight: 500;
  color: #333333;
  background: #fff;
  position: relative;
  border-bottom: 2px solid #d8d8d8;
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
}
.menu-title::before {
  content: '';
  display: inline-block;
  width: 2px;
  height: 14px;
  background: #108c58;
  border-radius: 4px 4px 4px 4px;
  margin-right: 6px;
}
.menu {
  list-style: none;
  margin: 0;
  padding: 20px;
  li {
    position: relative;
    height: 36px;
    line-height: 36px;
    padding: 0 20px;
    border-radius: 4px 4px 4px 4px;

    font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
    font-weight: 400;
    font-size: 14px;
    color: #3d3d3d;
  }
  li.active {
    color: #108c58;
    background: rgba(16, 140, 88, 0.1);
  }
  li:hover:not(.active) {
    color: #108c58;
    background: rgba(16, 140, 88, 0.1);
  }
}

/* 左侧菜单底部稻穗装饰 */
.menu-bottom-bg {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 120px;
  background: url('@/assets/images/menu-bg.png') no-repeat left bottom/contain;
  pointer-events: none;
  z-index: 1;
}

/* 右侧内容区，卡片化，圆角，阴影，内边距，宽度自适应剩余空间 */
.content-col {
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 0px 0px 0px 0px;
  margin-left: 20px !important;
  width: 1264px;
}
// 表格
::v-deep .el-table__header th {
  background: #f6f7fb !important;
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  font-size: 14px;
  color: #3d3d3d;
}
// tab标签
::v-deep .el-tabs__item {
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  font-size: 14px;
  color: #3d3d3d;
}

::v-deep .el-tabs__item.is-active {
  color: #108c58 !important; /* 选中字体颜色 */
}
::v-deep .el-tabs__item:hover {
  color: #108c58;
}
</style>
