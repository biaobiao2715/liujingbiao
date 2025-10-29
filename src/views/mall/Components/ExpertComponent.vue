<template>
  <div class="expert-container">
    <ConsultationComponent />
    <QAComponent />
    <div class="flex">
      <EssayComponent />
      <PopularizLawComponent />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ConsultationComponent from './AboutExpertComponents/ConsultationComponent.vue';
import QAComponent from './AboutExpertComponents/QAComponent.vue';
import EssayComponent from './AboutExpertComponents/EssayComponent.vue';
import PopularizLawComponent from './AboutExpertComponents/PopularizLawComponent.vue';
</script>

<style scoped lang="scss">
.expert-container {
  padding: 12px;
}
</style>
