<template>
  <div class="search-container flex-between">
    <!-- 麦穗图片 -->
    <img src="@/assets/images/finance/wheat.png" width="60" class="wheat-ong" />

    <div class="left-space flex-center gap-12">
      <div class="point"></div>
      <div class="search-title">种子金融服务平台</div>
    </div>

    <div class="right-search">
      <el-input v-model="searchQuery" placeholder="请输入搜索的内容" class="search-input">
        <template #prepend>
          <el-select v-model="selectedCategory" placeholder="商品名称" class="category-select">
            <el-option v-for="option in categories" :key="option.value" :label="option.label" :value="option.value" />
          </el-select>
        </template>
        <template #append>
          <el-button @click="handleSearch">搜索</el-button>
        </template>
      </el-input>

      <div class="hot-search">热门搜索：玉米种子 小麦种子 水稻种子 油菜种子</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const categories = [
  { label: '金融产品', value: 'financial' },
  { label: '保险产品', value: 'insurance' },
  { label: '政策法规', value: 'policy' },
  { label: '风险案例', value: 'risk' }
];

const selectedCategory = ref('');
const searchQuery = ref('');

const handleSearch = () => {
  console.log('搜索分类:', selectedCategory.value);
  console.log('搜索内容:', searchQuery.value);
};
</script>

<style scoped lang="scss">
.search-container {
  background: url('../../../assets/images/finance-bg.png') no-repeat center center;
  background-size: cover;
  padding: 20px;
  text-align: center;
  position: relative;
  .left-space {
    .point {
      width: 26px;
      height: 26px;
      background: #108c58;
      border-radius: 50%;
    }
    .search-title {
      color: #108c58;
      font-size: 32px;
    }
  }
}
.wheat-ong {
  position: absolute;
}

.search-input {
  width: 400px;
  display: flex;
  align-items: center;
  margin: 0 auto;
  height: 40px;
  //   box-shadow: 0 0 10px rgba(16, 140, 88, 0.5);
  ::v-deep .el-input__wrapper {
    height: 40px;
  }

  ::v-deep .el-select__wrapper {
    height: 40px;
  }
  ::v-deep .el-input__wrapper,
  ::v-deep .el-input-group__prepend,
  ::v-deep .el-input-group__append {
    box-shadow: 0 0 0 1px #108c58;
    background: transparent !important;
  }

  ::v-deep .el-input-group__append {
    background-color: #108c58 !important;
    color: #fff;
  }
}

.category-select {
  width: 150px;
}

.hot-search {
  margin-top: 10px;
  font-size: 12px;
  color: #626262;
  text-align: left;
}
</style>
