<template>
  <div class="search-component flex">
    <div class="logo flex-center gap-12">
      <img src="../../../assets/images/logo.svg" alt="logo" class="logo-image" />
      <div>农合智创</div>
    </div>
    <div class="search-select">
      <el-input v-model="searchQuery" placeholder="请输入要搜索的内容" size="large" style="width: 520px">
        <template #prepend>
          <el-select v-model="searchType" placeholder="商品名称" class="search-type" size="large">
            <el-option label="名称" value="name"></el-option>
            <el-option label="品牌" value="brand"></el-option>
            <el-option label="属性" value="attribute"></el-option>
          </el-select>
        </template>
        <template #append>
          <el-button type="primary" @click="handleSearch" size="large"> 搜索 </el-button>
        </template>
      </el-input>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const searchQuery = ref('');
const searchType = ref('name');

function handleSearch() {
  console.log('搜索类型:', searchType.value);
  console.log('搜索内容:', searchQuery.value);
}
</script>

<style scoped lang="scss">
.search-component {
  padding: 12px;
}
.search-select {
  display: flex;
  align-items: center;
  margin: 0 auto;
}

.search-type {
  width: 120px;
}
</style>
