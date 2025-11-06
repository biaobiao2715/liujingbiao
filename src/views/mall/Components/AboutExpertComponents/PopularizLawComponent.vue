<template>
  <div class="populariz-law">
    <el-card v-loading="loading">
      <template #header>
        <div class="flex-center gap-24">
          <div class="card-header">普法宣传</div>
          <el-segmented v-model="activeTab" :options="tabsList" @change="handleTabChange" />
        </div>
      </template>

      <el-scrollbar height="200px" @end-reached="loadMore">
        <div class="data-list">
          <div class="title flex-center gap-12" v-for="item in dataList" :key="item.type" @click="handleDetail(item.id)">
            <div class="point"></div>
            <div>{{ item.contentTitle || item.activityTitle || item.paperTitle }}</div>
          </div>
        </div>
      </el-scrollbar>
    </el-card>
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
  { label: '国家政策法规', value: 'policy' },
  { label: '普法活动', value: 'activity' },
  { label: '普法白皮书', value: 'whitepaper' }
];
const activeTab = ref('policy');

const dataList = ref([]);
const pageNum = ref(1);
const pageSize = 15;
const hasMore = ref(true);

onMounted(() => {
  getDataList();
});

const handleTabChange = (tab: any) => {
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
    const res: any = await (activeTab.value === 'policy'
      ? getContentList({ pageNum: pageNum.value, pageSize })
      : activeTab.value === 'activity'
        ? getActivityList({ pageNum: pageNum.value, pageSize })
        : getWhitePaperList({ pageNum: pageNum.value, pageSize }));
    if (res.code === 200) {
      const rows = res.rows || [];
      dataList.value = [...dataList.value, ...rows];
      hasMore.value = rows.length === pageSize;
      pageNum.value += 1;
    }
  } catch {
  } finally {
    loading.value = false;
  }
};

const loadMore = () => {
  console.log('-=-=-=-=-=');
  getDataList();
};

const handleDetail = (id: string) => {
  console.log(id);
  emit('detailChange', { type: 'lawContentDetail', id });
};
</script>

<style scoped lang="scss">
.populariz-law {
  flex: 1.5;
  .card-header {
    font-size: 20px;
    font-weight: bold;
  }
  .data-list {
    margin-top: 12px;
    .title {
      margin-bottom: 12px;
      cursor: pointer;
      .point {
        width: 8px;
        height: 8px;
        background-color: #000;
        border-radius: 50%;
      }
    }
    .title:hover {
      color: var(--el-color-primary);
    }
  }
  .content {
    font-size: 16px;
    line-height: 1.5;
  }
}
</style>
