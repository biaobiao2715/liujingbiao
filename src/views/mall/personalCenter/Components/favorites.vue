<!--
        标题: Purchaser.vue
        功能: 我的收藏夹
        说明: 用于查看我收藏的商品和文章。
        当前版本: 1.0
        开发信息: Created by 刘景彪 2025-10-27
    -->
<template>
  <div class="favorite-page">
    <el-card shadow="never" class="fav-card">
      <div class="header">
        <div class="title">我的收藏夹</div>
        <el-input v-model="state.query.googsName" placeholder="搜索收藏名称/编号" class="search" clearable @clear="reload" @keyup.enter="reload">
          <template #append>
            <el-button @click="reload" :loading="state.loading" icon="Search">搜索</el-button>
          </template>
        </el-input>
      </div>

      <el-tabs v-model="state.activeTab" @tab-change="onTabChange">
        <el-tab-pane v-for="(item, index) in tabList" :key="index" :label="item.label" :name="item.value" />
      </el-tabs>

      <el-skeleton :loading="state.loading" animated :throttle="200" :count="1">
        <template #template>
          <div class="grid">
            <el-skeleton-item variant="image" style="width: 240px; height: 160px" />
            <el-skeleton-item variant="p" style="width: 60%" />
          </div>
        </template>

        <template #default>
          <el-empty v-if="state.list.length === 0" description="暂无收藏" />

          <!-- 商品收藏：固定 5 列 -->
          <div v-if="state.activeTab === '1'" class="grid goods-grid">
            <el-card
              v-for="item in state.list"
              @click="goDetail(item)"
              :key="item.id"
              class="goods-item"
              shadow="hover"
              :body-style="{ padding: '12px' }"
            >
              <div class="goods">
                <img class="li-img" :src="item.googsImageUrl || defaultImg" alt="商品图片" />
                <div class="flex-between">
                  <div>{{ getPrice(item.googsPrice, item.spread) }} {{ specificationText(item.goodsSpecificationId) }}</div>
                  <div>{{ priceDelta(item.spread) }}</div>
                </div>
                <div class="flex-between">
                  <div class="name-ellipsis">{{ item.googsName }}</div>
                  <el-button class="fav-heart" text @click.stop="onUnfav(item)" :loading="state.opLoadingId === item.id">
                    <el-icon><StarFilled /></el-icon>
                  </el-button>
                </div>
                <div class="flex-between">
                  <div>
                    <el-tag v-for="(vs, index) in item.productGuarantee" :key="index" type="primary" style="margin-right: 4px">{{
                      vs.attributeName
                    }}</el-tag>
                  </div>
                  <div class="addr-ellipsis">{{ item.address }}</div>
                </div>
              </div>
            </el-card>
          </div>

          <!-- 文章收藏 -->
          <div v-else class="grid goods-grid">
            <el-card
              v-for="item in state.list"
              @click="goDetail(item)"
              :key="item.id"
              class="goods-item"
              shadow="hover"
              :body-style="{ padding: '12px' }"
            >
              <div class="goods">
                <img class="li-img" :src="item.articleCover || defaultImg" alt="文章图片" />
                <div class="name" :title="item.articleTitle || item.googsName">
                  {{ item.articleTitle || item.googsName || '-' }}
                </div>
                <div class="flex-between">
                  <div class="author">作者： {{ item.articleAuthor }}</div>
                  <el-button class="fav-heart" text @click.stop="onUnfav(item)" :loading="state.opLoadingId === item.id">
                    <el-icon><StarFilled /></el-icon>
                  </el-button>
                </div>
              </div>
            </el-card>
          </div>
        </template>
      </el-skeleton>

      <div class="pager">
        <pagination
          v-if="state.total > 0"
          v-model:page="state.query.pageNum"
          v-model:limit="state.query.pageSize"
          :total="state.total"
          @pagination="reload"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, getCurrentInstance, toRefs, computed } from 'vue';
import type { ComponentInternalInstance } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { unifiedFavoriteList, favoriteDelete, FavoriteItem } from '@/api/mall/personalCenter/favorite';
import { StarFilled } from '@element-plus/icons-vue';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { goods_specification } = toRefs<any>(proxy?.useDict('goods_specification'));
// 本地占位图（可根据实际资源调整路径）
const defaultImg = new URL('@/assets/logo/logo.png', import.meta.url).href;
// Tab 列表
const tabList = [
  { label: '收藏商品', value: '1' },
  { label: '收藏文章', value: '3' },
  { label: '普法内容', value: '4' },
  { label: '培训课程', value: '5' }
];

