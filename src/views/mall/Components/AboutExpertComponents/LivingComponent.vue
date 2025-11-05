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
      <el-row :gutter="20" class="live-cards">
        <el-col :span="6" v-for="item in liveData" :key="item.id" class="mb-24">
          <el-card shadow="hover">
            <div class="card-content">
              <div class="video-placeholder">视频</div>
              <div class="title">{{ item.title }}</div>
              <div class="description">简介：{{ item.description }}</div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const liveData = ref([
  { id: 1, views: 232633, title: '种子知识讲解', description: '这是一个关于种子知识讲解的直播' },
  { id: 2, views: 232633, title: '种子知识讲解', description: '这是一个关于种子知识讲解的直播' },
  { id: 3, views: 232633, title: '种子知识讲解', description: '这是一个关于种子知识讲解的直播' },
  { id: 4, views: 232633, title: '种子知识讲解', description: '这是一个关于种子知识讲解的直播' },
  { id: 5, views: 232633, title: '种子知识讲解', description: '这是一个关于种子知识讲解的直播' },
  { id: 6, views: 232633, title: '种子知识讲解', description: '这是一个关于种子知识讲解的直播' }
]);

const value = ref('default');
const options = ref([
  { label: '默认', value: 'default' },
  { label: '最新发布时间', value: 'newest' },
  { label: '最多浏览量', value: 'mostViews' }
]);
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
