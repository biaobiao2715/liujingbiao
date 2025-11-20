<template>
  <div class="application-container">
    <div class="user-info-bar flex-center-between">
      <img src="@/assets/images/logo-white.svg" width="32" />
      <div class="user-info flex-center gap-12">
        <el-icon color="#fff"><Bell /></el-icon>
        <div class="dept-name">{{ userInfo?.deptName }}</div>
        <el-button type="primary" @click="handleLogout">退出登录</el-button>
        <div class="user-name flex-center-center">{{ userInfo?.userName }}</div>
      </div>
    </div>
    <!-- 页面标题 -->
    <div class="header flex-center">
      <div>全部应用</div>
    </div>

    <!-- 应用卡片列表 -->
    <div
      class="flex-center gap-12 application-list"
      style="background: url('../assets/images/application-bg-1.png') no-repeat center center; background-size: cover"
    >
      <div class="application-card flex" v-for="(app, index) in currentPlatform" :key="index" @click="handleRedirect(app.redirect)">
        <!-- 应用图标和标题 -->
        <div class="icon">
          <img :src="getIcon(app.icon)" width="64" />
          <div class="title">{{ app.title }}</div>
        </div>
        <el-tooltip :content="app.description" placement="bottom">
          <div class="description">{{ app.description }}</div>
        </el-tooltip>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { getInfo } from '@/api/login';
import { ElMessageBox } from 'element-plus';
import { useUserStore } from '@/store/modules/user';
import { initSSE } from '@/utils/sse';
const userStore = useUserStore();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

// 路由实例
const router = useRouter();
const userInfo = ref();
// 应用数据
const applications = ref([
  // {
  //   title: '供应商管理后台',
  //   description: '该应用为内部人员对供应商进行管理：如：入驻供应商审核、供应商启用/停用、供应商上架商品审核等',
  //   icon: 'application-icon-1.svg',
  //   bg: 'application-bg-1.svg',
  //   redirect: '/platform/index',
  //   type: []
  // },
  // {
  //   title: '供应商系统',
  //   description: '供应商系统负责供应商自主供应商进行工作及信息管理',
  //   icon: 'application-icon-2.svg',
  //   bg: 'application-bg-2.svg',
  //   type: []
  // },
  // {
  //   title: '种业数据服务平台',
  //   description: '该应用为内部人员对供应商进行管理：如：入驻供应商审核、供应商启用/停用、供应商上架商品审核等',
  //   icon: 'application-icon-4.svg',
  //   bg: 'application-bg-4.svg',
  //   type: []
  // },

  {
    title: '专家服务平台',
    description: '该应用为内部人员对供应商进行管理：如：入驻供应商审核、供应商启用/停用、供应商上架商品审核等',
    icon: 'application-icon-4.svg',
    bg: 'application-bg-4.svg',
    redirect: '/index',
    type: ['4', '5']
  },

  {
    title: '后台管理',
    description: '该应用为内部人员对供应商进行管理：如：入驻供应商审核、供应商启用/停用、供应商上架商品审核等',
    icon: 'application-icon-4.svg',
    bg: 'application-bg-4.svg',
    redirect: '/index',
    type: ['0', '2', '3', '6']
  },
  {
    title: '农资农具销售服务平台',
    description: '农资农具销售服务平台主要用于针对农户、合作社、农资店、农场等不同客户进行农资农具购买',
    icon: 'application-icon-3.svg',
    bg: 'application-bg-3.svg',
    redirect: '/mall',
    type: ['1']
  },
  {
    title: '种子经纪服务平台',
    description: '该应用为内部人员对供应商进行管理；如：入驻供应商审核、供应商启用/停用、供应商上架商品审核等',
    icon: 'application-icon-5.svg',
    bg: 'application-bg-5.svg',
    redirect: '/mall',
    type: ['1']
  },
  // {
  //   title: '种子维权服务平台',
  //   description: '该应用为内部人员对供应商进行管理：如：入驻供应商审核、供应商启用/停用、供应商上架商品审核等',
  //   icon: 'application-icon-6.svg',
  //   bg: 'application-bg-6.svg',
  //   redirect: '/mall/index',
  //   type: ['2', '3']
  // },
  {
    title: '种子金融服务平台',
    description: '该应用为内部人员对供应商进行管理：如：入驻供应商审核、供应商启用/停用、供应商上架商品审核等',
    icon: 'application-icon-7.svg',
    bg: 'application-bg-7.svg',
    redirect: '/financeFront/index',
    type: ['1', '2', '3']
  }
]);

const currentPlatform = ref([]);

onMounted(() => {
  getUserInfo();
});

const getUserInfo = async () => {
  const res: any = await getInfo();
  userInfo.value = res.data.user;
  console.log(res);
  // 采购商
  currentPlatform.value = applications.value.filter((e) => e.type && e.type.includes(res.data.tenantType));
  console.log(currentPlatform.value);
};

const getIcon = (svgName: string) => {
  return new URL(`../assets/images/${svgName}`, import.meta.url).href;
};

// 处理点击跳转
const handleRedirect = (path: string) => {
  if (path) {
    router.push(path);
    initSSE(import.meta.env.VITE_APP_BASE_API + '/resource/sse');
  }
};

const handleLogout = () => {
  ElMessageBox.confirm('确定注销并退出系统吗？', '提示', {
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
      proxy?.$tab.closeAllPage();
    });
  });
};
</script>

<style scoped lang="scss">
.header {
  height: 100px;
  background: url('../assets/images/home-header-bg.png') no-repeat center center;
  background-size: cover;
  padding-left: 12px;
  div {
    font-weight: bold;
    font-size: 32px;
    color: #000000;
  }
}

.user-info-bar {
  padding: 12px;
  background-color: var(--color-main);
  font-size: 14px;
  .dept-name {
    color: #fff;
  }
  .user-name {
    width: 44px;
    height: 44px;
    color: var(--color-main);
    border-radius: 50%;
    background-color: #fff;
  }
}

.application-list {
  flex-wrap: wrap;
  margin-top: 40px;
  padding: 0 12px;
}
.application-card {
  background: url('../assets/images/application-bg-1.png') no-repeat center center;
  background-size: cover;

  width: calc(20% - 12px);
  height: 246px;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  flex-direction: column;
  gap: 12px;
  cursor: pointer;
  .title {
    font-size: 20px;
    font-weight: bold;
    color: #000;
    // 超出部分省略号
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .description {
    width: 100%;
    height: 98px;
    font-size: 14px;
    color: #999;
    // 超出部分省略号
    display: -webkit-box;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    -webkit-line-clamp: 4; /* 限制显示行数，可自行调 */
    word-break: break-word; /* 超长单词自动换行 */
    white-space: normal; /* 允许换行 */
  }
}
</style>
