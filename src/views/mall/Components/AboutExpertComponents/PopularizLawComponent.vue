<template>
  <div class="populariz-law">
    <el-card>
      <template #header>
        <div class="flex-center gap-24">
          <div class="card-header">普法宣传</div>
          <el-segmented v-model="activeTab" :options="tabsList" @change="handleTabChange" />
        </div>
      </template>

      <div class="data-list">
        <div v-for="item in dataList" :key="item.type">
          <div class="title">{{ item.title }}</div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { getContentList } from '@/api/expertServicePlatform/legalServiceManage/contentManage';
import { getActivityList } from '@/api/expertServicePlatform/legalServiceManage/activityManage';
import { getWhitePaperList } from '@/api/expertServicePlatform/legalServiceManage/whitePaperManage';

// 改成lable value形式
const tabsList = [
  { label: '国家政策法规', value: 'policy' },
  { label: '普法活动', value: 'activity' },
  { label: '普法白皮书', value: 'whitepaper' }
];
const activeTab = ref('policy');

const dataList = ref();

onMounted(() => {
  getDataList();
});

const handleTabChange = (tab: any) => {
  console.log('当前选中的标签:', tab);
  getDataList();
};

const getDataList = async () => {
  const res: any =
    (await activeTab.value) === 'policy'
      ? getContentList({ pageNum: 1, pageSize: 999 })
      : activeTab.value === 'activity'
        ? getActivityList({ pageNum: 1, pageSize: 999 })
        : getWhitePaperList({ pageNum: 1, pageSize: 999 });
  dataList.value = res.data;
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
    height: 544px;
    overflow: auto;
    margin-top: 12px;
  }
  .content {
    font-size: 16px;
    line-height: 1.5;
  }
}
</style>
