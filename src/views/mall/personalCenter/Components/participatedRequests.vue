<!--
        标题: Purchaser.vue
        功能: 我参与的
        说明: 用于查看我参与的会议。
        当前版本: 1.0
        开发信息: Created by 刘景彪 2025-10-27
    -->
<template>
  <div class="favorite-page">
    <el-card shadow="never" class="fav-card">
      <div class="header">
        <div class="title">我参与的</div>
      </div>

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
                <img class="li-img" :src="getArticleCover(item)" alt="商品图片" />
                <div class="info">
                  <div class="name">
                    {{ getTitle(item) }}
                  </div>
                  <div class="flex-between meta-line">
                    <dict-text :options="state.activeTab == '1' ? meeting_type : legal_popularize_activity_type" :value="getType(item)" />
                    <el-button type="primary" @click.stop="onUnfav(item)" :loading="state.opLoadingId === item.id"> 取消报名 </el-button>
                  </div>
                  <div>{{ getTime(item) }}</div>
                </div>
              </div>
            </el-card>
          </div>
        </template>
      </el-skeleton>

      <!-- <div class="pager">
        <pagination
          v-if="state.total > 0"
          v-model:page="state.query.pageNum"
          v-model:limit="state.query.pageSize"
          :total="state.total"
          @pagination="reload"
        />
      </div> -->
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, getCurrentInstance, toRefs, computed } from 'vue';
import type { ComponentInternalInstance } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { participateCategoryList, participateCategoryPost, FavoriteItem } from '@/api/mall/personalCenter/participatedRequests';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { meeting_type, legal_popularize_activity_type } = toRefs<any>(proxy?.useDict('meeting_type', 'legal_popularize_activity_type'));

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
    pageSize: 10
  }
});

onMounted(() => {
  reload();
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
        id: item.id,
        activityType: item.activityType,
        activityEnrollBo: item
      });
      ElMessage.success('已取消收藏');
      reload();
    })
    .finally(() => (state.opLoadingId = 0));
}

// 跳转详情（按你项目实际路由调整）
function goDetail(item: FavoriteItem) {
  if (state.activeTab === '1') {
    // 商品详情
    const id = item.id;
    // router.push(`/mall/goods/detail/${id}`);
  } else {
    // 文章详情
    const id = item.id;
    // router.push(`/platform/article/detail/${id}`);
  }
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
.favorite-page {
  padding: 16px;
}
.fav-card {
  width: 100%;
}
.header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}
.title {
  font-size: 18px;
  font-weight: 600;
}
.search {
  max-width: 360px;
  margin-left: auto;
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

/* 商品卡片统一高度与交互优化 */
.goods-item {
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  min-height: 260px;
}
.goods-item:hover {
  transform: translateY(-2px);
}

/* 卡片内布局与文本溢出处理 */
.goods {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.meta-line {
  color: #909399;
  font-size: 16px;
  margin: 8px 0;
}

/* 图片比例统一 */
.li-img {
  width: 100%;
  height: 140px;
  object-fit: cover;
  border-radius: 6px;
  background: #f7f8fa;
}

/* 文本省略 */
.name-ellipsis {
  max-width: 65%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.addr-ellipsis {
  max-width: 45%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

/* 文章块保持原有自适应即可 */
.pager {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}
.ml8 {
  margin-left: 8px;
}
</style>
