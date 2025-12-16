<!--
  标题: LawListComponent.vue
  功能: 普法专栏列表静态页
  说明: 按截图布局，暂无接口先用假数据
  当前版本: 1.0
-->
<template>
  <div class="pilicy-page" v-loading="loading">
    <div class="pilicy-content">
      <div class="title">普法内容</div>
      <div class="list">
        <el-row :gutter="24">
          <el-col :span="12" v-for="item in policyList" :key="item">
            <div class="item flex-center gap-12" @click="handleDetail(item.id, 'lawContentDetail')">
              <div class="point"></div>
              <div class="name">{{ item.contentTitle }}</div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
    <el-row :gutter="16" class="mt-16">
      <el-col :span="12">
        <div class="pilicy-content">
          <div class="title">普法活动</div>
          <div class="list">
            <el-row :gutter="24">
              <el-col :span="24" v-for="item in activeList" :key="item">
                <div class="item flex-center gap-12" @click="handleDetail(item.id, 'lawActivityDetail')">
                  <div class="point"></div>
                  <div class="name">{{ item.activityTitle }}</div>
                </div>
              </el-col>
            </el-row>
          </div>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="pilicy-content">
          <div class="title">普法白皮书</div>
          <div class="list">
            <el-row :gutter="24">
              <el-col :span="24" v-for="item in paperList" :key="item">
                <div class="item flex-center gap-12" @click="handleDetail(item.id, 'whitepaperDetail')">
                  <div class="point"></div>
                  <div class="name">{{ item.paperTitle }}</div>
                </div>
              </el-col>
            </el-row>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { getContentList } from '@/api/expertServicePlatform/legalServiceManage/contentManage';
import { getActivityList } from '@/api/expertServicePlatform/legalServiceManage/activityManage';
import { getWhitePaperList } from '@/api/expertServicePlatform/legalServiceManage/whitePaperManage';

const emit = defineEmits(['detailChange']);

const policyList = ref([]);

const activeList = ref([]);

const paperList = ref([]);

const queryParams = {
  pageNum: 1,
  pageSize: 999
};

const loading = ref(false);

onMounted(() => {
  getDataList();
});

const getDataList = async () => {
  loading.value = true;
  try {
    const res1: any = await getContentList({ ...queryParams, contentStatus: '2' });
    if (res1.code === 200) {
      policyList.value = res1.rows || [];
    }
    const res2: any = await getActivityList({ ...queryParams, activityStatus: '1' });
    if (res2.code === 200) {
      activeList.value = res2.rows || [];
    }
    const res3: any = await getWhitePaperList({ ...queryParams, paperStatus: '1' });
    if (res3.code === 200) {
      paperList.value = res3.rows || [];
    }
  } catch {
  } finally {
    loading.value = false;
  }
};

const handleDetail = (id: string, type: string) => {
  emit('detailChange', { id, type });
};
</script>

<style scoped lang="scss">
.pilicy-content {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  .title {
    color: #3d3d3d;
    font-size: 20px;
    font-weight: bold;
    border-left: 4px solid #108c58;
    padding-left: 8px;
    line-height: 16px;
    margin-bottom: 16px;
  }
  .list {
    height: 420px;
    overflow-y: auto;
    overflow-x: hidden;
    .item {
      padding: 12px 0;
      border-bottom: 1px dashed #d8d8d8;
      .point {
        width: 4px;
        height: 4px;
        background: #108c58;
      }
      .name {
        width: calc(100% - 16px);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-weight: 400;
        font-size: 14px;
        color: #333333;
        line-height: 14px;
        cursor: pointer;

        &:hover {
          color: #108c58;
        }
      }
    }
  }
}

.mt-16 {
  margin-top: 16px;
}
</style>
