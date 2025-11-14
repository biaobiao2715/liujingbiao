<template>
  <div class="policy-rules">
    <h2>政策法规</h2>
    <el-collapse>
      <el-collapse-item v-for="rule in rules" :title="rule.title" :name="rule.id" :key="rule.id">
        <p>{{ rule.content }}</p>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const rules = ref([
  { id: 1, title: '法规1', content: '内容1' },
  { id: 2, title: '法规2', content: '内容2' }
  // 可添加更多法规
]);
</script>

<style scoped lang="scss">
.policy-rules {
  padding: 20px;
}
</style>
