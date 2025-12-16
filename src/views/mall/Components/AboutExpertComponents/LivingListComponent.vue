<!--
  标题: LivingListComponent.vue
  功能: 直播列表组件
  说明: 
  当前版本: 1.0
  开发信息: Created by 李春雷 2025-12-08
-->
<template>
  <div class="living-list-container">
    <div class="header flex-center-between">
      <div class="header-title">在线直播</div>
      <div>
        <el-tabs v-model="activeTab" @tab-change="getVideoList">
          <el-tab-pane v-for="item in tabsList" :key="item.value" :label="item.label" :name="item.value"></el-tab-pane>
        </el-tabs>
      </div>
    </div>
    <div class="list-content" v-loading="loading">
      <el-row :gutter="16" v-if="liveData.length > 0">
        <el-col :span="6" v-for="item in liveData" :key="item">
          <div class="item">
            <img :src="item.coverImageUrl" width="100%" class="cover-img" @click="handleVideoClick(item)" />
            <div class="info-box">
              <div class="title">{{ item.title }}</div>
              <div class="description">{{ item.description }}</div>
            </div>
          </div>
        </el-col>
      </el-row>
      <el-empty v-else description="暂无直播" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { VideoList, addViewRecordsApi } from '@/api/mall/living/index';

const tabsList = ref([
  {
    label: '全部',
    value: '0'
  },
  {
    label: '最新发布时间',
    value: '1'
  },
  {
    label: '最多浏览量',
    value: '2'
  }
]);

const activeTab = ref('0');

const liveData = ref([]);

const loading = ref(false);

onMounted(() => {
  getVideoList();
});

// 获取直播列表
const getVideoList = async () => {
  loading.value = true;
  try {
    // 0、1默认按发布时间查，2按播放量查
    const params =
      activeTab.value === '1' ? { orderByColumn: 'createTime', isAsc: 'desc' } : activeTab.value === '2' ? { viewSort: true, sortDesc: true } : {};
    const res = await VideoList({
      videoStatus: '1', // 启用
      type: activeTab.value, // 0 默认，1 最新发布时间 2 最多播放量
      ...params
    });
    if (res.code === 200) {
      liveData.value = res.rows || res.data || [];
    }
  } catch (error) {
    liveData.value = [];
  } finally {
    loading.value = false;
  }
};

// 点击视频卡片，跳转到视频链接
const handleVideoClick = (item) => {
  // 调用增加播放量的接口
  addViewRecordsApi({ id: item.id, viewType: '8' });
  // 在新标签页打开视频链接
  window.open(item.videoUrl, '_blank');
};
</script>

<style scoped lang="scss">
.living-list-container {
  padding: 0 20px 20px 20px;
  background-color: #fff;
  border-radius: 8px;
  .header {
    margin-bottom: 20px;

    .header-title {
      color: #3d3d3d;
      font-size: 20px;
      font-weight: bold;
      border-left: 4px solid #108c58;
      padding-left: 8px;
      line-height: 16px;
    }
  }
  .list-content {
    .el-col {
      margin-bottom: 8px;
    }
    .item {
      border-radius: 8px;
      .cover-img {
        width: 100%;
        height: 100px;
        object-fit: cover;
        border-radius: 8px 8px 0 0;
        height: 265px;
        cursor: pointer;
      }
      .info-box {
        padding: 20px;
        border: 1px solid #d9d9d9;
        border-top: none;
        border-radius: 0 0 8px 8px;

        .title {
          font-weight: 500;
          font-size: 16px;
          color: #333333;
          margin-bottom: 16px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .description {
          font-weight: 400;
          font-size: 14px;
          color: #706f6f;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      }
    }
  }
}

::v-deep .el-tabs__nav-wrap:after {
  display: none !important;
}
</style>
