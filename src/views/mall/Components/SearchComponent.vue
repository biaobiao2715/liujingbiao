<template>
  <div class="search">
    <el-select v-model="searchType" placeholder="商品名称" class="search-type">
      <el-option label="品牌" value="name"></el-option>
      <el-option label="属性" value="category"></el-option>
    </el-select>
    <el-input v-model="searchQuery" placeholder="请输入要搜索的内容" class="search-input">
      <template #prefix>
        <el-button type="primary" @click="handleSearch" class="search-button"> 搜索 </el-button>
      </template>
    </el-input>
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
.search {
  display: flex;
  align-items: center;
  margin: 10px 0;
}
.search-type {
  margin-right: 10px;
  width: 150px;
}
.search-input {
  flex: 1;
  margin-right: 10px;
}
</style>
