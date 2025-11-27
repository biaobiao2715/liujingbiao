<!--
        标题: Purchaser.vue
        功能: 我参与的
        说明: 用于查看我参与的会议。
        当前版本: 1.0
        开发信息: Created by 刘景彪 2025-10-27
    -->
<template>
  <div class="favorite-page">
    <div class="menu-title">我参与的</div>
    <div class="pading20">
      <el-tabs v-model="state.activeTab" @tab-change="onTabChange">
        <el-tab-pane label="培训会议" name="1" />
        <el-tab-pane label="普法活动" name="2" />
      </el-tabs>

      <el-skeleton :loading="state.loading" animated :throttle="200" :count="1">
        <template #template>
          <div class="grid">
            <el-skeleton-item variant="image" style="width: 240px; height: 240px" />
            <div style="padding: 14px">
              <el-skeleton-item variant="h3" style="width: 50%" />
              <div style="display: flex; align-items: center; justify-items: space-between; margin-top: 16px; height: 16px">
                <el-skeleton-item variant="text" style="margin-right: 16px" />
                <el-skeleton-item variant="text" style="width: 30%" />
              </div>
            </div>
          </div>
        </template>

        <template #default>
          <el-empty v-if="state.list.length === 0" description="暂无收藏" />

          <!-- 文章收藏 -->
          <div class="grid goods-grid">
            <el-card
              v-for="item in state.list"
              @click="goDetail(item)"
              :key="item.id"
              class="article-item"
              shadow="hover"
              :body-style="{ padding: '12px' }"
            >
              <div class="article">
                <img class="li-img" :src="getArticleCover(item)" alt="商品图片" loading="lazy" decoding="async" fetchpriority="low" />
                <div class="article_name">{{ getTitle(item) }}</div>
                <dict-text
                  class="article_type"
                  :options="state.activeTab == '1' ? meeting_type : legal_popularize_activity_type"
                  :value="getType(item)"
                />
                <div class="article_time">{{ getTime(item) }}</div>
                <el-button
                  v-hasPermi="['grain:HnPurchaseDemand:edit']"
                  class="article-btn cancel-btn-immersive"
                  @click.stop="onUnfav(item)"
                  v-throttle
                  text
                  :loading="state.opLoadingId === item.id"
                  >取消报名
                </el-button>
              </div>
            </el-card>
          </div>
        </template>
      </el-skeleton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, onBeforeUnmount, getCurrentInstance, toRefs, computed } from 'vue';
import type { ComponentInternalInstance } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useUserStore } from '@/store/modules/user';
import { eventBus } from '@/utils/eventBus';
import { participateCategoryList, participateCategoryPost, FavoriteItem } from '@/api/mall/personalCenter/participatedRequests';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { meeting_type, legal_popularize_activity_type } = toRefs<any>(proxy?.useDict('meeting_type', 'legal_popularize_activity_type'));
const userStore = useUserStore();
// 本地占位图（可根据实际资源调整路径）
const defaultImg = new URL('@/assets/logo/logo.png', import.meta.url).href;
const state = reactive({
  activeTab: '1', // 1=培训会议 3=普法活动
  list: [] as FavoriteItem[],
  total: 0,
  loading: false,
  opLoadingId: 0 as number | 0,
  query: {
    pageNum: 1,
    pageSize: 10,
    userId: userStore.userId
  }
});

onMounted(() => {
  reload();
  // 监听个人中心详情关闭后的刷新事件，仅在“我参与的”页时响应
  eventBus.on('refreshPersonalCenterList', handleRefreshEvent);
});

// 统一刷新事件处理器，保持引用稳定以便正常解绑
function handleRefreshEvent(payload: { key?: string; detailType?: string; id?: string }) {
  if (payload?.key !== 'participated') return;
  reload();
}

onBeforeUnmount(() => {
  try {
    eventBus.off?.('refreshPersonalCenterList', handleRefreshEvent);
  } catch {
    // 忽略不支持 off 的实现
  }
});

function onTabChange(name: string | number) {
  state.activeTab = String(name);
  state.query.pageNum = 1;
  reload();
}

function reload() {
  state.loading = true;
  const query = { ...state.query, categoryType: state.activeTab };

  participateCategoryList(query)
    .then((res: any) => {
      const rows = res.rows[0].activityEnrollList || [];
      state.list = rows || [];
    })
    .catch(() => {
      // 调用失败时清空数据
      state.list = [];
    })
    .finally(() => {
      state.loading = false;
    });
}

