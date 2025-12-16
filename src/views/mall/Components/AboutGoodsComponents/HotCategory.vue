<!--
  标题: HotCategory.vue
  功能: 热门分类
  说明: 显示热门分类
  当前版本: 1.0
  开发信息: Created by 李春雷 2025-11-27
-->
<template>
  <div class="hot-category-container flex-column">
    <div class="title flex-center gap-4">热门分类</div>
    <el-row :gutter="24">
      <el-col :span="6" v-for="(item, index) in hotCategoryList" :key="item.name">
        <div :class="`category-item flex-column hotCategory${index + 1}`" @click="handleSearchByCategory(item.id)">
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
import { getProductCategoryList } from '@/api/platform/mallConfiguration/productCategory';
import { eventBus } from '@/utils/eventBus';

const hotCategoryList = ref([
  { id: '', name: '玉米种子', desc: '热卖品种 产地货源', img: hotCategory1 },
  { id: '', name: '小麦种子', desc: '基地直供 灵活运输', img: hotCategory2 },
  { id: '', name: '水稻种子', desc: '资质齐全 品牌保障', img: hotCategory3 },
  { id: '', name: '收割机', desc: '种类多样 质量把控', img: hotCategory4 }
]);

const allCategroryList = ref([]);

onMounted(async () => {
  const res = await getProductCategoryList({});
  if (res.code === 200) {
    allCategroryList.value = res.data || [];
    hotCategoryList.value.forEach((item) => {
      item.id = getCategoryIdByName(item.name);
    });
  }
  console.log(hotCategoryList.value);
});

const getCategoryIdByName = (name: string) => {
  const category = allCategroryList.value.find((item) => item.categoryName === name);
  return category ? category.id : null;
};

const handleSearchByCategory = (categoryId: string) => {
  eventBus.emit('searchGoodsList', { categoryId });
};
</script>

<style scoped lang="scss">
.hot-category-container {
  .title {
    font-size: 20px;
    font-weight: bold;
    border-left: 4px solid #108c58;
    padding-left: 6px;
    line-height: 18px;
    margin-bottom: 16px;
  }
  .category-list {
    flex-wrap: wrap;
  }
  .category-item {
    height: 180px;
    padding: 28px;
    border-radius: 8px;
    background-color: #f5f5f5;
    cursor: pointer;
  }
  .category-name {
    color: #fff;
    font-size: 30px;
    font-weight: bold;
  }
  .category-desc {
    font-weight: 400;
    font-size: 20px;
    color: #ffffff;
  }

  .hotCategory1 {
    background: url('@/assets/mall/hot-category-1.png') no-repeat center;
    background-size: cover;
  }
  .hotCategory2 {
    background: url('@/assets/mall/hot-category-2.png') no-repeat center;
    background-size: cover;
  }
  .hotCategory3 {
    background: url('@/assets/mall/hot-category-3.png') no-repeat center;
    background-size: cover;
  }
  .hotCategory4 {
    background: url('@/assets/mall/hot-category-4.png') no-repeat center;
    background-size: cover;
  }
}
</style>
