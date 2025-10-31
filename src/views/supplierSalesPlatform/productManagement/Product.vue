<template>
  <div class="supplier-management">
    <!-- 搜索条件 -->
    <el-form v-show="showSearch" ref="queryFormRef" :model="queryParams" inline :label-width="130">
      <el-form-item label="商品编码" prop="goodsCode">
        <el-input v-model="queryParams.goodsCode" placeholder="请输入商品编码" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="商品名称" prop="goodsName">
        <el-input v-model="queryParams.goodsName" placeholder="请输入商品名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="商品状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="审核状态" filterable clearable>
          <el-option v-for="dict in goods_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="发布时间" prop="createTime">
        <el-date-picker
          v-model="queryParams.createTime"
          type="datetimerange"
          value-format="YYYY-MM-DD HH:mm:ss"
          format="YYYY-MM-DD HH:mm:ss"
          :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
          range-separator=" - "
          start-placeholder="开始时间"
          end-placeholder="结束时间"
        />
      </el-form-item>
      <el-form-item>
        <el-button v-throttle type="primary" @click="handleSearch">查询</el-button>
        <el-button v-throttle @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button v-throttle type="primary" @click="handleAdd">新增商品</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-throttle
          type="primary"
          @click="handleDelete"
          :loading="actionLoading === 'delete'"
          :disabled="loading || actionLoading !== null"
        >
          删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button v-throttle type="primary" @click="handleShelf" :loading="actionLoading === 'shelf'" :disabled="loading || actionLoading !== null">
          上架
        </el-button>
      </el-col>

      <el-col :span="1.5">
        <el-button
          v-throttle
          type="primary"
          @click="handleUnshelf"
          :loading="actionLoading === 'unshelf'"
          :disabled="loading || actionLoading !== null"
        >
          下架
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button v-throttle type="primary" @click="handleExport">导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button v-throttle type="primary" @click="onPriceHistory">查询价格调整历史</el-button>
      </el-col>
      <right-toolbar :show-search="showSearch" @query-table="getList" />
    </el-row>

    <!-- 表格展示 -->
    <el-table :data="tableData" border v-loading="loading" style="width: 100%" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" />
      <el-table-column type="index" label="序号" width="55" align="center" />
      <el-table-column label="商品名称" align="center" prop="goodsName" width="150" :show-overflow-tooltip="true" />
      <el-table-column label="商品编码" align="center" prop="goodsCode" width="220">
        <template #default="scope">
          <router-link :to="'/supplier/sales/product/details/?id=' + scope.row.id + '&type=view'" class="link-type">
            <span>{{ scope.row.goodsCode }}</span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column label="销售价" align="center" prop="salesPrice" width="130" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ getSalesPrice(scope.row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品类目" align="center" prop="goodsCategoryName" width="150" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ getCategoryDisplay(scope.row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="预警下限" align="center" prop="goodsAlert" />
      <el-table-column label="提醒" align="center" prop="remind" width="100" />
      <el-table-column label="商品状态" align="center" prop="status">
        <template #default="scope">
          <dict-text :options="goods_status" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="发布时间" align="center" prop="createTime" min-width="160">
        <template #default="scope">
          <span>{{ proxy.parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="500">
        <template #default="scope">
          <el-button v-throttle type="primary" @click="openDetails(scope.row, 'view')">详情</el-button>
          <el-button v-throttle type="primary" @click="openDetails(scope.row, 'edit')">价格设定</el-button>
          <el-button v-throttle type="primary" @click="openEdit(scope.row)">编辑</el-button>
          <el-button v-throttle type="primary" @click="openCopy(scope.row)">复制商品</el-button>
          <el-button v-throttle type="primary">设置预警</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="flex-center pagination">
      <pagination v-show="total > 0" :page="queryParams.pageNum" :limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </div>

    <!-- 父控弹窗：商品编辑/新增/复制 -->
    <el-dialog
      v-model="editDlgVisible"
      :title="editDlgTitle"
      width="80%"
      append-to-body
      :destroy-on-close="true"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <Suspense>
        <Edit :id="selectedGoodsId" :type="editOperateMode" @success="onEditSuccess" @cancel="onEditCancel" />
        <template #fallback>
          <el-skeleton :rows="8" animated />
        </template>
      </Suspense>
    </el-dialog>

    <!-- 父控弹窗：商品详情/价格设定 -->
    <el-dialog
      v-model="detailsDlgVisible"
      :title="detailsDlgTitle"
      width="80%"
      append-to-body
      :destroy-on-close="true"
      :close-on-click-modal="detailsOperateMode === 'view'"
      :close-on-press-escape="detailsOperateMode === 'view'"
    >
      <Suspense>
        <Details :id="selectedGoodsId" :type="detailsOperateMode" @success="onDetailsSuccess" @cancel="onDetailsCancel" />
        <template #fallback>
          <el-skeleton :rows="6" animated />
        </template>
      </Suspense>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance, toRefs, onMounted, onActivated, defineAsyncComponent } from 'vue';
import type { ComponentInternalInstance } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import router from '@/router';
import { goodsList, goodsDelete, updateGoodsStatus } from '@/api/supplier/productManagement/product';
import { getProductCategoryList } from '@/api/platform/mallConfiguration/productCategory';

// 异步引入子组件（按需加载）
const Edit = defineAsyncComponent(() => import('./edit.vue'));
const Details = defineAsyncComponent(() => import('./details.vue'));

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { goods_status } = toRefs<any>(proxy?.useDict('goods_status'));

// 搜索表单数据
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  status: '',
  createTime: [] as string[] | [],
  goodsCategoryId: '',
  goodsName: '',
  goodsCode: ''
});

