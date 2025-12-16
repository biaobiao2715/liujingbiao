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
        <div class="first-category flex-center gap-4">
          <img src="@/assets/mall/seed.png" width="18" v-if="item.categoryName === '种子'" />
          <img src="@/assets/mall/tool.png" width="18" v-else />
          <div>{{ item.categoryName }}</div>
        </div>
        <!-- 二级分类 -->
        <div v-for="child in item.children" :key="child.id">
          <div class="second-category">
            {{ child.categoryName }}
          </div>
          <!-- 三级分类 -->
          <div class="flex-center gap-12 third-container">
            <div v-for="(grandchild, index) in child.children" :key="grandchild.id">
              <div class="third-category" @click="handleSearchByCategory(grandchild.id)">
                {{ grandchild.categoryName + (index === child.children.length - 1 ? '' : ' /') }}
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
import { eventBus } from '@/utils/eventBus';

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

const handleSearchByCategory = (categoryId: string) => {
  eventBus.emit('searchGoodsList', { categoryId });
};
</script>

<style scoped lang="scss">
.banner-container {
  gap: 10px;
}
.banner-img {
  width: calc(100% - 320px);
}

.category {
  width: 310px;
  background: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  .title {
    gap: 8px;
    font-weight: 500;
    color: #108c58;
    font-size: 16px;
  }
}
.category-item {
  margin-bottom: 24px;
}

.first-category {
  font-weight: bold;
  color: #333333;
  font-size: 14px;
  cursor: pointer;
  padding-bottom: 12px;
  border-bottom: 1px solid #e0e0e0;
}

.second-category {
  font-weight: bold;
  color: #3d3d3d;
  font-size: 14px;
  cursor: pointer;
  margin: 12px 0;
  padding-left: 24px;
}

.third-container {
  flex-wrap: wrap;
  margin-left: 24px;
  gap: 6px;
}

.third-category {
  color: #3d3d3d;
  font-size: 12px;
  cursor: pointer;
}
</style>
