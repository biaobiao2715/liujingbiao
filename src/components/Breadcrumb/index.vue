<template>
  <el-breadcrumb class="app-breadcrumb" separator="/">
    <transition-group name="breadcrumb">
      <el-breadcrumb-item v-for="(item, index) in levelList" :key="item.path">
        <svg-icon v-if="index == 0" :icon-class="item.meta.icon" style="margin-right: 4px; font-size: 16px" />
        <span v-if="index == 0" style="margin-right: 4px; color: #a8abb2; font-weight: bold"> / </span>
        <span
          v-if="item.redirect === 'noRedirect' || index == levelList.length - 1"
          class="no-redirect"
          :class="{ 'lastTitle': index == levelList.length - 1 }"
          >{{ item.meta?.title }}</span
        >
        <!-- <a v-else @click.prevent="handleLink(item)" style="">{{ item.meta?.title }}</a> -->
      </el-breadcrumb-item>
    </transition-group>
  </el-breadcrumb>
</template>

<script setup lang="ts">
import { RouteLocationMatched } from 'vue-router';
import { usePermissionStore } from '@/store/modules/permission';

const route = useRoute();
const router = useRouter();
const permissionStore = usePermissionStore();
const levelList = ref<RouteLocationMatched[]>([]);
const levelListNew = ref<RouteLocationMatched[]>([]);

const getBreadcrumb = () => {
  // only show routes with meta.title
  let matched = [];
  const pathNum = findPathNum(route.path);
  // multi-level menu
  if (pathNum > 2) {
    const reg = /\/\w+/gi;
    const pathList = route.path.match(reg).map((item, index) => {
      if (index !== 0) item = item.slice(1);
      return item;
    });
    getMatched(pathList, permissionStore.defaultRoutes, matched);
  } else {
    matched = route.matched.filter((item) => item.meta && item.meta.title);
  }
  // 判断是否为首页
  if (!isDashboard(matched[0])) {
    matched = [{ path: '/index', meta: { title: '首页' } }].concat(matched);
  }
  levelListNew.value = matched.filter((item) => item.meta && item.meta.title && item.meta.breadcrumb !== false);
  levelList.value = levelListNew.value.slice(1);
  // console.log('🚀 ~ getBreadcrumb ~ levelList.value :', levelList.value);
};
const findPathNum = (str, char = '/') => {
  if (typeof str !== 'string' || str.length === 0) return 0;
  return str.split(char).length - 1;
};
const getMatched = (pathList, routeList, matched) => {
  const data = routeList.find((item) => item.path == pathList[0] || (item.name += '').toLowerCase() == pathList[0]);
  if (data) {
    matched.push(data);
    if (data.children && pathList.length) {
      pathList.shift();
      getMatched(pathList, data.children, matched);
    }
  }
};
const isDashboard = (route: RouteLocationMatched) => {
  const name = route && (route.name as string);
  if (!name) {
    return false;
  }
  return name.trim() === 'Index';
};
const handleLink = (item) => {
  const { redirect, path } = item;
  redirect ? router.push(redirect) : router.push(path);
};

watchEffect(() => {
  // if you go to the redirect page, do not update the breadcrumbs
  if (route.path.startsWith('/redirect/')) return;
  getBreadcrumb();
});
onMounted(() => {
  getBreadcrumb();
});
</script>

<style lang="scss" scoped>
.app-breadcrumb.el-breadcrumb {
  display: inline-block;
  font-size: 14px;
  line-height: 50px;
  margin-left: 8px;

  .no-redirect {
    font-family:
      PingFang SC,
      PingFang SC;
    font-weight: 400;
    font-size: 14px;
    color: #4e5969;
    line-height: 22px;
    text-align: left;
    font-style: normal;
    text-transform: none;
    cursor: text;
  }
}
.lastTitle {
  font-family:
    PingFang SC,
    PingFang SC;
  font-weight: 500;
  font-size: 14px;
  color: #1d2129 !important;
  line-height: 22px;
  text-align: left;
  font-style: normal;
  text-transform: none;
}
</style>