function onUnfav(item: any) {
  if (!item?.id) return;
  ElMessageBox.confirm(`确定要取消收藏“${item.meetingCultivateVo?.meetingName || item.lawActivityVo?.activityTitle || ''}”吗？`, '取消收藏确认', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '再想想'
  })
    .then(async () => {
      state.opLoadingId = item.id as number;
      await participateCategoryPost({
        categoryType: state.activeTab,
        id: item.foreignId,
        activityType: item.activityType,
        activityEnrollBo: item
      });
      reload();
      ElMessage.success('已取消收藏');
    })
    .finally(() => (state.opLoadingId = 0));
}

// 跳转详情（按你项目实际路由调整）
function goDetail(item: any) {
  const id: Record<string, string | number> = {
    '1': item.meetingCultivateVo?.id || null,
    '2': item.lawActivityVo?.id || null
  };
  const commandMap: Record<string, string> = {
    '1': 'meeting',
    '2': 'lawActivity'
  };
  eventBus.emit('showDetailspage', {
    id: id[state.activeTab] || null,
    type: commandMap[state.activeTab] || 'meeting'
  });
}

function getArticleCover(item: any) {
  return item.articleTitle || defaultImg;
}
function getTitle(item: any) {
  return item.meetingCultivateVo?.meetingName || item.lawActivityVo?.activityTitle || '-';
}
function getType(item: any) {
  return item.meetingCultivateVo?.meetingType || item.lawActivityVo?.activityType || '-';
}
function getTime(item: any) {
  return item.meetingCultivateVo?.publishTime || item.lawActivityVo?.publishTime || '-';
}
</script>

<style scoped>
/* 页面布局样式 */
.menu-title {
  display: flex;
  align-items: center;
  height: 60px;
  padding-left: 20px;
  font-size: 20px;
  font-weight: 500;
  color: #333333;
  background: #fff;
  position: relative;
  border-bottom: 2px solid #d8d8d8;
  border-radius: 8px 8px 0 0;
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
}

.menu-title::before {
  content: '';
  display: inline-block;
  width: 26px;
  height: 26px;
  background: #108c58;
  border-radius: 4px 4px 4px 4px;
  margin-right: 12px;
}

.pading20 {
  padding: 20px;
  background: #ffffff;
  border-radius: 0 0 8px 8px;
}
/* 通用网格（文章等保持自适应） */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

/* 商品收藏：固定 5 列，20 条即 4 行 */
.goods-grid {
  grid-template-columns: repeat(5, 1fr);
}

/* 沉浸式卡片悬停动画 */
.article-item {
  transition:
    transform 240ms cubic-bezier(0.2, 0.6, 0.3, 1),
    box-shadow 240ms cubic-bezier(0.2, 0.6, 0.3, 1);
  position: relative;
  overflow: visible;
}
/* 保证卡片内容不被遮挡 */
.article {
  position: relative;
  z-index: 1;
}

/* 图片比例统一 */
.li-img {
  width: 100%;
  height: 196px;
  object-fit: cover;
  border-radius: 6px;
  background: #f7f8fa;
}

.article_name {
  height: 50px;
  line-height: 50px;
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  font-size: 14px;
  color: #333333;
}
.article_name::before {
  content: '';
  display: inline-block;
  width: 16px;
  height: 16px;
  background: #108c58;
  border-radius: 4px 4px 4px 4px;
  margin-right: 6px;
}

.article_type {
  width: 48px;
  height: 21px;
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  font-size: 12px;
  color: #108c58;
  line-height: 21px;
  text-align: left;
  font-style: normal;
  text-transform: none;
}

.article_time {
  height: 21px;
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  font-size: 14px;
  color: #7a7a7a;
  line-height: 21px;
  margin-top: 15px;
}

.article-btn {
  width: 100%;
  height: 36px;
  line-height: 36px;
  border-radius: 4px 4px 4px 4px;
  border-radius: 4px 4px 4px 4px;
  border: 1px solid #ef4d0b;
  margin-top: 20px;
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  font-size: 14px;
  color: #ef4d0b;

  display: none;
  transition: opacity 200ms ease-out;
}

.article-item:hover .article-btn.cancel-btn-immersive {
  display: inline-flex;
  transition: opacity 200ms ease-out;
}

.article-item:hover .li-img {
  height: 140px;
  transition: opacity 200ms ease-out;
}
</style>
