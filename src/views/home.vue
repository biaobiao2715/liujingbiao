<template>
  <div class="application-container">
    <div class="user-info-bar flex-center-between">
      <img src="@/assets/images/logo.svg" width="32" />
      <div class="user-info flex-center gap-12">
        <el-icon color="#fff"><Bell /></el-icon>
        <div class="dept-name">{{ userInfo?.deptName }}</div>
        <el-button type="primary" @click="handleLogout">退出登录</el-button>
        <div class="user-name flex-center-center">{{ userInfo?.nickName }}</div>
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

    <!-- 权限申请弹窗 -->
    <PermissionPopup v-model:visible="permissionPopupVisible" :initial-data="permissionPopupData" :audit-status="auditStatus" />
  </div>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance, onMounted } from 'vue';
import type { ComponentInternalInstance } from 'vue';
import { useRouter } from 'vue-router';
import { getInfo, thirdPartyLogin, queryTraceableUser } from '@/api/login';
import { ElMessageBox } from 'element-plus';
import { useUserStore } from '@/store/modules/user';
import { initSSE } from '@/utils/sse';
import { getRouters } from '@/api/menu';
import PermissionPopup from './permissionPopup/PermissionPopup.vue';
import { getToken } from '@/utils/auth';

const userStore = useUserStore();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

// 路由实例
const router = useRouter();
const userInfo = ref();
// 应用数据
const applications = ref([
  {
    title: '平台管理系统',
    description: '该应用为内部人员对供应商进行管理：如：入驻供应商审核、供应商启用/停用、供应商上架商品审核等',
    icon: 'application-icon-4.svg',
    bg: 'application-bg-4.svg',
    redirect: '/platform/index',
    type: ['0']
  },
  // 供应商
  {
    title: '供应商销售平台',
    description: '供应商系统负责入驻供应商对自己商品进行上/下架及价格管理、订单管理、供给管理等',
    icon: 'application-icon-3.svg',
    bg: 'application-bg-3.svg',
    redirect: '/supplierPlatform/productManagement',
    type: ['2']
  },
  // 企业
  {
    title: '企业销售平台',
    description: '企业系统负责入驻企业对自己商品进行上/下架及价格管理、订单管理、供给管理等',
    icon: 'application-icon-3.svg',
    bg: 'application-bg-3.svg',
    redirect: '/enterprise/productManagement',
    type: ['3']
  },
  // 采购商
  {
    title: '种子经纪服务平台',
    description: '采购商在商城下单、比价、收藏商品、收货地址管理、发布采购需求、查阅供给需求信息、商品市场行情等',
    icon: 'application-icon-5.svg',
    bg: 'application-bg-5.svg',
    redirect: '/mall',
    type: ['1']
  },
  // 采购商
  {
    title: '农资农具销售服务平台',
    description: '采购商在商城下单、比价、收藏商品、收货地址管理、发布采购需求、查阅供给需求信息、商品市场行情等',
    icon: 'application-icon-3.svg',
    bg: 'application-bg-3.svg',
    redirect: '/mall',
    type: ['1']
  },
  // 供应商、企业
  {
    title: '种子维权服务平台',
    description: '平台审核举报，生成案件，全程跟踪处理，实现维权闭环管理',
    icon: 'application-icon-4.svg',
    bg: 'application-bg-4.svg',
    redirect: '/rightsPlatform/way/customerreport',
    type: ['2', '3']
  },
  // 技术专家、法务专家
  {
    title: '种子技术服务平台',
    description: '整合种业知识库、培训直播与专家咨询，提供全链技术服务等',
    icon: 'application-icon-4.svg',
    bg: 'application-bg-4.svg',
    redirect: '/skill/knowledgeBaseManage',
    type: ['4', '5']
  },
  // 供应商、企业、采购商
  {
    title: '种子金融服务平台',
    description: '面向农户、经销商、供应商等多元化客户群体，提供金融政策与风险案例的查询服务，以及金融产品的展示与申请功能',
    icon: 'application-icon-7.svg',
    bg: 'application-bg-7.svg',
    redirect: '/financeFront/index',
    type: ['1', '2', '3']
  },

  // 金融机构
  {
    title: '种子金融服务管理平台',
    description: '专为金融机构及管理用户设计，支持金融政策与风险案例的新增、编辑与维护，同时提供金融产品的新增、修改、审批及全生命周期管理功能',
    icon: 'application-icon-4.svg',
    bg: 'application-bg-4.svg',
    redirect: '/credit/dashboard',
    type: ['6']
  },
  {
    title: '育种环境监测服务平台',
    description: '育种环境监测服务系统是一个集设备管控、数据汇聚、智能预警与多维分析于一体的综合管理平台',
    icon: 'application-icon-7.svg',
    bg: 'application-bg-7.svg',
    redirect: 'environmentMonitor',
    type: ['0', '3']
  },
  // 所有人
  {
    title: '全链条溯源服务系统',
    description: '覆盖企业、基地、生产、质检、加工、销售等环节，实现农产品从田间到餐桌的全过程可追溯',
    icon: 'application-icon-7.svg',
    bg: 'application-bg-7.svg',
    redirect: 'thirdPartyLogin',
    type: ['0', '1', '2', '3', '4', '5']
  }
]);

