<template>
  <div style="display: flex">
    <div style="display: flex; justify-content: center; align-items: center">
      <img :src="logo" class="sidebar-logo" />
      <div class="sidebar-NewTitle">
        {{ title }}
      </div>
    </div>
    <div class="isShow" style="padding: 0 15px" @click="toggleClick">
      <svg :class="{ 'is-active': isActive }" class="hamburger" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="64" height="64">
        <path
          d="M408 442h480c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H408c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8zm-8 204c0 4.4 3.6 8 8 8h480c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H408c-4.4 0-8 3.6-8 8v56zm504-486H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zm0 632H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zM142.4 642.1L298.7 519a8.84 8.84 0 0 0 0-13.9L142.4 381.9c-5.8-4.6-14.4-.5-14.4 6.9v246.3a8.9 8.9 0 0 0 14.4 7z"
          fill="#108c58"
        />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { propTypes } from '@/utils/propTypes';
const title = ref('全国种子销售服务平台');
import logo from '@/assets/images/logo.svg';
defineProps({
  isActive: propTypes.bool.def(false)
});

const emit = defineEmits(['toggleClick']);
const toggleClick = () => {
  emit('toggleClick');
};
</script>

<style scoped>
.hamburger {
  display: inline-block;
  vertical-align: middle;
  width: 20px;
  height: 20px;
}

.hamburger.is-active {
  transform: rotate(180deg);
}
.sidebar-logo {
  width: 32px;
  height: 32px;
  vertical-align: middle;
  margin-left: 8px;
  margin-right: 6px;
}
.sidebar-NewTitle {
  display: inline-block;
  margin: 0;
  font-weight: 600;
  line-height: 50px;
  font-size: 14px;
  font-family:
    Avenir,
    Helvetica Neue,
    Arial,
    Helvetica,
    sans-serif;
  vertical-align: middle;
}
.isShow :hover {
  /* background: rgba(0, 0, 0, 0.025); */
}
</style>
