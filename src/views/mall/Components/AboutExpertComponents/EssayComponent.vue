<template>
  <div class="essay-component">
    <el-card class="essay-card" v-for="(article, index) in articles" :key="index">
      <template #header>
        <div class="card-header">
          {{ article.title }}
        </div>
      </template>

      <div class="card-content">
        <p>{{ article.content }}</p>
        <div class="card-footer">
          <span>分类: {{ article.category }}</span>
          <span>发布时间: {{ article.date }}</span>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const articles = ref([
  {
    title: '黄芩的种植方法和时间',
    content: '黄芩是一种常见的中药材，具有深厚的药用历史和广泛的应用价值，在中国分布广泛，主要产于东北、华北及西北地区，我们一起来看看。',
    category: '农技',
    date: '2019-11-02 12:23:00'
  },
  {
    title: '黄芩的种植方法和时间',
    content: '黄芩是一种常见的中药材，具有深厚的药用历史和广泛的应用价值，在中国分布广泛，主要产于东北、华北及西北地区，我们一起来看看。',
    category: '农技',
    date: '2019-11-02 12:23:00'
  }
]);
</script>

<style scoped lang="scss">
.essay-component {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.essay-card {
  padding: 20px;
}

.card-header {
  font-size: 18px;
  font-weight: bold;
}

.card-content {
  margin-top: 10px;
}

.card-footer {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #666;
}
</style>
