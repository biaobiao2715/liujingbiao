<!--
  标题: enterprise/index.vue
  功能: 商品列表
  说明: 用于商品列表查询
  当前版本: 1.0
  开发信息: Created by 刘景彪 2025-10-15
-->
<template>
  <div class="supplier-management">
    <!-- 搜索条件 -->
    <el-form ref="queryFormRef" :model="queryParams" inline label-position="left" label-width="auto">
      <el-form-item label="商品编码" prop="goodsCode">
        <el-input v-model="queryParams.goodsCode" placeholder="请输入商品编码" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="商品名称" prop="goodsName">
        <el-input v-model="queryParams.goodsName" placeholder="请输入商品名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="商品状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择商品状态" filterable clearable>
          <el-option v-for="dict in goods_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="发布时间" prop="launchTime">
        <el-date-picker
          v-model="queryParams.launchTime"
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
        <el-button v-throttle v-hasPermi="['system:goods:list']" icon="Search" type="primary" @click="handleSearch">查询</el-button>
        <el-button v-throttle v-hasPermi="['system:goods:list']" icon="Refresh" @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8" justify="space-between">
      <el-col :span="20">
        <el-button v-throttle v-hasPermi="['system:goods:add']" icon="Plus" type="primary" @click="handleAdd">新增商品</el-button>
        <el-button
          v-throttle
          v-hasPermi="['system:goods:remove']"
          :style="loading || actionLoading !== null || selectedIds.length === 0 ? 'color: #333333;' : 'color: #fff;'"
          :color="loading || actionLoading !== null || selectedIds.length === 0 ? '#F2F3F5' : '#F23255'"
          @click="handleDelete"
        >
          删除
        </el-button>
        <el-button
          v-throttle
          :style="loading || actionLoading !== null || selectedIds.length === 0 ? 'color: #333333;' : 'color: #fff;'"
          :color="loading || actionLoading !== null || selectedIds.length === 0 ? '#F2F3F5' : '#108C58'"
          v-hasPermi="['system:goods:onAndShelves']"
          @click="handleShelf"
        >
          上架
        </el-button>
        <el-button
          v-throttle
          :style="loading || actionLoading !== null || selectedIds.length === 0 ? 'color: #333333;' : 'color: #fff;'"
          :color="loading || actionLoading !== null || selectedIds.length === 0 ? '#F2F3F5' : '#108C58'"
          v-hasPermi="['system:goods:onAndShelves']"
          @click="handleUnshelf"
        >
          下架
        </el-button>
        <el-button v-throttle color="#F2F3F5" style="color: #333333" v-hasPermi="['system:goods:export']" @click="handleExport">导出</el-button>
      </el-col>

      <el-col :span="1.5">
        <el-button v-throttle icon="Search" type="primary" v-hasPermi="['system:goods:editPrice']" @click="onPriceHistory"
          >查询价格调整历史</el-button
        >
      </el-col>
    </el-row>

    <!-- 表格展示 -->
    <el-table :data="tableData" v-loading="loading" style="width: 100%" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" />
      <el-table-column type="index" label="序号" width="55" />
      <el-table-column label="商品名称" prop="goodsName" width="150" :show-overflow-tooltip="true" />
      <el-table-column label="商品编码" prop="goodsCode" width="240" :show-overflow-tooltip="true"> </el-table-column>
      <el-table-column label="销售价" prop="salesPrice" width="140" :show-overflow-tooltip="true">
        <template #default="scope">
          <span style="color: #108c58">{{ getSalesPrice(scope.row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品类目" prop="goodsCategoryName" width="150" :show-overflow-tooltip="true"> </el-table-column>
      <el-table-column label="预警下限" prop="goodsAlert"> </el-table-column>
      <el-table-column label="提醒" prop="remind" width="100">
        <template #default="scope">
          <span :style="{ color: scope.row.remind == '无' ? '' : '#FF0000' }">{{ scope.row.remind }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品状态" prop="status" align="center">
        <!-- <template #default="scope">
          <dict-text :options="goods_status" :value="scope.row.status ?? ''" />
        </template> -->
        <template #default="scope">
          <div class="flex-center-center">
            <div
              v-if="scope.row.status != null"
              class="normal"
              :class="{
                green: scope.row.status == 1,
                reviewRejected: scope.row.status == 0
              }"
            ></div>
            <span v-if="scope.row.status == 0" class="reviewRejected-color">下架</span>
            <span v-if="scope.row.status == 1" class="green-color">上架</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="发布时间" prop="launchTime" min-width="180">
        <template #default="scope">
          <span>{{ proxy.parseTime(scope.row.launchTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" min-width="350" class-name="op-col">
        <template #default="scope">
          <el-button v-throttle v-hasPermi="['system:goods:query']" link type="primary" @click="openDetails(scope.row)">详情</el-button>
          <el-button v-throttle v-hasPermi="['system:goods:edit']" link type="primary" @click="openEdit(scope.row)">编辑</el-button>
          <el-button v-throttle v-hasPermi="['system:goods:editPrice']" link type="primary" @click="openDetailsEdit(scope.row)">价格设定</el-button>
          <el-button v-throttle v-hasPermi="['system:goods:add']" link type="primary" @click="openCopy(scope.row)">复制商品</el-button>
          <el-button v-throttle v-hasPermi="['system:goods:setWarnings']" link type="primary" @click="openWarnDialog(scope.row)">设置预警</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="flex-center pagination">
      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </div>

    <!-- 设置预警值弹窗 -->
    <el-dialog v-model="warnDialogVisible" title="设置预警值" width="420px" :close-on-click-modal="false">
      <el-form ref="warnFormRef" :model="warnForm" :rules="warnRules" label-width="80px">
        <el-form-item label="预警下限" prop="goodsAlert">
          <el-input
            v-model="warnForm.goodsAlert"
            placeholder="请输入预警下限"
            inputmode="numeric"
            @input="(val) => onInputDigits(val as string, warnForm, 'goodsAlert', { maxLen: 9 })"
            @keypress="onKeypressDigits"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" :loading="warnSubmitting" @click="onWarnConfirm">确定</el-button>
        <el-button :disabled="warnSubmitting" @click="onWarnCancel">取消</el-button>
      </template>
    </el-dialog>

    <!-- 统一弹窗 -->
    <el-dialog v-model="dialog.visible" :title="dialog.title" width="80%" destroy-on-close :close-on-click-modal="false" @close="dialog.type = ''">
      <Suspense>
        <template #default>
          <component
            :is="
              dialog.constants === 'edit'
                ? EditDialog
                : dialog.constants === 'details'
                  ? DetailsDialog
                  : dialog.constants === 'productPrice'
                    ? ProductPriceDialog
                    : null
            "
            :id="dialog.id"
            :type="dialog.type"
            @success="onDialogSuccess"
            @cancel="dialog.visible = false"
          />
        </template>
        <template #fallback>
          <el-skeleton :rows="6" animated />
        </template>
      </Suspense>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance, toRefs, onMounted, onActivated, defineAsyncComponent, reactive, nextTick } from 'vue';
import type { ComponentInternalInstance } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { goodsList, goodsDelete, updateGoodsStatus, setGoodsWarnings, goodsExport } from '@/api/supplier/productManagement/product';

// 异步引入弹窗组件
const EditDialog = defineAsyncComponent(() => import('./Edit.vue'));
const DetailsDialog = defineAsyncComponent(() => import('./Details.vue'));
const ProductPriceDialog = defineAsyncComponent(() => import('./ProductPrice.vue'));

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { goods_status } = toRefs<any>(proxy?.useDict('goods_status'));

// 搜索表单数据
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  status: '',
  launchTime: [] as string[] | [],
  goodsCategoryId: '',
  goodsName: '',
  goodsCode: ''
});

// 列表与状态
const tableData = ref<any[]>([]);
const total = ref(0);
const loading = ref(true);
const queryFormRef = ref();
const actionLoading = ref<'shelf' | 'unshelf' | 'delete' | null>(null);
// 选择集
const selectedIds = ref<(string | number)[]>([]);
const selectedRows = ref<any[]>([]);

// 统一弹窗状态
const dialog = reactive({
  visible: false,
  type: '', // 'edit' | 'view' | 'price'
  id: null,
  title: '',
  constants: ''
});

// 设置预警 弹窗显隐与提交状态
const warnDialogVisible = ref(false);
const warnSubmitting = ref(false);

// 表单与校验
const warnFormRef = ref<FormInstance>();
const warnForm = reactive<{
  id?: number | string;
  goodsAlert: string | null;
}>({
  id: undefined,
  goodsAlert: ''
});

const warnRules: FormRules = {
  goodsAlert: [
    { required: true, message: '请输入预警下限', trigger: 'blur' },
    {
      validator: (_rule, value, callback) => {
        const v = String(value ?? '').trim();
        if (v === '') {
          callback(new Error('请输入预警下限'));
          return;
        }
        if (!/^\d+$/.test(v)) {
          callback(new Error('请输入大于等于 0 的整数'));
          return;
        }
        callback();
      },
      trigger: 'blur'
    }
  ]
};

/** 获取列表 */
const getList = () => {
  loading.value = true;
  const { launchTime, ...rest } = queryParams.value as any;
  const [startTime, endTime] = Array.isArray(launchTime) ? launchTime : [];
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
    launchTime: [],
    goodsCategoryId: '',
    goodsName: '',
    goodsCode: ''
  };
  handleQuery();
};

// 取消
const onWarnCancel = () => {
  warnDialogVisible.value = false;
  resetWarnForm();
};

// 重置
const resetWarnForm = () => {
  warnForm.id = undefined;
  warnForm.goodsAlert = '';
  warnFormRef.value?.clearValidate?.();
};

// 打开弹窗并回显
const openWarnDialog = (row: any) => {
  warnForm.id = row?.id;
  warnForm.goodsAlert = String(row?.goodsAlert ?? '');
  warnDialogVisible.value = true;
  nextTick(() => warnFormRef.value?.clearValidate?.());
};

// 确定提交
const onWarnConfirm = () => {
  if (!warnFormRef.value) return;
  warnFormRef.value.validate(async (valid) => {
    if (!valid) return;
    warnSubmitting.value = true;
    try {
      await setGoodsWarnings({
        id: warnForm.id,
        goodsAlert: Number(warnForm.goodsAlert)
      });
      ElMessage.success('设置成功');
      warnDialogVisible.value = false;
      getList();
    } catch (err: any) {
      ElMessage.error(err?.message || '设置失败，请稍后重试');
    } finally {
      warnSubmitting.value = false;
      resetWarnForm();
    }
  });
};

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

// 导出
const handleExport = () => {
  const ids = selectedIds.value.slice();

  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  const fileName = `商品管理_${year}-${month}-${day}.xlsx`;
  // 解构查询参数
  const { pageNum, pageSize, ...daochu } = queryParams.value;

  // 构造导出参数
  const params =
    ids.length > 0
      ? { ids: ids.join(',') } // 只导出选中的商品
      : { ...daochu }; // 导出当前查询条件下的全部商品

  // 调用下载方法
  proxy.download('/grain-sales/goods/export', params, fileName);
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

// 仅允许数字输入的通用方法
const filterDigits = (val: string, opts?: { maxLen?: number }) => {
  let s = (val ?? '').replace(/\D/g, '');
  if (opts?.maxLen) s = s.slice(0, opts.maxLen);
  return s;
};
const onInputDigits = (val: string, obj: Record<string, any>, key: string, opts?: { maxLen?: number }) => {
  obj[key] = filterDigits(val, opts);
};
const onKeypressDigits = (e: KeyboardEvent) => {
  const key = e.key;
  if (!/[0-9]/.test(key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'].includes(key)) {
    e.preventDefault();
  }
};

// 打开弹窗方法
function openDialog(type: 'edit' | 'view' | 'price' | 'copy' | 'add', id: string | number | null = null, title = '', constants = '') {
  dialog.type = type;
  dialog.id = id;
  dialog.title = title;
  dialog.visible = true;
  dialog.constants = constants;
}

// 弹窗相关事件
const handleAdd = () => openDialog('add', null, '新增商品', 'edit');
const openEdit = (row: any) => openDialog('edit', row.id, '商品编辑', 'edit');
const openCopy = (row: any) => openDialog('copy', row.id, '复制商品', 'edit');
const openDetails = (row: any) => openDialog('view', row.id, '商品详情', 'details');
const openDetailsEdit = (row: any) => openDialog('edit', row.id, '商品价格设定', 'details');
const onPriceHistory = () => openDialog('price', null, '商品价格调整历史', 'productPrice');
const onDialogSuccess = () => {
  dialog.visible = false;
  getList();
};

// 初始化
onMounted(async () => {
  getList();
});
</script>

<style scoped lang="scss">
.supplier-management {
  min-height: calc(100vh - 120px);
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
