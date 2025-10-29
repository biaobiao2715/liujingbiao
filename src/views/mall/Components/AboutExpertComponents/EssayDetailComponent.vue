<!--
  标题: EssayDetailComponent.vue
  功能: 文章详情组件
  说明: 显示文章详情
  当前版本: 1.0
  开发信息: Created by 李春雷 2025-10-29
-->
<template>
  <div class="essay-detail-container">
    <el-card class="essay-detail-card">
      <h2 class="essay-title">{{ title }}</h2>
      <Editor v-model:modelValue="content" :height="editorHeight" :minHeight="editorMinHeight" :readOnly="true" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Editor from '@/components/Editor/index.vue';

const title = ref('文章标题');
const content = ref('<p>这是文章的内容。</p>');
const editorHeight = ref(500);
const editorMinHeight = ref(300);
</script>

<style scoped lang="scss">
.essay-detail-container {
  padding: 20px;
  background-color: #f5f5f5;
}

.essay-detail-card {
  padding: 20px;
  background-color: #fff;
}

.essay-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
}
</style>
