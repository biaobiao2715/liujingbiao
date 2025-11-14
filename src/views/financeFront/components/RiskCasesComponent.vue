<template>
  <div class="risk-cases">
    <h2>风险案例</h2>
    <el-table :data="cases" style="width: 100%">
      <el-table-column prop="title" label="案例标题" />
      <el-table-column prop="description" label="案例描述" />
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const cases = ref([
  { title: '案例1', description: '描述1' },
  { title: '案例2', description: '描述2' }
  // 可添加更多案例
]);
</script>

<style scoped lang="scss">
.risk-cases {
  padding: 20px;
}
</style>
