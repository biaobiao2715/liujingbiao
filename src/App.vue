<template>
  <el-config-provider :locale="appStore.locale" :size="appStore.size">
    <router-view />
  </el-config-provider>
</template>

<script setup lang="ts">
import { useSettingsStore } from '@/store/modules/settings';
import { handleThemeStyle } from '@/utils/theme';
import { useAppStore } from '@/store/modules/app';
import { onMounted, nextTick, watch } from 'vue';
import { initSSE } from '@/utils/sse';
import { getToken } from '@/utils/auth';

const appStore = useAppStore();

onMounted(() => {
  nextTick(() => {
    // 初始化主题样式
    handleThemeStyle(useSettingsStore().theme);
  });
});

// 监听token变化，token存在时初始化SSE
watch(
  () => getToken(),
  (token, oldToken) => {
    if (token && !oldToken) {
      initSSE(import.meta.env.VITE_APP_BASE_API + '/resource/sse');
    }
  },
  { immediate: true }
);
</script>
