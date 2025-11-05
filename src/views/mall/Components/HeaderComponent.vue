<template>
  <div class="flex-center header">
    <div class="logo flex-center gap-12">
      <img src="../../../assets/images/logo.svg" alt="logo" class="logo-image" />
      <div>农合智创</div>
    </div>
    <div class="welcome-message">
      <span>Hi, 张三，您好，欢迎来到XXX</span>
    </div>
    <!-- 进入后台管理 -->
    <el-button type="primary" @click="handleAdminLogin" v-hasPermi="['system:into:platform']">进入后台管理</el-button>
    <el-button type="primary" @click="handleLogout">退出登录</el-button>

    <el-dropdown @command="handleCommand" v-hasPermi="['system:into:myCenter']" style="margin-left: 12px">
      <el-button> 个人中心<i class="el-icon-arrow-down el-icon--right"></i> </el-button>
      <template #dropdown>
        <el-dropdown-menu class="dropdown-menu">
          <el-dropdown-item command="order">我的订单</el-dropdown-item>
          <el-dropdown-item command="collection">我的收藏</el-dropdown-item>
          <el-dropdown-item command="question">我的提问</el-dropdown-item>
          <el-dropdown-item command="address">地址管理</el-dropdown-item>
          <el-dropdown-item command="demand">我发布的需求</el-dropdown-item>
          <el-dropdown-item command="participated">我参与的</el-dropdown-item>
          <el-dropdown-item command="myReport">我的举报</el-dropdown-item>
          <el-dropdown-item command="varietyIdentification">品种识别记录</el-dropdown-item>
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
import { useUserStore } from '@/store/modules/user';

const userStore = useUserStore();
const router = useRouter();

const handleCommand = (command: string) => {
  // console.log('点击了:', command);
  eventBus.emit('navigateToPersonalCenter', command);
};

// 进入后台管理 拼接基础地址加路由
const handleAdminLogin = () => {
  const env = import.meta.env.VITE_APP_BASE_URL;
  console.log(env);
  window.open(env + '/index');
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
      // proxy?.$tab.closeAllPage();
    });
  });
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
