<template>
  <div class="form-header-container">
    <div class="form-header-title flex-center">
      <el-icon><Grid /></el-icon>
      <div>{{ title }}</div>
    </div>
  </div>
</template>

<script>
import { Grid } from '@element-plus/icons-vue';

export default {
  name: 'FormHeader',
  props: {
    title: {
      type: String,
      required: true
    }
  }
};
</script>

<style scoped lang="scss">
.form-header-container {
  display: flex;
  flex-direction: column;
  .form-header-title {
    font-size: 16px;
    font-weight: bold;
    gap: 12px;
    padding: 12px 0;
    margin: 12px 0;
    border-bottom: 1px solid var(--el-border-color);
  }
}
</style>
