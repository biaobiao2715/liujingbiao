<!--
  标题: PopularizLawComponent.vue
  功能: 普法专栏组件
  说明: 显示普法内容、普法活动、普法白皮书
  当前版本: 1.0
  开发信息: Created by 李春雷 2025-12-06
-->
<template>
  <div class="populariz-law">
    <div class="header flex-center-between">
      <div class="title">普法专栏</div>
      <div class="more flex-center gap-4" @click="handleMoreList()">
        <div>查看更多</div>
        <img src="@/assets/mall/more.png" width="18" />
      </div>
    </div>

    <div class="content">
      <div class="flex-center gap-24">
        <el-tabs v-model="activeTab" @tab-click="handleTabChange">
          <el-tab-pane v-for="tab in tabsList" :key="tab.value" :label="tab.label" :name="tab.value" />
        </el-tabs>
      </div>

      <el-scrollbar height="600px" v-loading="loading">
        <div class="data-list" v-if="dataList.length > 0">
          <div class="law-title flex-center gap-12" v-for="(item, index) in dataList" :key="item.type" @click="handleDetail(item.id)">
            <div :class="[{ 'three': index < 3 }, 'index flex-center-center']">{{ index + 1 }}</div>
            <div>{{ item.contentTitle || item.activityTitle || item.paperTitle }}</div>
          </div>
        </div>
        <el-empty v-else style="margin-top: 145px"></el-empty>
      </el-scrollbar>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { getContentList } from '@/api/expertServicePlatform/legalServiceManage/contentManage';
import { getActivityList } from '@/api/expertServicePlatform/legalServiceManage/activityManage';
import { getWhitePaperList } from '@/api/expertServicePlatform/legalServiceManage/whitePaperManage';

const emit = defineEmits(['detailChange']);

const loading = ref(false);

const tabsList = [
  { label: '普法内容', value: 'lawContentDetail' },
  { label: '普法活动', value: 'lawActivityDetail' },
  { label: '普法白皮书', value: 'whitepaperDetail' }
];
const activeTab = ref('lawContentDetail');

const dataList = ref([]);
const pageNum = ref(1);
const pageSize = 999;
const hasMore = ref(true);

onMounted(() => {
  getDataList();
});

const handleTabChange = (tab: any) => {
  activeTab.value = tab.props.name;
  pageNum.value = 1;
  resetData();
  getDataList();
};

const resetData = () => {
  dataList.value = [];
  pageNum.value = 1;
  hasMore.value = true;
};

const getDataList = async () => {
  if (!hasMore.value) return;
  loading.value = true;
  try {
    const res: any = await (activeTab.value === 'lawContentDetail'
      ? getContentList({ pageNum: pageNum.value, pageSize, contentStatus: '2' })
      : activeTab.value === 'lawActivityDetail'
        ? getActivityList({ pageNum: pageNum.value, pageSize, activityStatus: '1' })
        : getWhitePaperList({ pageNum: pageNum.value, pageSize, paperStatus: '1' }));
    if (res.code === 200) {
      dataList.value = res.rows || [];
      // dataList.value = [...dataList.value, ...rows];
      // hasMore.value = rows.length === pageSize;
    }
  } catch {
  } finally {
    loading.value = false;
  }
};

const loadMore = () => {
  console.log('-=-=-=-=-=');
  pageNum.value += 1;
  getDataList();
};

const handleDetail = (id: string) => {
  emit('detailChange', { type: activeTab.value, id });
};

const handleMoreList = () => {
  emit('detailChange', { type: 'lawList' });
};
</script>

<style scoped lang="scss">
.populariz-law {
  flex: 1.5;
  background-color: #fff;
  border-radius: 8px;
  .header {
    padding: 20px;
    border-radius: 8px 8px 0 0;
    background: linear-gradient(to bottom, rgba(16, 140, 88, 0.1), #fff);
    .title {
      color: #3d3d3d;
      font-size: 20px;
      font-weight: bold;
      border-left: 4px solid #108c58;
      padding-left: 8px;
      line-height: 16px;
    }
    .more {
      cursor: pointer;
      color: rgba(51, 51, 51, 0.8);
      font-size: 14px;
      &:hover {
        color: var(--color-main);
      }
    }
  }

  .content {
    padding: 0 20px;
  }
  .data-list {
    margin-top: 12px;
    .law-title {
      margin-bottom: 12px;
      cursor: pointer;
      font-size: 14px;
      color: #333333;
      .index {
        width: 12px;
        height: 12px;
        color: #fff;
        font-size: 10px;
        background-color: #b6b5b5;
        border-radius: 2px;
      }
      .three {
        background-color: var(--color-main);
      }
      &:hover {
        color: var(--color-main);
      }
    }
  }
}

::v-deep .el-tabs__nav-wrap:after {
  display: none !important;
}
</style>