// 列表与状态
const tableData = ref<any[]>([]);
const total = ref(0);
const loading = ref(true);
const queryFormRef = ref();
const showSearch = ref(true);
const actionLoading = ref<'shelf' | 'unshelf' | 'delete' | null>(null);
// 选择集
const selectedIds = ref<(string | number)[]>([]);
const selectedRows = ref<any[]>([]);

// 类目映射
const categoryList = ref<any[]>([]);
const categoryMap = ref<Record<string, string>>({});

// 父控对话框（编辑/新增/复制）
const editDlgVisible = ref(false);
const editDlgTitle = ref('');
const selectedGoodsId = ref<string | number | null>(null);
const editOperateMode = ref<'add' | 'edit' | 'copy'>('add');

// 父控对话框（详情/价格设定）
const detailsDlgVisible = ref(false);
const detailsDlgTitle = ref('');
const detailsOperateMode = ref<'view' | 'edit'>('view');

/** 获取列表 */
const getList = () => {
  loading.value = true;
  const { createTime, ...rest } = queryParams.value as any;
  const [startTime, endTime] = Array.isArray(createTime) ? createTime : [];
  const params = { ...rest, ...(startTime && endTime ? { startTime, endTime } : {}) };
  goodsList(params).then((res) => {
    tableData.value = res.rows;
    total.value = res.total;
    loading.value = false;
  });
};

// 搜索与重置
const handleSearch = () => getList();
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};
const handleReset = () => {
  queryFormRef.value?.resetFields?.();
  queryParams.value = {
    pageNum: 1,
    pageSize: 10,
    status: '',
    createTime: [],
    goodsCategoryId: '',
    goodsName: '',
    goodsCode: ''
  };
  handleQuery();
};

// 获取类目
const getCategoryList = async () => {
  try {
    const response = await getProductCategoryList();
    if (response && response.code === 200) {
      categoryList.value = response.data || response.rows || [];
      categoryMap.value = {};
      categoryList.value.forEach((c) => (categoryMap.value[c.id] = c.categoryName || c.name));
    }
  } catch (e) {
    console.error('获取商品类目失败:', e);
  }
};

// 价格调整历史
const onPriceHistory = () => router.push({ path: '/company/sales/company/goods/productPrice' });

// 选择变化
const handleSelectionChange = (selection: any[]) => {
  selectedIds.value = selection.map((i) => i.id);
  selectedRows.value = selection;
};