const state = reactive({
  activeTab: '1', // 1=商品 3=文章
  list: [] as FavoriteItem[],
  total: 0,
  loading: false,
  opLoadingId: 0 as number | 0,
  query: {
    pageNum: 1,
    pageSize: 10,
    googsName: ''
  }
});

function onTabChange(name: string | number) {
  state.activeTab = String(name);
  state.query.pageNum = 1;
  reload();
}

function reload() {
  state.loading = true;
  const query = { ...state.query, type: state.activeTab };
  unifiedFavoriteList(query)
    .then((res: any) => {
      const rows = res?.rows ?? res?.data?.records ?? res?.data ?? [];
      const total = res?.total ?? res?.data?.total ?? rows.length ?? 0;
      state.list = rows || [];
      state.total = Number(total) || 0;
    })
    .finally(() => {
      state.loading = false;
    });
}

function onUnfav(item: FavoriteItem) {
  if (!item?.id) return;
  ElMessageBox.confirm(`确定要取消收藏“${item.googsName || item.articleTitle || ''}”吗？`, '取消收藏确认', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '再想想'
  })
    .then(async () => {
      state.opLoadingId = item.id as number;
      // 商品/文章/普法/培训均可用同一个删除接口
      await favoriteDelete(item.id as number);
      ElMessage.success('已取消收藏');
      reload();
    })
    .finally(() => (state.opLoadingId = 0));
}

// 跳转详情（按你项目实际路由调整）
function goDetail(item: FavoriteItem) {
  const id = item.id;
  if (state.activeTab === '1') {
    // 商品详情
    // router.push(`/mall/goods/detail/${id}`);
  } else {
    // 文章详情
    // router.push(`/platform/article/detail/${id}`);
  }
}

// 金额格式化（￥可按需添加）
const formatMoney = (v: number) => v.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// 转数字的安全工具：空/无效返回 null
const toNumber = (v: unknown): number | null => {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

// price 为收藏时价格，spread 为与当前价格的差价（当前价 - 收藏价）
// spread 为空时按 0 处理，返回“当前价格”的格式化字符串
const getPrice = (price: unknown, spread: unknown) => {
  const base = toNumber(price);
  if (base === null) return '';
  const deltaNum = toNumber(spread);
  const delta = deltaNum === null ? 0 : deltaNum;
  const current = base + delta;
  return formatMoney(current);
};

// 价格变动信息：比收藏时涨/降/持平
const priceDelta = (spread: unknown) => {
  const n = toNumber(spread) ?? 0;
  const dir = n > 0 ? `比收藏时涨${formatMoney(n)}元` : n < 0 ? `比收藏时降${formatMoney(-n)}元` : '';
  return dir;
};

// 规格值文本
const specificationText = (specId: unknown) => {
  // console.log('specId', specId, goods_specification, goods_specification.value);
  const list = goods_specification.value || [];
  if (!list.length || specId === null || specId === undefined || specId === '') return '';
  const hit = list.find((v: any) => String(v?.dictValue ?? v?.value ?? v?.id) === String(specId));
  return hit?.dictLabel ?? hit?.label ?? '';
};

onMounted(() => {
  reload();
});
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
  /* min-height: 260px; */
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

/* 图片比例统一 */
.li-img {
  width: 100%;
  height: 140px;
  object-fit: cover;
  border-radius: 8px;
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

/* 收藏心形按钮：图标化、悬停放大 */
.fav-heart {
  color: #ff6a00;
  font-size: 18px;
  padding: 0;
}
.fav-heart .el-icon {
  vertical-align: middle;
  transition: transform 0.2s ease;
}
.fav-heart:hover .el-icon {
  transform: scale(1.1);
}

/* ========== 文章卡片样式优化 ========== */

.article .name {
  font-weight: 600;
  line-height: 1.5;
  color: var(--el-text-color-primary);
  display: -webkit-box;
  -webkit-line-clamp: 2; /* 两行省略 */
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article .author {
  color: var(--el-text-color-secondary);
  font-size: 13px;
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
