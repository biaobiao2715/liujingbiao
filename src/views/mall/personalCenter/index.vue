<!--
      标题: index.vue
      功能: 个人中心
      说明: 个人中心，包含我的订单、我的收藏/我的提问/地址管理/我发布的需求。
      当前版本: 1.0
      开发信息: Created by 李春雷 2025-10-14
    -->
<template>
  <div class="register-page">
    <el-row style="height: 100%">
      <!-- 侧边栏菜单 -->
      <el-col :span="4" class="menu">
        <ul>
          <div class="menu-title">个人中心</div>
          <li v-for="item in menuItems" :key="item.id" :class="{ active: item.id === selectedMenuId }" @click="selectMenu(item.id)">
            {{ item.title }}
          </li>
        </ul>
      </el-col>
      <!--  主内容区域 -->
      <el-col :span="20" class="content">
        <orders v-if="selectedComponent === 'MyOrders'" />
        <favorites v-if="selectedComponent === 'MyFavorites'" />
        <questions v-if="selectedComponent === 'MyQuestions'" />
        <addressManagement v-if="selectedComponent === 'AddressManagement'" />
        <requests v-if="selectedComponent === 'MyRequests'" />
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

// 菜单项
const menuItems = [
  { id: 1, title: '我的订单', component: 'MyOrders' },
  { id: 2, title: '我的收藏', component: 'MyFavorites' },
  { id: 3, title: '我的提问', component: 'MyQuestions' },
  { id: 4, title: '地址管理', component: 'AddressManagement' },
  { id: 5, title: '我发布的需求', component: 'MyRequests' }
];
// 当前选中的菜单 ID
const selectedMenuId = ref(menuItems[0].id);

// 当前选中的组件
const selectedComponent = ref(menuItems[0].component);
// 切换菜单
function selectMenu(menuId: number) {
  const selectedMenu = menuItems.find((item) => item.id === menuId);
  if (selectedMenu) {
    selectedMenuId.value = menuId;
    selectedComponent.value = selectedMenu.component;
  }
}
onMounted(() => {
  // 页面加载时，检查路由参数是否存在手机号
});
</script>

<style scoped lang="scss">
.register-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.menu {
  // width: 200px;
  background-color: #f4f4f4;
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
  padding: 20px;
}
</style>
