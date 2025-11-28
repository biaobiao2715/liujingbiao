<!--
  标题: HotCategory.vue
  功能: 热门分类
  说明: 显示热门分类
  当前版本: 1.0
  开发信息: Created by 李春雷 2025-11-27
-->
<template>
  <div class="hot-category-container flex-column">
    <div class="title mb-12">热门分类</div>
    <el-row :gutter="24">
      <el-col :span="6" v-for="(item, index) in hotCategoryList" :key="item.name">
        <div :class="`category-item flex-column hotCategory${index + 1}`">
          <div class="category-name">{{ item.name }}</div>
          <div class="category-desc">{{ item.desc }}</div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// Import static assets
import hotCategory1 from '@/assets/mall/hot-category-1.png';
import hotCategory2 from '@/assets/mall/hot-category-2.png';
import hotCategory3 from '@/assets/mall/hot-category-3.png';
import hotCategory4 from '@/assets/mall/hot-category-4.png';

const hotCategoryList = ref([
  { name: '粮油', desc: '粮油类商品', img: hotCategory1 },
  { name: '农资', desc: '农资类商品', img: hotCategory2 },
  { name: '农机', desc: '农机类商品', img: hotCategory3 },
  { name: '农产品', desc: '农产品类商品', img: hotCategory4 }
]);
</script>

<style scoped lang="scss">
.hot-category-container {
  padding: 12px;
}
.title {
  font-size: 20px;
  font-weight: bold;
  border-left: 4px solid #108c58;
  padding-left: 6px;
  line-height: 18px;
}
.category-list {
  flex-wrap: wrap;
}
.category-item {
  height: 188px;
  padding: 12px;
  border-radius: 8px;
  background-color: #f5f5f5;
  cursor: pointer;
}
.category-img {
  width: 100%;
  height: 48px;
}
.category-name {
  color: #fff;
  font-size: 30px;
  font-weight: bold;
}
.category-desc {
  color: #fff;
  font-size: 20px;
}

.hotCategory1 {
  background: url('@/assets/mall/hot-category-1.png') no-repeat center center;
  background-size: 100% 100%;
}
.hotCategory2 {
  background: url('@/assets/mall/hot-category-2.png') no-repeat center;
  background-size: 100% 100%;
}
.hotCategory3 {
  background: url('@/assets/mall/hot-category-3.png') no-repeat center;
  background-size: 100% 100%;
}
.hotCategory4 {
  background: url('@/assets/mall/hot-category-4.png') no-repeat center;
  background-size: 100% 100%;
}
</style>
