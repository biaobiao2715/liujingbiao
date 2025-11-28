<!--
  标题: BannerAndCategory.vue
  功能:  商品banner和分类组件
  说明:        
  当前版本: 1.0
  开发信息: Created by 李春雷 2025-11-27
-->
<template>
  <div class="banner-container flex-between mb-24 mt-24">
    <!-- 商品分类 -->
    <div class="category">
      <div class="title flex-center mb-12">
        <img src="@/assets/mall/expand.png" width="18" />
        <div>全部商品分类</div>
      </div>

      <div v-for="item in categorieList" :key="item.id" class="category-item">
        <!-- 一级分类 -->
        <div class="first-category">
          {{ item.categoryName }}
        </div>
        <!-- 二级分类 -->
        <div v-for="child in item.children" :key="child.id">
          <div class="second-category">
            {{ child.categoryName }}
          </div>
          <!-- 三级分类 -->
          <div class="flex-center gap-12 third-container">
            <div v-for="grandchild in child.children" :key="grandchild.id">
              <div class="third-category">
                {{ grandchild.categoryName }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- banner图 -->
    <img src="@/assets/mall/home-banner.png" class="banner-img" />
  </div>
</template>

<script setup lang="ts">
import { getProductCategoryList } from '@/api/platform/mallConfiguration/productCategory';

interface Category {
  id: string;
  categoryName: string;
  parentId: string | null;
  orderNum: number | null;
  createTime: string;
  children?: Category[];
}

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const categorieList = ref([]);

onMounted(() => {
  fetchCategories();
});

// 分类数据
const fetchCategories = async () => {
  try {
    const res = await getProductCategoryList();
    if (res.code === 200) {
      categorieList.value = proxy?.handleTree<Category>(res.data, 'id'); // 假设接口返回的已是树形结构
    }
  } catch (error) {
    console.error('获取商品分类数据失败:', error);
  }
};
</script>

<style scoped lang="scss">
.banner-img {
  width: calc(100% - 324px);
}

.category {
  .title {
    gap: 8px;
    font-weight: 500;
    color: #108c58;
    font-size: 16px;
  }
}
.category-item {
  margin-bottom: 12px;
  border-bottom: 1px dashed #d8d8d8;
}

.first-category {
  font-weight: bold;
  color: #333333;
  font-size: 14px;
  cursor: pointer;
}

.second-category {
  color: #333333;
  font-size: 14px;
  cursor: pointer;
  margin: 12px 0 12px 12px;
}

.third-container {
  flex-wrap: wrap;
}

.third-category {
  margin-left: 24px;
  color: #7a7373;
  font-size: 14px;
  cursor: pointer;
}
</style>
