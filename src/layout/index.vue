<template>
  <div :class="classObj" class="app-wrapper" :style="{ '--current-color': theme }">
    <div v-if="device === 'mobile' && sidebar.opened" class="drawer-bg" @click="handleClickOutside" />

    <navbar ref="navbarRef" @set-layout="setLayout" style="background: #ffffff" />

    <side-bar v-if="!sidebar.hide" class="sidebar-container" />

    <div :class="{ hasTagsView: needTagsView, sidebarHide: sidebar.hide }" class="main-container">
      <div :class="{ 'fixed-header': fixedHeader }">
        <div class="breadcrumbList">
          <breadcrumb v-if="!settingsStore.topNav" id="breadcrumb-container" class="breadcrumb-container" />
        </div>
      </div>

      <!-- 修改这里：为 AppMain 添加单独的滚动容器 -->
      <div class="app-main-wrapper">
        <app-main />
      </div>

      <settings ref="settingRef" />
    </div>
  </div>
</template>

<script setup lang="ts">
import SideBar from './components/Sidebar/index.vue';
import { AppMain, Navbar, Settings, TagsView } from './components';
import { useAppStore } from '@/store/modules/app';
import { useSettingsStore } from '@/store/modules/settings';
import { initWebSocket } from '@/utils/websocket';
import { initSSE } from '@/utils/sseOld';

const settingsStore = useSettingsStore();
const theme = computed(() => settingsStore.theme);
const sidebar = computed(() => useAppStore().sidebar);
const device = computed(() => useAppStore().device);
const needTagsView = computed(() => settingsStore.tagsView);
const fixedHeader = computed(() => {
  console.log('🚀 ~ fixedHeader:', fixedHeader);
  return settingsStore.fixedHeader;
});

const classObj = computed(() => ({
  hideSidebar: !sidebar.value.opened,
  openSidebar: sidebar.value.opened,
  withoutAnimation: sidebar.value.withoutAnimation,
  mobile: device.value === 'mobile'
}));

const { width } = useWindowSize();
const WIDTH = 992; // refer to Bootstrap's responsive design

watchEffect(() => {
  if (device.value === 'mobile') {
    useAppStore().closeSideBar({ withoutAnimation: false });
  }
  if (width.value - 1 < WIDTH) {
    useAppStore().toggleDevice('mobile');
    useAppStore().closeSideBar({ withoutAnimation: true });
  } else {
    useAppStore().toggleDevice('desktop');
  }
});

const navbarRef = ref<InstanceType<typeof Navbar>>();
const settingRef = ref<InstanceType<typeof Settings>>();

onMounted(() => {
  nextTick(() => {
    navbarRef.value?.initTenantList();
  });
});

onMounted(() => {
  const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
  initWebSocket(protocol + window.location.host + import.meta.env.VITE_APP_BASE_API + '/resource/websocket');
});

onMounted(() => {
  initSSE(import.meta.env.VITE_APP_BASE_API + '/resource/sse');
});

const handleClickOutside = () => {
  useAppStore().closeSideBar({ withoutAnimation: false });
};

const setLayout = () => {
  settingRef.value?.openSetting();
};
</script>
<style lang="scss" scoped>
@use '@/assets/styles/mixin.scss';
@use '@/assets/styles/variables.module.scss' as *;

.app-wrapper {
  @include mixin.clearfix;
  position: relative;
  height: 100vh; // 使用视口高度
  width: 100%;
  display: flex;
  flex-direction: column;

  &.mobile.openSidebar {
    position: fixed;
    top: 0;
  }
}

.drawer-bg {
  background: #000;
  opacity: 0.3;
  width: 100%;
  top: 0;
  height: 100%;
  position: absolute;
  z-index: 999;
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden; // 防止外部容器滚动
}

.fixed-header {
  position: sticky; // 改为 sticky 定位
  top: 0;
  z-index: 9;
  width: 100%;
  background: $fixed-header-bg;
  flex-shrink: 0; // 防止被压缩
}

// AppMain 滚动容器
.app-main-wrapper {
  flex: 1;
  box-sizing: border-box;
  overflow: auto; // 只有这个区域会滚动
  position: relative;
}

.breadcrumbList {
  background: #f7f8fa;
  margin-left: 10px;
  /* padding: 8px 16px; // 添加一些内边距 */
}

// 响应式调整
.hideSidebar .main-container {
  margin-left: 54px;
}

.sidebarHide .main-container {
  margin-left: 0;
}

.mobile .main-container {
  margin-left: 0;
}
/* 隐藏所有元素的默认滚动条 */
* {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

*::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}

/* 只在需要的地方显示滚动条 */
.scroll-container {
  scrollbar-width: thin;
  -ms-overflow-style: auto;
}

.scroll-container::-webkit-scrollbar {
  display: block;
  width: 6px;
}
</style>