const currentPlatform = ref([]);

const tenantType = ref('');
const permissionPopupVisible = ref(false);
const permissionPopupData = ref<any>(null);
const auditStatus = ref<number | null>(null);

onMounted(async () => {
  // getRouterList()
  getUserInfo();
});

const getUserInfo = async () => {
  const res: any = await getInfo();
  const routeRes = await getRouters();
  const { data } = routeRes;
  const homeData =
    data.filter((item: any) => {
      return item.path === '/applications';
    })[0]?.children || [];

  userInfo.value = res.data.user;
  userInfo.value.nickName = res.data.user.nickName.length > 2 ? res.data.user.nickName.slice(-2) : res.data.user.nickName;
  tenantType.value = res.data.tenantType;

  if (res.data.superAdmin) {
    const thirdData = homeData.find((item: any) => item.path === 'thirdPartyLogin');

    currentPlatform.value = [
      {
        title: homeData[0].meta.title,
        description: homeData[0]?.remark,
        redirect: homeData[0].path,
        icon: 'application-icon-7.svg',
        bg: 'application-bg-7.svg'
      },
      {
        title: thirdData.meta.title,
        description: thirdData?.remark,
        redirect: thirdData.path,
        icon: 'application-icon-7.svg',
        bg: 'application-bg-7.svg'
      }
    ];
  } else {
    currentPlatform.value = homeData.map((item: any, index: number) => {
      return {
        title: item.meta.title,
        description: item.remark,
        redirect: item.path,
        icon: 'application-icon-7.svg',
        bg: 'application-bg-7.svg'
      };
    });
  }
  // 采购商
  // currentPlatform.value = applications.value.filter((e) => e.type && e.type.includes(res.data.tenantType));
};

const getIcon = (svgName: string) => {
  return new URL(`../assets/images/${svgName}`, import.meta.url).href;
};

// 处理点击跳转 用axios原始请求方式
const handleRedirect = async (path: string) => {
  // 跳转到第三方溯源系统
  const token = getToken();
  if (path === 'thirdPartyLogin') {
    // 调用溯源用户校验接口
    try {
      const response: any = await queryTraceableUser({});
      if (response?.data) {
        permissionPopupData.value = response.data;
        auditStatus.value = response.data.auditStatus;

        // 根据审核状态决定是否显示弹窗
        if (auditStatus.value == 1) {
          // 审核通过，直接跳转
          handlePermissionSubmit(response?.data?.tenantId);
        } else {
          // 其他状态，显示弹窗
          permissionPopupVisible.value = true;
        }
      } else {
        // 没有数据，显示空表单
        permissionPopupData.value = null;
        auditStatus.value = null;
        permissionPopupVisible.value = true;
      }
    } catch (error) {
      console.error('查询溯源用户失败:', error);
      // 查询失败，显示空表单
      permissionPopupData.value = null;
      auditStatus.value = null;
      permissionPopupVisible.value = true;
    }
    return;
  } else if (path.includes('http')) {
    if (path.includes('rmthingscore')) {
      window.open(path, '_blank');
    } else {
      window.open(path + '/' + token, '_blank');
    }
    return;
  }

  if (path) {
    // 不同角色进入到后台管理，定位不同页面
    // 移除掉字符串第一位的&符号
    router.push(path.replace(/^app/, ''));
    setTimeout(() => {
      initSSE(import.meta.env.VITE_APP_BASE_API + '/resource/sse');
    }, 2000);
  }
};

// 处理权限申请提交
const handlePermissionSubmit = async (tenantId: string) => {
  // 提交权限申请后，再执行第三方登录
  try {
    // const response = await axios.post(import.meta.env.VITE_APP_TRACEABLE_API_URL + '/third/thirdPartyLogin', {
    //   ...getCacheInfo()
    // });
    const res = await thirdPartyLogin({
      tenantId,
      ...getCacheInfo()
    });

    if (res.code === 200 && res.data?.accessToken) {
      const token = res.data.accessToken;
      // http://8.153.15.72:82
      // 1. 打开第三方系统
      const newWindow = window.open(res.data.redirectUrl, '_blank');
      // 等新页面加载一会，再发送消息
      setTimeout(() => {
        if (!newWindow) return;
        newWindow.postMessage({ type: 'SET_TOKEN', token }, res.data.redirectUrl);
      }, 300); // 基本 300~500ms 足够
    }
  } catch (error) {
    console.error('第三方登录失败:', error);
  }
};

// 获取用户信息
const getCacheInfo = () => {
  const clientId = import.meta.env.VITE_APP_CLIENT_ID;
  return {
    username: userStore.userName,
    password: '111111',
    clientId,
    'form': true,
    'grantType': 'password'
    // 'username': '18000000000',
    // 'password': '$2a$10$N.zmdr9k7uOCQb0bta/Oaurb.NyTiOcx0XaRiPURlbFsy6f.dRqNS',
    // 'tenantId': '000000',
    // 'form': true,
    // 'grantType': 'password',
    // 'clientId': 'e5cd7e4891bf95d1d19206ce24a7b32e'
  };
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
    line-clamp: 4;
    word-break: break-word; /* 超长单词自动换行 */
    white-space: normal; /* 允许换行 */
  }
}
</style>
