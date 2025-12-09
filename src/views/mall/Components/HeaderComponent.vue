<template>
  <div class="flex-center-between header">
    <div class="welcome-message">Hi,{{ userStore.nickname || '用户' }}，您好，欢迎来到农合智创</div>
    <div class="right-info flex-center gap-24">
      <!-- 消息 -->
      <el-popover placement="bottom" trigger="click" transition="el-zoom-in-top" :width="300" :persistent="false">
        <template #reference>
          <el-badge :value="newNotice > 0 ? newNotice : ''" :max="99" class="badge">
            <div class="right-menu-item hover-effect" style="display: block">
              <el-icon size="16"><Bell /></el-icon>
            </div>
          </el-badge>
        </template>
        <template #default>
          <notice></notice>
        </template>
      </el-popover>

      <el-dropdown @command="handleCommand" style="margin-left: 12px">
        <div class="flex-center gap-12">
          <img src="../../../assets/images/avatar.svg" width="20" />
          <div class="my-center">个人中心</div>
        </div>
        <template #dropdown>
          <el-dropdown-menu class="dropdown-menu">
            <el-dropdown-item command="order">我的订单</el-dropdown-item>
            <el-dropdown-item command="collection">我的收藏</el-dropdown-item>
            <el-dropdown-item command="question">我的提问</el-dropdown-item>
            <el-dropdown-item command="address">地址管理</el-dropdown-item>
            <el-dropdown-item command="myDemand">我发布的需求</el-dropdown-item>
            <el-dropdown-item command="participated">我参与的</el-dropdown-item>
            <el-dropdown-item command="myReport">我的举报</el-dropdown-item>
            <el-dropdown-item command="varietyIdentification">品种识别记录</el-dropdown-item>
            <el-dropdown-item command="loginout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElDropdown, ElDropdownMenu, ElDropdownItem, ElBadge, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';
import { Bell } from '@element-plus/icons-vue';
import { eventBus } from '@/utils/eventBus';
import { useUserStore } from '@/store/modules/user';
import notice from '@/layout/components/notice/index.vue';
import { useNoticeStore } from '@/store/modules/notice';
const userStore = useUserStore();
const router = useRouter();
const noticeStore = storeToRefs(useNoticeStore());
const handleCommand = (command: string) => {
  if (command === 'loginout') {
    handleLogout();
    return;
  }
  eventBus.emit('activeTabChange', { command: 'personal', personalTab: command });
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
const newNotice = ref(<number>0);

//用深度监听 消息
watch(
  () => noticeStore.state.value.notices,
  (newVal) => {
    newNotice.value = newVal.filter((item: any) => !item.read).length;
  },
  { deep: true }
);
</script>

<style scoped lang="scss">
.header {
  width: 1500px;
  height: 35px;
  margin: 0 auto;
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
  margin-top: 8px;
}
.my-center {
  font-size: 14px;
  color: #a8a8a8;
}
</style>
