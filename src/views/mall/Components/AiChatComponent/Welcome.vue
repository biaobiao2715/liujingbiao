<template>
  <div class="welcome flex-center-center">
    <div class="flex-center title">
      <img src="@/assets/images/mall/ai-logo.png" width="32" />
      <div>您好，我是农合智创智能问答AI助理</div>
    </div>
    <div class="description">专注为您解答农技知识科普等相关问题，为农业生产经营助力！</div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.welcome {
  flex-direction: column;
  margin-bottom: 48px;
  .title {
    font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
    font-weight: 500;
    font-size: 20px;
    color: #333333;
    gap: 8px;
  }
  .description {
    font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
    font-weight: 400;
    font-size: 14px;
    color: #909090;
  }
}
</style>
