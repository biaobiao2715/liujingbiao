<!--
  标题: LivingComponent.vue
  功能: 直播组件
  说明: 展示直播信息
  当前版本: 1.0
  开发信息: Created by 李春雷 2025-10-29
-->
<template>
  <div class="living-component">
    <div class="header flex-center-between">
      <div class="title">在线直播</div>
      <div class="more flex-center gap-4" @click="handleMoreClick">
        <div>查看更多</div>
        <img src="@/assets/mall/more.png" width="18" />
      </div>
    </div>

    <!-- 内容 -->
    <div class="content flex" v-loading="loading">
      <!-- 左侧列表 -->
      <div class="left-list flex">
        <div v-for="item in liveData" :key="item.id" class="list-item flex" @click="currentItem = item">
          <img v-if="item.coverImageUrl" :src="item.coverImageUrl" class="cover-image" />
          <div class="video-info">
            <div class="title">{{ item.title }}</div>
            <div class="description">简介：{{ item.description || '暂无简介' }}</div>
          </div>
        </div>
      </div>
      <!-- 右侧封面 -->
      <div class="right-cover">
        <div class="video-cover flex-center-center" :style="{ backgroundImage: 'url(' + currentItem?.coverImageUrl + ')' }">
          <img src="@/assets/mall/play-icon.png" width="125px" @click="handleVideoClick()" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { VideoList, addViewRecordsApi } from '@/api/mall/living/index';
const emit = defineEmits(['detailChange']);

const loading = ref(false);

const liveData = ref<any[]>([]);

const currentItem = ref(null);

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
      currentItem.value = liveData.value[0] || null;
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

// 查看更多
const handleMoreClick = () => {
  emit('detailChange', { type: 'livingList' });
};

// 点击视频卡片，跳转到视频链接
const handleVideoClick = () => {
  if (currentItem.value?.videoUrl) {
    // 调用增加播放量的接口
    addViewRecordsApi({ id: currentItem.value.id, viewType: '8' });
    // 在新标签页打开视频链接
    window.open(currentItem.value.videoUrl, '_blank');
  } else {
    console.warn('视频链接不存在:', currentItem.value);
  }
};
</script>

<style scoped lang="scss">
.living-component {
  margin-top: 24px;

  .header {
    padding: 20px;
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
    gap: 20px;
    .left-list,
    .right-cover {
      padding: 20px;
      background-color: #fff;
      border-radius: 8px;

      .list-item {
        gap: 16px;
        cursor: pointer;
        .cover-image {
          width: 164px;
          height: 100px;
          border-radius: 8px;
        }
        .video-info {
          padding: 16px 0;
          .title {
            font-size: 16px;
            color: #333;
            font-weight: bold;
            margin-bottom: 12px;
          }
          .description {
            line-height: 18px;
            font-size: 14px;
            color: #706f6f;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
          }
        }
      }
    }
    .left-list {
      flex: 1;
      flex-direction: column;
      gap: 16px;
    }
    .right-cover {
      flex: 2;
    }
    .video-cover {
      width: 100%;
      height: 564px;
      background-size: cover;
      background-repeat: no-repeat;
      background-position: center;
      img {
        cursor: pointer;
      }
    }
  }
}
</style>
