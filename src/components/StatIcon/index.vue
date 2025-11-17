<!-- 统计图标组件 -->
<template>
  <div class="stat-icon" :style="{ backgroundColor: bgColor, color: color }">
    <el-icon :size="size">
      <component :is="icon" />
    </el-icon>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue';

interface Props {
  icon: Component | string;
  size?: number | string;
  bgColor?: string;
  color?: string;
}

withDefaults(defineProps<Props>(), {
  size: 28,
  bgColor: '#409eff',
  color: '#fff'
});
</script>

<style scoped lang="scss">
.stat-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 12px;
  flex-shrink: 0;
}
</style>

