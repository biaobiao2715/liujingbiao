<!--
  标题: index.vue
  功能: 个人中心
  说明: 个人中心，包含我的订单、我的收藏/我的提问/地址管理/我发布的需求。
  当前版本: 1.1
  变更:
    - 使用动态组件 + 异步加载主内容组件与详情组件（更快首屏/更好可维护性）
    - 统一事件监听/解绑，避免内存泄漏
    - 类型完善，避免魔法字符串
    - 修复左侧菜单底部装饰定位（父元素增加 position: relative）
    - 详情弹窗增加 key 以在 id/type 变化时强制刷新
-->
<template>
  <div class="personal-center-page">
    <div class="container_width">
      <div class="main-row">
        <!-- 侧边栏菜单 -->
        <div class="menu-col">
          <div class="menu-title">个人中心</div>
          <ul class="menu">
            <li
              v-for="item in menuItems"
              :key="item.id"
              :class="{ active: item.component === selectedComponent }"
              @click="selectMenu(item.component)"
            >
              {{ item.title }}
            </li>
          </ul>
          <div class="menu-bottom-bg"></div>
        </div>

        <!-- 主内容区域：动态组件 + 缓存 -->
        <div class="content-col">
          <keep-alive>
            <component :is="currentMainComponent" v-if="currentMainComponent" :key="selectedComponent" />
          </keep-alive>
        </div>
      </div>
    </div>

    <!-- 对话框：根据 detailsType 动态展示详情组件 -->
    <el-dialog
      v-model="detailDialogVisible"
      :title="detailDialogTitle"
      width="80%"
      append-to-body
      destroy-on-close
      :close-on-click-modal="false"
      @close="handleDetailClose"
    >
      <component v-if="currentDetailComponent" :is="currentDetailComponent" :key="detailsId" :id="detailsId" @close="requestDetailClose" />
      <div v-else class="empty-detail">暂无可展示的详情</div>

      <template #footer>
        <el-button @click="requestDetailClose">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, onBeforeUnmount, defineAsyncComponent } from 'vue';
import type { Component } from 'vue';
import { eventBus } from '@/utils/eventBus';
import { pushNoAnswerQuestionMessage } from '@/api/mall/personalCenter/orders';

interface Props {
  command?: string | number | object;
}

const props = withDefaults(defineProps<Props>(), {
  command: 'order'
});

const emit = defineEmits<{
  (e: 'nextStep'): void;
}>();

// 菜单与选择类型
type SelectedKey = 'order' | 'collection' | 'question' | 'address' | 'myDemand' | 'participated' | 'myReport' | 'varietyIdentification';

// 详情类型
type DetailType = 'goods' | 'essay' | 'course' | 'meeting' | 'lawContent' | 'lawActivity' | '';

// 详情状态
const detailsId = ref<string>('');
const detailsType = ref<DetailType>('');

// 菜单数据
const menuItems = ref<{ id: number; title: string; component: SelectedKey }[]>([
  { id: 1, title: '我的订单', component: 'order' },
  { id: 2, title: '我的收藏', component: 'collection' },
  { id: 3, title: '我的提问', component: 'question' },
  { id: 4, title: '地址管理', component: 'address' },
  { id: 5, title: '我发布的需求', component: 'myDemand' },
  { id: 6, title: '我参与的', component: 'participated' },
  { id: 7, title: '我的举报', component: 'myReport' },
  { id: 8, title: '品种识别记录', component: 'varietyIdentification' }
]);

const selectedComponent = ref<SelectedKey>(menuItems.value[0].component);

// 当前标题来自菜单，不再维护重复映射
const currentTitle = computed(() => {
  return menuItems.value.find((m) => m.component === selectedComponent.value)?.title ?? '我的订单';
});

function goBack() {
  eventBus.emit('activeTabChange', 'goods');
}

