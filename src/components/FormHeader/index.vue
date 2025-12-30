<template>
  <div class="form-header-container">
    <div class="form-header-title flex-center">
      <div>{{ title }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  title: {
    type: String,
    required: true
  }
});
</script>

<style scoped lang="scss">
.form-header-container {
  display: flex;
  flex-direction: column;
  .form-header-title {
    font-weight: bold;
    gap: 12px;
    padding: 12px 0;
    color: #108c58;
    div {
      padding-left: 10px;
      box-sizing: border-box;
      position: relative;
      font-size: 14px;
      line-height: 24px;
      &::before {
        position: absolute;
        content: '';
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 2px;
        height: 10px;
        background-color: #108c58;
      }
    }
  }
}
</style>
