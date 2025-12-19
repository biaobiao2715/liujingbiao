<template>
  <div class="search-container">
    <div class="content flex-between">
      <div class="left-space">
        <div class="main-title flex-center gap-12">
          <div class="point"></div>
          <div class="search-title flex-center">
            <div class="first-title">农合</div>
            <div class="second-title">智创</div>
          </div>
        </div>
        <div class="tip">#nonghezhich</div>
      </div>

      <div class="right-search">
        <el-input v-model="searchQuery" placeholder="请输入搜索的内容" class="search-input">
          <template #prepend>
            <el-select v-model="searchType" placeholder="商品名称" class="category-select">
              <el-option v-for="option in categories" :key="option.value" :label="option.label" :value="option.value" />
            </el-select>
          </template>
          <template #append>
            <el-button @click="handleSearch()">搜索</el-button>
          </template>
        </el-input>

        <div class="hot-search">
          热门搜索：
          <span v-for="(item, index) in hotSearch" :key="item.value" class="hot-item" @click="handleSearch(item.label)">{{ item.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { eventBus } from '@/utils/eventBus';
import { ref } from 'vue';

const searchType = ref('goodsName');

const searchQuery = ref('');

const categories = [
  { label: '商品名称', value: 'goodsName' },
  { label: '商品品牌', value: 'goodsBrandName' },
  { label: '商品属性', value: 'goodsAbilityName' }
];

const hotSearch = [
  {
    label: '玉米种子',
    value: '0'
  },
  {
    label: '小麦种子',
    value: '1'
  },
  {
    label: '水稻种子',
    value: '2'
  },
  {
    label: '油菜种子',
    value: '3'
  }
];

const handleSearch = (hotKey?: string) => {
  eventBus.emit('mallSearch', {
    searchType: searchType.value,
    queryParam: hotKey || searchQuery.value || ''
  });
};
</script>

<style scoped lang="scss">
.search-container {
  height: 180px;
  background: url('../../../assets/images/mall/header-search-bg.png') no-repeat center center;
  background-size: cover;
  display: flex;
  align-items: center;

  .content {
    width: 1500px;
    margin: 0 auto;
    text-align: center;
  }
  .left-space {
    margin-bottom: 24px;
    .point {
      width: 26px;
      height: 26px;
      background: #108c58;
      border-radius: 50%;
    }
    .search-title {
      color: #108c58;
      font-weight: 900;
      font-size: 44px;
      font-family:
        Fira Sans,
        Fira Sans;
      .second-title {
        color: #000;
      }
    }
    .tip {
      text-align: right;
      font-family: Lato, Lato;
      font-weight: 900;
      font-size: 20px;
      color: #000000;
      line-height: 28px;
    }
  }
}
.right-search {
  width: 800px;
  margin-top: 16px;
}
.search-input {
  width: 100%;
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

  .hot-item {
    margin-right: 12px;
    &:hover {
      cursor: pointer;
      color: #108c58;
    }
  }
}
</style>
