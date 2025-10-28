<!--
      标题: index.vue
      功能: 个人中心
      说明: 个人中心，包含我的订单、我的收藏/我的提问/地址管理/我发布的需求。
      当前版本: 1.0
      开发信息: Created by 李春雷 2025-10-14
    -->
<template>
  <div class="register-page">
    <div style="margin-bottom: 20px">首页>个人中心>我的订单</div>
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
      <el-col :span="20" class="content">
        <orders v-if="selectedComponent === 'order'" />
        <favorites v-if="selectedComponent === 'collection'" />
        <questions v-if="selectedComponent === 'question'" />
        <addressManagement v-if="selectedComponent === 'address'" />
        <requests v-if="selectedComponent === 'demand'" />
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
// 引入 Vue 的 ref 函数
import { ref } from 'vue';
// 引入各个子组件
import orders from './Components/orders.vue';
import favorites from './Components/favorites.vue';
import addressManagement from './Components/addressManagement.vue';
import questions from './Components/questions.vue';
import requests from './Components/requests.vue';
interface Props {
  command?: string | number | object;
}

const props = withDefaults(defineProps<Props>(), {
  command: 'order'
});

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
// 菜单项
const menuItems = [
  { id: 1, title: '我的订单', component: 'order' },
  { id: 2, title: '我的收藏', component: 'collection' },
  { id: 3, title: '我的提问', component: 'question' },
  { id: 4, title: '地址管理', component: 'address' },
  { id: 5, title: '我发布的需求', component: 'demand' }
];

// 当前选中的组件
const selectedComponent = ref(menuItems[0].component);
// 切换菜单
function selectMenu(val: any) {
  const selectedMenu = menuItems.find((item) => item.component === val);
  if (selectedMenu) {
    selectedComponent.value = selectedMenu.component;
  }
}
</script>

<style scoped lang="scss">
.register-page {
  min-height: 100vh;
  padding: 20px;
  background-color: #f4f4f4;
}

.menu {
  // width: 200px;
  background-color: #fff;
  padding: 10px;
}

.menu ul {
  list-style: none;
  padding: 0;
}

.menu-title {
  padding: 10px;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}

.menu li {
  padding: 10px;
  cursor: pointer;
}

.menu li.active {
  background-color: #2d6cf5;
  color: #fff;
}

.menu li:hover {
  background-color: #ddd;
}

.content {
  flex: 1;
  padding: 0 20px;
}
</style>