function selectMenu(val: unknown) {
  const match = menuItems.value.find((item) => item.component === val);
  if (match) selectedComponent.value = match.component;
  eventBus.emit('navigationChange', 'personal,' + selectedComponent.value);
}

// 主内容组件：按需加载，降低首屏体积
const mainComponentMap: Record<SelectedKey, Component> = {
  order: defineAsyncComponent(() => import('./Components/orders.vue')),
  collection: defineAsyncComponent(() => import('./Components/favorites.vue')),
  question: defineAsyncComponent(() => import('./Components/questions.vue')),
  address: defineAsyncComponent(() => import('./Components/addressManagement.vue')),
  myDemand: defineAsyncComponent(() => import('./Components/requests.vue')),
  participated: defineAsyncComponent(() => import('./Components/participatedRequests.vue')),
  myReport: defineAsyncComponent(() => import('./Components/myReport.vue')),
  varietyIdentification: defineAsyncComponent(() => import('./Components/varietyIdentification.vue'))
};

const currentMainComponent = computed<Component | null>(() => mainComponentMap[selectedComponent.value] || null);

// 详情弹窗
const detailDialogVisible = ref(false);

// 详情组件映射：按需加载
const componentMap: Record<Exclude<DetailType, ''>, Component> = {
  goods: defineAsyncComponent(() => import('@/views/mall/Components/GoodsDetailComponent.vue')),
  essay: defineAsyncComponent(() => import('@/views/mall/Components/AboutExpertComponents/EssayDetailComponent.vue')),
  course: defineAsyncComponent(() => import('@/views/mall/Components/AboutExpertComponents/CourseDetailComponent.vue')),
  meeting: defineAsyncComponent(() => import('@/views/mall/Components/AboutExpertComponents/MeetingDetailComponent.vue')),
  lawContent: defineAsyncComponent(() => import('@/views/mall/Components/AboutExpertComponents/LawContentDetailComponent.vue')),
  lawActivity: defineAsyncComponent(() => import('@/views/mall/Components/AboutExpertComponents/LawActivityDetailComponent.vue'))
};

const titleMap: Record<Exclude<DetailType, ''>, string> = {
  goods: '商品详情',
  essay: '文章详情',
  course: '课程详情',
  meeting: '会议详情',
  lawContent: '普法内容详情',
  lawActivity: '普法活动详情'
};

const currentDetailComponent = computed<Component | null>(() => {
  return detailsType.value ? (componentMap[detailsType.value as Exclude<DetailType, ''>] ?? null) : null;
});
const detailDialogTitle = computed(() => {
  return detailsType.value ? (titleMap[detailsType.value as Exclude<DetailType, ''>] ?? '详情') : '详情';
});

// 关闭弹窗并清理
function requestDetailClose() {
  // 仅触发对话框关闭，由 el-dialog 的 @close 统一收尾与刷新
  detailDialogVisible.value = false;
}

function handleDetailClose() {
  const payload = {
    key: selectedComponent.value,
    detailType: detailsType.value,
    id: detailsId.value
  };
  // 清理状态
  detailsId.value = '';
  detailsType.value = '';
  // 关闭后通知当前列表刷新
  try {
    eventBus.emit('refreshPersonalCenterList', payload);
  } catch {
    // 忽略事件总线异常，避免影响关闭流程
  }
}

// 事件处理器（需要在 on/off 时保持同一引用）
const showDetailsHandler = ({ id, type }: { id: number | string; type: DetailType }) => {
  detailsId.value = String(id ?? '');
  detailsType.value = type || '';
  detailDialogVisible.value = !!(detailsType.value && detailsId.value);
};

onMounted(() => {
  // 推送未回答问题提示信息
  pushNoAnswerQuestionMessage();

  // 监听显示详情页事件
  eventBus.on('showDetailspage', showDetailsHandler);
});

onBeforeUnmount(() => {
  // 组件卸载时解绑事件
  // 兼容不同事件总线实现（如 mitt）
  try {
    eventBus.off?.('showDetailspage', showDetailsHandler);
  } catch {
    // 忽略不支持 off 的实现
  }
});

