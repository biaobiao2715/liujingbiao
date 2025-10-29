<template>
  <div class="essay-container">
    <el-card>
      <template #header>
        <div class="card-header">文章专栏</div>
      </template>

      <div class="essat-list">
        <div class="essay" v-for="(article, index) in articles" :key="index" @click="handleClick(article)">
          <div class="essay-title">
            {{ article.title }}
            <el-tag type="primary">{{ article.category }}</el-tag>
          </div>

          <div class="essay-content">
            <p>{{ article.content }}</p>
            <div class="essay-footer flex-center gap-12">
              <div class="views flex-center gap-2">
                <el-icon size="20"><View /></el-icon>
                <span>{{ article.views }}</span>
              </div>
              <div class="collection flex-center gap-2">
                <el-icon size="20" v-if="!article.isCollected"><Star /></el-icon>
                <el-icon size="24" color="#ff9800" v-else> <StarFilled /></el-icon>
                <span>{{ article.collection }}</span>
              </div>
              <div>{{ article.date }}</div>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits(['detailChange']);

const articles = ref([
  {
    title: '黄芩的种植方法和时间',
    content: '黄芩是一种常见的中药材，具有深厚的药用历史和广泛的应用价值，在中国分布广泛，主要产于东北、华北及西北地区，我们一起来看看。',
    category: '农技',
    views: 1234,
    collection: 89,
    isCollected: false,
    date: '2019-11-02 12:23:00'
  },
  {
    title: '黄芩的种植方法和时间',
    content: '黄芩是一种常见的中药材，具有深厚的药用历史和广泛的应用价值，在中国分布广泛，主要产于东北、华北及西北地区，我们一起来看看。',
    category: '农技',
    views: 1234,
    collection: 24,
    isCollected: true,
    date: '2019-11-02 12:23:00'
  }
]);

const handleClick = (article: any) => {
  emit('detailChange', { type: 'essayDetail', data: article });
};
</script>

<style scoped lang="scss">
.essay-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 2;
}
.card-header {
  font-size: 20px;
  font-weight: bold;
}

.essat-list {
  height: 600px;
  overflow: auto;
}

.essay {
  padding: 12px;
  border-bottom: 1px solid #e0e0e0;
  cursor: pointer;
  .essay-title {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 8px;
  }
  .essay-content {
    margin-bottom: 8px;
  }
  .essay-footer {
    font-size: 14px;
    color: #666;
  }
}
</style>
