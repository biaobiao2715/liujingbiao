<template>
  <div class="flex-center header">
    <div class="welcome-message">
      <span>Hi, 张三，您好，欢迎来到XXX</span>
    </div>
    <el-dropdown>
      <el-button> 个人中心<i class="el-icon-arrow-down el-icon--right"></i> </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item>我的订单</el-dropdown-item>
          <el-dropdown-item>我的收藏</el-dropdown-item>
          <el-dropdown-item>地址管理</el-dropdown-item>
          <el-dropdown-item>我发布的需求</el-dropdown-item>
          <el-dropdown-item>我的提问</el-dropdown-item>
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
</script>

<style scoped lang="scss">
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: #f5f5f5;
}
.welcome-message {
  flex-grow: 1;
}
.badge {
  margin-left: 16px;
}
</style>
