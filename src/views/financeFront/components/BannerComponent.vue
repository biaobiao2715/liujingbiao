<template>
  <div class="banner">
    <el-carousel :interval="5000" height="200px">
      <el-carousel-item v-for="tab in tabs" :key="tab.name">
        <div class="banner-text">
          <h1>{{ tab.title }}</h1>
          <p>{{ tab.description }}</p>
          <el-button type="success">{{ tab.buttonText }}</el-button>
        </div>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const tabs = ref([
  {
    name: 'business-loan',
    label: '企业经营贷',
    title: '企业经营贷',
    description: '全方位金融方案 支持农户与企业成长',
    buttonText: '查看全部产品'
  },
  {
    name: 'personal-loan',
    label: '个人消费贷',
    title: '个人消费贷',
    description: '灵活便捷的贷款方案 满足个人消费需求',
    buttonText: '了解更多'
  }
]);
</script>

<style scoped lang="scss">
.banner {
  display: flex;
  flex-direction: column;
  padding: 20px;
  background-color: #e8f5e9;
}
.banner-text {
  text-align: left;
  margin-top: 20px;
}
</style>
