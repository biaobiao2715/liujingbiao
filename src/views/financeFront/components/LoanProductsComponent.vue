<template>
  <div class="loan-products">
    <h2>贷款产品</h2>
    <el-row :gutter="20">
      <el-col :span="8" v-for="product in products" :key="product.id">
        <el-card>
          <h3>{{ product.name }}</h3>
          <p>最高额度: {{ product.limit }}</p>
          <p>利率范围: {{ product.rate }}</p>
          <el-button type="primary">查看详情</el-button>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const products = ref([
  { id: 1, name: '惠农贷', limit: '100万元', rate: '1.2% - 2.6%' },
  { id: 2, name: '惠农贷2', limit: '100万元', rate: '1.2% - 2.6%' },
  // 可添加更多产品
]);
</script>

<style scoped lang="scss">
.loan-products {
  padding: 20px;
}
</style>
