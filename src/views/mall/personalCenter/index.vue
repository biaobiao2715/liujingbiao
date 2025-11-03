<!--
      标题: index.vue
      功能: 个人中心
      说明: 个人中心，包含我的订单、我的收藏/我的提问/地址管理/我发布的需求。
      当前版本: 1.0
      开发信息: Created by 李春雷 2025-10-14
    -->
<template>
  <div class="register-page">
    <!-- 顶部可点击返回条 -->
    <div class="pc-breadcrumb" @click="goBack" :title="`返回上一页`">首页 > 个人中心 > {{ currentTitle }}</div>
    <el-row style="height: 100%">
      <!-- 侧边栏菜单 -->
      <el-col :span="4" class="menu">
        <ul>
          <div class="menu-title">个人中心</div>
          <li v-for="item in menuItems" :key="item.id" :class="{ active: item.component == selectedComponent }" @click="selectMenu(item.component)">
            {{ item.title }}
          </li>
        </ul>
      </el-col>
      <!--  主内容区域 -->
      <el-col :span="20">
        <div class="content">
          <orders v-if="selectedComponent === 'order'" />
          <favorites v-if="selectedComponent === 'collection'" />
          <questions v-if="selectedComponent === 'question'" />
          <addressManagement v-if="selectedComponent === 'address'" />
          <requests v-if="selectedComponent === 'demand'" />
          <participatedRequests v-if="selectedComponent === 'participated'" />
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
// 引入 Vue 的 ref、watch、computed 函数
import { ref, watch, computed } from 'vue';
import { eventBus } from '@/utils/eventBus';
// 引入各个子组件
import orders from './Components/orders.vue';
import favorites from './Components/favorites.vue';
import addressManagement from './Components/addressManagement.vue';
import questions from './Components/questions.vue';
import requests from './Components/requests.vue';
import participatedRequests from './Components/participatedRequests.vue';

interface Props {
  command?: string | number | object;
}

const props = withDefaults(defineProps<Props>(), {
  command: 'order'
});

const emit = defineEmits<{
  (e: 'nextStep'): void;
}>();

// 菜单项
const menuItems = ref([
  { id: 1, title: '我的订单', component: 'order' },
  { id: 2, title: '我的收藏', component: 'collection' },
  { id: 3, title: '我的提问', component: 'question' },
  { id: 4, title: '地址管理', component: 'address' },
  { id: 5, title: '我发布的需求', component: 'demand' },
  { id: 6, title: '我参与的', component: 'participated' }
]);

// 当前选中的组件
const selectedComponent = ref(menuItems.value[0].component);
// 动态标题
const currentTitle = computed(() => {
  const map: Record<string, string> = {
    order: '我的订单',
    collection: '我的收藏',
    question: '我的提问',
    address: '地址管理',
    demand: '我发布的需求',
    participated: '我参与的'
  };
  return map[selectedComponent.value] || '我的订单';
});

// 返回上一页
function goBack() {
  eventBus.emit('showHomeContentChange', true);
}

// 切换菜单
function selectMenu(val: any) {
  const selectedMenu = menuItems.value.find((item) => item.component === val);
  if (selectedMenu) {
    selectedComponent.value = selectedMenu.component;
  }
}

// 响应式处理
watch(
  () => props.command,
  (newCommand) => {
    if (newCommand) {
      console.log('接收到命令:', newCommand);
      selectMenu(newCommand);
    }
  },
  { immediate: true }
);
</script>

<style scoped lang="scss">
.register-page {
  min-height: 100vh;
  padding: 20px;
  background-color: #f4f4f4;

  /* 主色定义：#108c58 及其深浅色阶 */
  --el-color-primary: #108c58;
  --el-color-primary-dark-2: #0c6d46;
  --el-color-primary-light-3: #26a169;
  --el-color-primary-light-5: #45b780;
  --el-color-primary-light-7: #7ccc9f;
  --el-color-primary-light-9: #e8f6ef;
}

/* 顶部可点击返回条：卡片化 + 悬停反馈 */
.pc-breadcrumb {
  margin-bottom: 16px;
  padding: 10px 14px;
  background: #fff;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  color: var(--el-text-color-primary);
  cursor: pointer;
  user-select: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}
.pc-breadcrumb::before {
  content: '←';
  color: var(--el-color-primary);
  font-weight: 600;
}
.pc-breadcrumb:hover {
  transform: translateY(-1px);
  box-shadow: var(--el-box-shadow-light);
  border-color: var(--el-color-primary-light-5);
}

/* 左侧菜单：圆角卡片 + 活跃态优化 */
.menu {
  background-color: #fff;
  padding: 12px;
  border-radius: 10px;
  box-shadow: var(--el-box-shadow-lighter);
}
.menu-title {
  padding: 10px;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 12px;
}
.menu ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
.menu li {
  padding: 10px 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
  color: var(--el-text-color-regular);
}
.menu li + li {
  margin-top: 6px;
}
.menu li:hover {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}
.menu li.active {
  background: linear-gradient(135deg, var(--el-color-primary), #2bb678);
  color: #fff;
  box-shadow: 0 2px 10px rgba(16, 140, 88, 0.2);
}

/* 右侧内容：卡片化 */
.content {
  background: #fff;
  border-radius: 10px;
  box-shadow: var(--el-box-shadow-lighter);
  padding: 16px 20px;
  margin-left: 20px;
  height: 100%;
}

/* 适配小屏：调小圆角与内边距 */
@media (max-width: 1200px) {
  .pc-breadcrumb,
  .menu,
  .content {
    border-radius: 8px;
  }
  .content {
    padding: 14px 16px;
  }
}
</style>