// 外部传入的 command 变化时切换菜单（仅接受合法键）
const validKeys = new Set<SelectedKey>([
  'order',
  'collection',
  'question',
  'address',
  'myDemand',
  'participated',
  'myReport',
  'varietyIdentification'
]);
watch(
  () => props.command,
  (newCommand) => {
    if (typeof newCommand === 'string' && validKeys.has(newCommand as SelectedKey)) {
      selectMenu(newCommand);
    }
  },
  { immediate: true }
);
</script>

<style scoped lang="scss">
.personal-center-page {
  background-color: #f6f7fb;
  height: 100%;
  --el-color-primary: #108c58;
}

.container_width {
  width: 1494px;
  margin: 0 auto;
}

/* 顶部可点击返回条 */
.pc-breadcrumb {
  font-size: 14px;
  color: #999;
  line-height: 32px;
  margin: 0 0 16px 0;
  padding: 0;
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.crumb {
  color: #7c7c7c;
  font-weight: 400;
}

.crumb-sep {
  margin: 0 8px;
  color: #7c7c7c;
  font-weight: 400;
  font-size: 14px;
}

/* 主体行，控制整体宽度和居中 */
.main-row {
  display: flex;
  flex-wrap: nowrap; // 不允许子项换行
  min-height: 600px;
  padding-bottom: 40px;
  align-items: stretch;
}

/* 左侧菜单卡片 */
.menu-col {
  width: 210px;
  min-width: 210px;
  max-width: 210px;
  flex-shrink: 0; // 不允许缩小
  display: flex;
  flex-direction: column;
  background: #fff;
  position: relative; // 使底部装饰绝对定位生效
}

.menu-title {
  display: flex;
  align-items: center;
  height: 60px;
  padding-left: 20px;
  font-size: 20px;
  font-weight: 500;
  color: #333333;
  background: #fff;
  position: relative;
  border-bottom: 2px solid #d8d8d8;
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
}

.menu-title::before {
  content: '';
  display: inline-block;
  width: 2px;
  height: 14px;
  background: #108c58;
  border-radius: 4px;
  margin-right: 6px;
}

.menu {
  list-style: none;
  margin: 0;
  padding: 20px;
  li {
    position: relative;
    height: 36px;
    line-height: 36px;
    padding: 0 20px;
    border-radius: 4px;
    font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
    font-weight: 400;
    font-size: 14px;
    color: #3d3d3d;
    cursor: pointer;
  }
  li.active {
    color: #108c58;
    background: rgba(16, 140, 88, 0.1);
  }
  li:hover:not(.active) {
    color: #108c58;
    background: rgba(16, 140, 88, 0.1);
  }
}

/* 左侧菜单底部稻穗装饰 */
.menu-bottom-bg {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 210px;
  background: url('@/assets/images/mall/left-sidebar-bg.png') no-repeat left bottom/100% 100%;
  pointer-events: none;
  z-index: 1;
}

/* 右侧内容区，卡片化，圆角，阴影，内边距，宽度自适应剩余空间 */
.content-col {
  display: flex;
  flex-direction: column;

  border-radius: 0;
  margin-left: 20px !important;
  width: 1264px;
}

/* 表格 */
::v-deep .el-table__header th {
  background: #f6f7fb !important;
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  font-size: 14px;
  color: #3d3d3d;
}

/* tab标签 */
::v-deep .el-tabs__item {
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  font-size: 14px;
  color: #3d3d3d;
}

::v-deep .el-tabs__item.is-active {
  color: #108c58 !important; /* 选中字体颜色 */
}

::v-deep .el-tabs__item:hover {
  color: #108c58;
}

/* 详情缺省占位 */
.empty-detail {
  text-align: center;
  color: #999;
  padding: 24px 0;
}
</style>