// 删除（必须勾选）
const handleDelete = async () => {
  const ids = selectedIds.value.slice();

  if (ids.length === 0) {
    ElMessage.warning('请先选择要删除的商品');
    return;
  }

  const tip = `确定要删除选中的 ${ids.length} 个商品吗？`;

  try {
    await ElMessageBox.confirm(tip, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    actionLoading.value = 'delete';

    // 并发删除
    const results = await Promise.allSettled(ids.map((id) => goodsDelete(id)));
    const successCount = results.filter((r) => r.status === 'fulfilled' && (r.value as any)?.code === 200).length;

    if (successCount === ids.length) {
      ElMessage.success(`成功删除 ${successCount} 个商品`);
    } else if (successCount > 0) {
      ElMessage.warning(`部分删除成功（${successCount}/${ids.length}）`);
    } else {
      ElMessage.error('删除失败，请重试');
    }

    // 刷新并清空选择
    await getList();
    selectedIds.value = [];
    selectedRows.value = [];
  } catch {
    ElMessage.info('删除操作已取消');
  } finally {
    actionLoading.value = null;
  }
};
// 将任意后端返回的状态值统一标准化为 '1'(上架)/'0'(下架)
const normalizeStatusCode = (status: any) => {
  const s = (status ?? '').toString();
  if (['1', '已上架', '上架'].includes(s)) return '1'; // 上架
  if (['0', '已下架', '下架'].includes(s)) return '0'; // 下架
  return s;
};

// 校验是否可操作
// toStatus: '1' 上架 -> 只能对当前为下架('0')的行操作
//           '0' 下架 -> 只能对当前为上架('1')的行操作
const ensureEligible = (rows: any[], toStatus: '1' | '0') => {
  if (rows.length === 0) return { ok: false, reason: '当前没有可操作的商品' };
  if (toStatus === '1') {
    const invalid = rows.filter((r) => normalizeStatusCode(r.status) === '1');
    if (invalid.length > 0) return { ok: false, reason: '目标商品中包含已上架的商品，无法重复上架' };
  } else {
    const invalid = rows.filter((r) => normalizeStatusCode(r.status) !== '1');
    if (invalid.length > 0) return { ok: false, reason: '目标商品中包含已下架的商品，无法重复下架' };
  }
  return { ok: true, reason: '' };
};

// 通用执行器（必须勾选）
const performStatusUpdate = async (toStatus: '1' | '0') => {
  const ids = selectedIds.value.slice();
  const rows = selectedRows.value.slice();

  // 必须勾选
  if (ids.length === 0) {
    ElMessage.warning(`请先选择要${toStatus === '1' ? '上架' : '下架'}的商品`);
    return;
  }

  // 合法性校验（上架只能对下架；下架只能对上架）
  const { ok, reason } = ensureEligible(rows, toStatus);
  if (!ok) {
    ElMessage.warning(reason);
    return;
  }

  const verb = toStatus === '1' ? '上架' : '下架';

  try {
    await ElMessageBox.confirm(`确定要将选中的 ${ids.length} 个商品进行${verb}吗？`, `${verb}确认`, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    actionLoading.value = toStatus === '1' ? 'shelf' : 'unshelf';

    const res = await updateGoodsStatus({ goodsIds: ids, status: toStatus });
    if (res?.code === 200) {
      ElMessage.success(`成功${verb}${ids.length}个商品`);
      await getList();
      selectedIds.value = [];
      selectedRows.value = [];
    } else {
      ElMessage.error(res?.msg || `${verb}操作失败`);
    }
  } catch {
    ElMessage.info(`${verb}操作已取消`);
  } finally {
    actionLoading.value = null;
  }
};

const handleShelf = () => performStatusUpdate('1'); //上架
const handleUnshelf = () => performStatusUpdate('0'); //下架
// 展示辅助
const getCategoryDisplay = (row: any) => {
  if (row?.goodsCategoryName) return row.goodsCategoryName;
  return row?.goodsCategoryId ? categoryMap.value[row.goodsCategoryId] || '未知类目' : '--';
};

// 金额格式化：¥ 前缀 + 千分位 + 两位小数
const formatCNY = (n: number) => `¥${n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * 销售价回显优化
 * 规则：
 * - 优先取启用规格（status === 1），若无启用则回退到全部规格
 * - 取有效非负价格，min==max 显示单价；否则显示范围价
 * - 若规格无有效价，回退到 row.salesPrice 或 row.price
 * - 最终仍无则显示 "--"
 */
const getSalesPrice = (row: any) => {
  const specs = Array.isArray(row?.hnGoodsSpecificationDataList) ? row.hnGoodsSpecificationDataList : [];

  // 仅统计启用规格，若没有启用规格则退回到全部规格
  const enabled = specs.filter((s: any) => s?.status === 1 || s?.status === '1');
  const source = enabled.length > 0 ? enabled : specs;

  const prices = source.map((s: any) => Number(s?.goodsPrice)).filter((p: number) => Number.isFinite(p) && p >= 0);

  if (prices.length > 0) {
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return min === max ? formatCNY(min) : `${formatCNY(min)} - ${formatCNY(max)}`;
  }

  // 规格里没取到有效价，回退到行级销售价/价格字段
  const fallback = Number(row?.salesPrice ?? row?.price);
  return Number.isFinite(fallback) ? formatCNY(fallback) : '--';
};

// 导出
const handleExport = () => {
  proxy?.download('/grain-sales/goods/export', { ...queryParams.value }, `goods_${new Date().getTime()}.xlsx`);
};

// 打开编辑/新增/复制（父控弹窗）
const handleAdd = () => {
  selectedGoodsId.value = null;
  editOperateMode.value = 'add';
  editDlgTitle.value = '商品新增';
  editDlgVisible.value = true;
};
const openEdit = (row: any) => {
  selectedGoodsId.value = row.id;
  editOperateMode.value = 'edit';
  editDlgTitle.value = '商品编辑';
  editDlgVisible.value = true;
};
const openCopy = (row: any) => {
  selectedGoodsId.value = row.id;
  editOperateMode.value = 'copy';
  editDlgTitle.value = '复制商品';
  editDlgVisible.value = true;
};
const onEditCancel = () => (editDlgVisible.value = false);
const onEditSuccess = () => {
  editDlgVisible.value = false;
  getList();
};

// 打开详情/价格设定（父控弹窗）
const openDetails = (row: any, type: 'view' | 'edit') => {
  selectedGoodsId.value = row.id;
  detailsOperateMode.value = type;
  detailsDlgTitle.value = type === 'edit' ? '价格设定' : '商品详情';
  detailsDlgVisible.value = true;
};
const onDetailsCancel = () => (detailsDlgVisible.value = false);
const onDetailsSuccess = () => {
  detailsDlgVisible.value = false;
  getList();
};

// 初始化
onMounted(async () => {
  await getCategoryList();
  getList();
});
onActivated(() => {
  getList();
});
</script>

<style scoped lang="scss">
.supplier-management {
  padding: 24px;
}
.pagination {
  margin-top: 24px;
  justify-content: end;
}
.dialog-footer {
  text-align: center;
  .el-button {
    margin: 0 8px;
  }
}
</style>
