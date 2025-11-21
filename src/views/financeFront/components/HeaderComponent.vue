<template>
  <div class="flex-center-between header">
    <div class="welcome-message">Hi, 张三，您好，欢迎来到农合智创</div>
    <div class="right-info flex-center gap-24">
      <el-badge value="1" class="badge">
        <el-icon size="16"><Bell /></el-icon>
      </el-badge>
      <el-dropdown @command="handleCommand" style="margin-left: 12px">
        <div class="flex-center gap-12">
          <img src="../../../assets/images/avatar.svg" width="20" />
          <div class="my-center">个人中心</div>
        </div>
        <template #dropdown>
          <el-dropdown-menu class="dropdown-menu">
            <el-dropdown-item command="collection">我的收藏</el-dropdown-item>
            <el-dropdown-item command="application">信用申请管理</el-dropdown-item>
            <el-dropdown-item command="loginout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElHeader, ElDropdown, ElDropdownMenu, ElDropdownItem, ElButton, ElBadge, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';
import { Bell } from '@element-plus/icons-vue';
import { eventBus } from '@/utils/eventBus';
import { useUserStore } from '@/store/modules/user';

const userStore = useUserStore();
const router = useRouter();

const handleCommand = (command: string) => {
  if (command === 'loginout') {
    handleLogout();
    return;
  }
  eventBus.emit('showComponentByCommand', { type: 'PersonalCenter', command });
};

// 退出登录
const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.logout().then(() => {
      router.replace({
        path: '/login',
        query: {
          redirect: encodeURIComponent(router.currentRoute.value.fullPath || '/')
        }
      });
    });
  });
};
</script>

<style scoped lang="scss">
.header {
  height: 35px;
}
.logo {
  flex-grow: 1;
}
.welcome-message {
  font-size: 14px;
  color: #a8a8a8;
  text-align: left;
}
.badge {
  margin-top: 12px;
}
.my-center {
  font-size: 14px;
  color: #a8a8a8;
}
</style>
