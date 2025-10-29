<template>
  <div class="flex-center header">
    <div class="logo flex-center gap-12">
      <img src="../../../assets/images/logo.svg" alt="logo" class="logo-image" />
      <div>农合智创</div>
    </div>
    <div class="welcome-message">
      <span>Hi, 张三，您好，欢迎来到XXX</span>
    </div>
    <el-dropdown @command="handleCommand">
      <el-button> 个人中心<i class="el-icon-arrow-down el-icon--right"></i> </el-button>
      <template #dropdown>
        <el-dropdown-menu class="dropdown-menu">
          <el-dropdown-item command="order">我的订单</el-dropdown-item>
          <el-dropdown-item command="collection">我的收藏</el-dropdown-item>
          <el-dropdown-item command="question">我的提问</el-dropdown-item>
          <el-dropdown-item command="address">地址管理</el-dropdown-item>
          <el-dropdown-item command="demand">我发布的需求</el-dropdown-item>
          <el-dropdown-item command="participated">我参与的</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <el-badge value="1" class="badge">
      <el-icon size="26"><Bell /></el-icon>
    </el-badge>
  </div>
</template>

<script setup lang="ts">
import { ElHeader, ElDropdown, ElDropdownMenu, ElDropdownItem, ElButton, ElBadge } from 'element-plus';
import { eventBus } from '@/utils/eventBus';

const handleCommand = (command: string) => {
  // console.log('点击了:', command);
  eventBus.emit('navigateToPersonalCenter', command);
};
</script>

<style scoped lang="scss">
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: #f5f5f5;
}
.logo {
  flex-grow: 1;
}
.welcome-message {
  text-align: center;
  margin-right: 16px;
}
.badge {
  margin-left: 16px;
}
</style>
