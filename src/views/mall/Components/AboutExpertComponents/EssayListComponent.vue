<!--
  标题: EssayListComponent.vue
  功能:  文章专栏列表组件
  说明: 
  当前版本: 1.0
  开发信息: Created by 李春雷 2025-12-08
-->
<template>
  <div class="essay-list">
    <div v-for="item in essayList" :key="item.id || item.articleNo" class="essay-item" @click="handleDetail(item)">
      <div class="essay-left">
        <div class="flex-center-between" style="margin-bottom: 10px">
          <div class="essay-title">
            {{ item.articleTitle || '-' }}
          </div>
          <div class="essay-meta">
            <div class="collection flex-center gap-2">
              <el-icon size="16" v-if="!item.isFavorite"><Star /></el-icon>
              <el-icon size="20" color="#ff9800" v-else> <StarFilled /></el-icon>
              <span>{{ item.favoriteCount }}</span>
            </div>
            <div class="views flex-center gap-2">
              <el-icon size="16"><View /></el-icon>
              <span>{{ item.viewCount }}</span>
            </div>
          </div>
        </div>

        <dict-tag class="essay-tag" :options="article_type" :value="item?.contentType"></dict-tag>

        <div class="essay-content">{{ item.articleSummary }}</div>
        <div class="essay-publish-time">{{ item.publishTime }}</div>
      </div>
      <div class="essay-right">
        <img :src="item.articleCover || item.coverUrl" alt="cover" />
      </div>
    </div>
    <div ref="sentinelRef" class="list-sentinel"></div>
    <div class="list-footer" v-if="finished">已无更多内容</div>
    <div class="list-loading" v-else>
      <span v-if="loading">加载中...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { listArticles } from '@/api/expertServicePlatform/knowledgeBaseManage';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { article_type } = toRefs<any>(proxy?.useDict('article_type'));
const emit = defineEmits(['detailChange']);

const essayList = ref<any[]>([]);
const page = ref(1);
const pageSize = ref(10);
const loading = ref(false);
const finished = ref(false);
const loadError = ref<string | null>(null);
const sentinelRef = ref<HTMLDivElement | null>(null);
let observer: IntersectionObserver | null = null;

async function loadNextPage() {
  if (loading.value || finished.value) return;
  loading.value = true;
  loadError.value = null;
  try {
    const res = await listArticles({
      articleStatus: '2', // 已发布
      pageNum: page.value,
      pageSize: pageSize.value
    });
    const rows = res?.rows || [];
    const total = res?.total ?? rows.length;
    if (rows.length > 0) {
      essayList.value = essayList.value.concat(rows);
      page.value += 1;
      const loaded = (page.value - 1) * pageSize.value;
      if (loaded >= total) finished.value = true;
    } else {
      finished.value = true;
    }
  } catch (e: any) {
    loadError.value = e?.message || '加载失败';
  } finally {
    loading.value = false;
  }
}

const handleDetail = (article: any) => {
  emit('detailChange', { type: 'essayDetail', id: article.id });
};

onMounted(async () => {
  await loadNextPage();
  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      if (!entry) return;
      if (entry.isIntersecting) {
        // 防抖：若短时间内重复触发，依赖 loading 锁
        loadNextPage();
      }
    },
    { root: null, rootMargin: '0px 0px 300px 0px', threshold: 0 }
  );
  if (sentinelRef.value && observer) {
    observer.observe(sentinelRef.value);
  }
});

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
});
</script>

<style scoped lang="scss">
.essay-list {
  padding-top: 19px; // 顶部 19px
}

.essay-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 15px;

  padding: 20px;
  margin-bottom: 20px; // 项之间 44px 间距
  background: #ffffff;
  border-radius: 8px 8px 8px 8px;
}

.essay-left {
  flex: 1 1 auto;
  min-width: 0;
}

.essay-right {
  flex: 0 0 280px; // 右侧图片约 316px 宽
  overflow: hidden;

  width: 280px;
  height: 160px;
  border-radius: 8px 8px 8px 8px;
}

.essay-right img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* 页面布局样式 */
.essay-title {
  display: flex;
  align-items: center;
  height: 24px;
  position: relative;
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  font-weight: 500;
  font-size: 16px;
  color: #333333;
}
.essay-title::before {
  content: '';
  display: inline-block;
  width: 16px;
  height: 16px;
  margin-right: 6px;
  background-image: url('@/assets/mall/essay-icon.png');
  background-size: 16px 16px;
}

.essay-meta {
  display: flex;
  align-items: center;
  gap: 30px;

  height: 24px;
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  font-weight: 400;
  font-size: 14px;
  color: #333333;
  line-height: 24px;
}

.essay-content {
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  height: 60px;
  font-weight: 400;
  font-size: 14px;
  color: #3d3d3d;
  line-height: 20px;
  margin-bottom: 10px;
}

.essay-publish-time {
  height: 14px;
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  font-weight: 400;
  font-size: 14px;
  color: #a1a1a1;
  line-height: 14px;
}

.essay-tag {
  margin-bottom: 16px;
}

.list-sentinel {
  width: 100%;
  height: 1px;
}

.list-footer,
.list-loading {
  text-align: center;
  color: #777;
  font-size: 13px;
  padding: 12px 0 24px;
}
.list-loading span {
  opacity: 0.8;
}
.list-error {
  text-align: center;
  color: #d93025;
  font-size: 13px;
  padding: 12px 0 12px;
}
</style>
