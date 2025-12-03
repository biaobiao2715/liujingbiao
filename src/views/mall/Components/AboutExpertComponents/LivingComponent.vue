<!--
  标题: LivingComponent.vue
  功能: 直播组件
  说明: 展示直播信息
  当前版本: 1.0
  开发信息: Created by 李春雷 2025-10-29
-->
<template>
  <div class="living-component">
    <el-card>
      <template #header>
        <div class="card-header flex-center gap-24">
          <span>在线直播</span>
          <el-segmented v-model="value" :options="options" />
        </div>
      </template>

      <!-- 直播信息卡片 -->
      <el-row :gutter="20" class="live-cards" v-loading="loading">
        <el-col :span="6" v-for="item in liveData" :key="item.id" class="mb-24">
          <el-card shadow="hover">
            <div class="card-content" @click="handleVideoClick(item)">
              <div class="video-placeholder">
                <img v-if="item.coverImageUrl" :src="item.coverImageUrl" alt="封面" class="cover-image" />
                <span v-else>视频</span>
              </div>
              <div class="title">{{ item.title }}</div>
              <div class="description">简介：{{ item.description || '暂无简介' }}</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="24" v-if="!loading && liveData.length === 0">
          <el-empty description="暂无直播数据" />
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { VideoList, addViewRecordsApi } from '@/api/mall/living/index';

const loading = ref(false);
const liveData = ref<any[]>([]);

const value = ref(0); // 0 默认，1 最新发布时间
const options = ref([
  { label: '默认', value: 0 },
  { label: '最新发布时间', value: 1 },
  { label: '最多浏览量', value: 2 }
]);

// 获取直播列表
const getVideoList = async () => {
  loading.value = true;
  try {
    // 0、1默认按发布时间查，2按播放量查
    const params = value.value === 2 ? { orderByColumn: 'createTime', isAsc: 'desc' } : { viewSort: true, sortDesc: true };
    const res = await VideoList({
      videoStatus: '1', // 启用
      type: value.value, // 0 默认，1 最新发布时间 2 最多播放量
      ...params
    });
    if (res.code === 200) {
      liveData.value = res.rows || res.data || [];
    }
  } catch (error) {
    console.error('获取直播列表失败:', error);
    liveData.value = [];
  } finally {
    loading.value = false;
  }
};

// 监听类型变化
watch(value, () => {
  getVideoList();
});

// 组件挂载时获取数据
onMounted(() => {
  getVideoList();
});

// 点击视频卡片，跳转到视频链接
const handleVideoClick = (item: any) => {
  if (item.videoUrl) {
    // 调用增加播放量的接口
    addViewRecordsApi({ id: item.id, viewType: '8' });
    // 在新标签页打开视频链接
    window.open(item.videoUrl, '_blank');
  } else {
    console.warn('视频链接不存在:', item);
  }
};
</script>

<style scoped lang="scss">
.living-component {
  margin-top: 24px;
  .card-header {
    font-size: 20px;
    font-weight: bold;
  }

  .live-cards {
    .el-card {
      .card-content {
        text-align: center;
        cursor: pointer;
        .video-placeholder {
          height: 150px;
          background-color: #f5f5f5;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          color: #999;
          overflow: hidden;
          position: relative;

          .cover-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }

        .views {
          margin-top: 10px;
          display: flex;
          align-items: center;
          justify-content: center;

          el-icon {
            margin-right: 5px;
          }
        }

        .title {
          margin-top: 10px;
          font-size: 16px;
          font-weight: bold;
        }
      }
    }
  }
}
</style>
