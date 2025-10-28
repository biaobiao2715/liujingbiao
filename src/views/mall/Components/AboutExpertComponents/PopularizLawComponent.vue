<template>
  <div class="populariz-law">
    <el-card>
      <template #header>
        <div class="card-header">普法宣传</div>
      </template>
      <el-tabs v-model="activeTab" type="card">
        <el-tab-pane v-for="(tab, index) in tabs" :key="index" :label="tab" :name="index.toString()">
          <div v-if="activeTab === index">
            <div v-if="index === 0">国家政策法规内容</div>
            <div v-else-if="index === 1">普法活动内容</div>
            <div v-else-if="index === 2">普法白皮书内容</div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const tabs = ['国家政策法规', '普法活动', '普法白皮书'];
const activeTab = ref(0);
</script>

<style scoped lang="scss">
.populariz-law {
  .card-header {
    font-size: 20px;
    font-weight: bold;
  }

  .content {
    font-size: 16px;
    line-height: 1.5;
  }
}
</style>
