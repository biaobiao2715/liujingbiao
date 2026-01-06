<!--
  标题: creditPlatform/contentManage/index.vue
  功能: 金融内容管理
  说明: 用于金融文章的管理，包括查询、新增、编辑、删除、上架下架等操作
  负责人： 门世超
  当前版本: 1.0
-->
<template>
  <div class="content-management">
    <!-- 搜索条件 -->
    <el-form v-show="showSearch" ref="queryFormRef" :model="queryParams" inline label-position="left">
      <el-form-item label="文章名称" prop="articleTitle" label-width="auto">
        <el-input v-model="queryParams.articleTitle" placeholder="请输入" clearable maxlength="50" show-word-limit @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="发布时间" prop="publishTime" label-width="auto">
        <el-date-picker
          v-model="dateRange"
          type="datetimerange"
          value-format="YYYY-MM-DD HH:mm:ss"
          format="YYYY-MM-DD HH:mm:ss"
          :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
          range-separator=" - "
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          @change="handleDateRangeChange"
        />
      </el-form-item>
      <el-form-item label="文章类型" prop="articleType" label-width="auto">
        <el-select v-model="queryParams.articleType" placeholder="请选择" filterable clearable>
          <el-option v-for="dict in art_article_type" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="articleStatus" label-width="auto">
        <el-select v-model="queryParams.articleStatus" placeholder="请选择" filterable clearable>
          <el-option v-for="dict in art_article_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button v-throttle type="primary" icon="Search" @click="handleQuery">查询</el-button>
        <el-button v-throttle icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作栏 -->
    <el-row :gutter="12" class="operation-bar">
      <el-col :span="1.5">
        <el-button v-throttle v-hasPermi="['credit:creditArticle:add']" type="primary" icon="Plus" class="add-btn" @click="handleAdd">
          新增
        </el-button>
      </el-col>
    </el-row>

    <!-- 表格 -->
    <el-table :data="tableData" v-loading="loading" @selection-change="handleSelectionChange">
      <el-table-column type="index" label="序号" width="55" align="center" />
      <el-table-column label="文章名称" prop="articleTitle" min-width="150" :show-overflow-tooltip="true" />
      <el-table-column label="文章简介" prop="articleSummary" min-width="200" :show-overflow-tooltip="true" />
      <el-table-column label="文章类型" prop="articleType" width="120">
        <template #default="scope">
          <dict-tag :options="art_article_type" :value="scope.row.articleType" />
        </template>
      </el-table-column>
      <el-table-column label="发布时间" prop="publishTime" min-width="160">
        <template #default="scope">
          <span>{{ proxy?.parseTime(scope.row.publishTime) || '--' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="createTime" min-width="160">
        <template #default="scope">
          <span>{{ proxy?.parseTime(scope.row.createTime) || '--' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="articleStatus" width="100" align="center">
        <template #default="scope">
          <div class="status-with-dot">
            <span class="status-dot" :class="`status-dot-${getStatusType(scope.row.articleStatus)}`"></span>
            <span class="status-text" :class="`status-text-${getStatusType(scope.row.articleStatus)}`">
              {{ getStatusLabel(scope.row.articleStatus) }}
            </span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" align="left" width="320" class-name="small-padding fixed-width">
        <template #default="scope">
          <div style="display: flex; justify-content: flex-start; align-items: center">
            <el-button
              v-throttle
              v-hasPermi="['credit:creditArticle:query']"
              link
              style="font-size: 14px; color: #108c58"
              @click="handleDetails(scope.row)"
            >
              详情
            </el-button>
            <el-button
              v-throttle
              v-hasPermi="['credit:creditArticle:edit']"
              v-if="canEdit(scope.row)"
              link
              style="font-size: 14px; color: #108c58"
              @click="handleEdit(scope.row)"
            >
              编辑
            </el-button>
            <el-button
              v-throttle
              v-hasPermi="['credit:creditArticle:edit']"
              v-if="canPublish(scope.row)"
              link
              style="font-size: 14px; color: #108c58"
              @click="handlePublish(scope.row)"
            >
              上架
            </el-button>
            <el-button
              v-throttle
              v-hasPermi="['credit:creditArticle:edit']"
              v-if="canOffline(scope.row)"
              link
              style="font-size: 14px; color: #108c58"
              @click="handleOffline(scope.row)"
            >
              下架
            </el-button>
            <el-button
              v-throttle
              v-hasPermi="['credit:creditArticle:remove']"
              v-if="canDelete(scope.row)"
              link
              style="font-size: 14px; color: #108c58"
              @click="handleDelete(scope.row)"
            >
              删除
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <pagination
        v-show="total > 0"
        :page="queryParams.pageNum"
        :limit="queryParams.pageSize"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @update:page="handlePageChange"
        @update:limit="handlePageSizeChange"
        @pagination="getList"
      />
    </div>

    <el-dialog
      v-model="dialog.visible"
      :title="getDialogTitle()"
      width="50%"
      destroy-on-close
      :close-on-click-modal="false"
      @close="dialog.type = ''"
    >
      <Suspense>
        <template #default>
          <component
            :is="dialog.type === 'view' ? ContentDetailDialog : ContentFormDialog"
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
import { ref, getCurrentInstance, onMounted, toRefs, defineAsyncComponent, Suspense, computed, h } from 'vue';
import type { ComponentInternalInstance } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getCreditArticleList, updateCreditArticle, deleteCreditArticle, getCreditArticleDetail } from '@/api/creditPlatform/contentManage';
import { useUserStore } from '@/store/modules/user';
import dateIconImg from '@/assets/images/finance/切图 43.png';

const ContentFormDialog = defineAsyncComponent(() => import('./ContentFormDialog.vue'));
const ContentDetailDialog = defineAsyncComponent(() => import('./ContentDetailDialog.vue'));

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
// 使用字典数据
const { art_article_status, art_article_type } = toRefs<any>(proxy?.useDict('art_article_status', 'art_article_type'));

// 自定义日期图标组件
const dateIcon = h('img', {
  src: dateIconImg,
  style: {
    width: '16px',
    height: '16px',
    objectFit: 'contain'
  }
});

const userStore = useUserStore();
const isAdmin = computed(() => {
  const roles = userStore.roles || [];
  return roles.includes('admin') || roles.includes('Admin') || roles.includes('ADMIN') || roles.includes('superadmin');
});
const isFinancialInstitution = computed(() => {
  const roles = userStore.roles || [];
  return roles.some((role) => role === 'financial_institution' || role === 'financial' || role?.toLowerCase().includes('financial'));
});

// 搜索表单数据
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  articleTitle: '',
  articleType: '',
  articleStatus: '',
  startTime: '',
  endTime: '',
  orderByColumn: 'createTime',
  isAsc: 'desc'
});

// 表格数据
const tableData = ref([]);
const total = ref(0);
const loading = ref(false);
const queryFormRef = ref();
const dateRange = ref(['', '']);
const showSearch = ref(true);
const selectedIds = ref([]); // 选中的行ID数组
const selectedRows = ref([]); // 选中的行数据数组

const dialog = ref({
  visible: false,
  type: '',
  id: null as string | number | null
});

/** 查询文章列表 */
const getList = async () => {
  loading.value = true;
  try {
    const params = { ...queryParams.value };
    Object.keys(params).forEach((key) => {
      const value = params[key as keyof typeof params];
      if (value === '' || value === undefined || value === null) {
        delete params[key as keyof typeof params];
      }
    });
    if (params.articleTitle) {
      params.articleTitle = params.articleTitle.trim();
    }
    const response = await getCreditArticleList(params);
    if (response && response.code === 200) {
      tableData.value = response.rows || response.data || [];
      total.value = response.total || 0;
    } else {
      ElMessage.error(response?.msg || '获取文章列表失败');
    }
  } catch (error) {
    console.error('获取文章列表失败:', error);
    ElMessage.error('获取文章列表失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

/** 查询按钮事件 */
const applyDateRange = () => {
  const [start, end] = dateRange.value || [];
  queryParams.value.startTime = start ? `${start}` : '';
  queryParams.value.endTime = end ? `${end}` : '';
};

const handleQuery = () => {
  queryParams.value.pageNum = 1;
  applyDateRange();
  getList();
};

/** 搜索按钮事件 */
const handleSearch = () => {
  applyDateRange();
  handleQuery();
};

const handleDateRangeChange = (value: string[] | null) => {
  if (!value || value.length === 0) {
    dateRange.value = ['', ''];
    queryParams.value.startTime = '';
    queryParams.value.endTime = '';
  }
};

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  dateRange.value = ['', ''];
  queryParams.value.startTime = '';
  queryParams.value.endTime = '';
  handleQuery();
};

const handlePageChange = (page: number) => {
  queryParams.value.pageNum = page;
  getList();
};

const handlePageSizeChange = (size: number) => {
  queryParams.value.pageSize = size;
  queryParams.value.pageNum = 1;
  getList();
};

// 表格选择变化事件
const handleSelectionChange = (selection: any[]) => {
  selectedIds.value = selection.map((item) => item.id);
  selectedRows.value = selection;
};

const matchStatus = (status: string | number | undefined | null, candidates: string[]) => {
  const value = String(status ?? '').trim();
  if (!value) return false;
  const lowerValue = value.toLowerCase();
  return candidates.some((item) => {
    const target = String(item ?? '').trim();
    if (!target) return false;
    return value === target || lowerValue === target.toLowerCase();
  });
};

// 状态判断函数
const isOfflineStatus = (status: string | number | undefined | null) => matchStatus(status, ['3', '下架', 'disabled', 'offline']);
const isPendingStatus = (status: string | number | undefined | null) => matchStatus(status, ['1', '5', '待上架', 'pending', 'waiting']);

// 权限判断函数
const canPublish = (row: any) => {
  const status = row.articleStatus;
  const canStatusPublish = isPendingStatus(status) || isOfflineStatus(status) || matchStatus(status, ['draft']);
  if (!canStatusPublish) return false;
  if (isFinancialInstitution.value) return false;
  return isAdmin.value;
};

const canOffline = (row: any) => {
  const status = row.articleStatus;
  // 只有已上架状态才能下架，待上架（'1'）不应显示下架按钮
  return status === '2' || status === 'enabled';
};

const canEdit = (row: any) => {
  const status = row.articleStatus;
  return isOfflineStatus(status) || isPendingStatus(status);
};

const canDelete = (row: any) => {
  const status = row.articleStatus;
  return status !== '2' && status !== 'enabled';
};

// 获取状态标签
const getStatusLabel = (status: string | number) => {
  const value = String(status ?? '');
  const list = art_article_status.value || [];
  const target = list.find((item: any) => String(item.value) === value);
  return target?.label || '--';
};

const getStatusType = (status: string | number) => {
  const value = String(status ?? '');
  // 根据业务逻辑：1-待上架, 2-已上架, 3-已下架
  // 已上架用success（绿色），已下架用danger（红色），待上架用warning（橙色）
  if (value === '2') return 'success'; // 已上架
  if (value === '3') return 'danger'; // 已下架
  if (value === '1') return 'warning'; // 待上架
  return 'info';
};

const getDialogTitle = () => {
  const map: Record<string, string> = {
    'add': '新增',
    'edit': '编辑',
    'view': '查看'
  };
  return map[dialog.value.type] || '';
};

const openDialog = (type: 'add' | 'edit' | 'view', id?: string | number) => {
  dialog.value = { visible: true, type, id: id ?? null };
};

/** 新增按钮 */
const handleAdd = () => {
  openDialog('add');
};

/** 详情按钮 */
const handleDetails = (row: any) => {
  openDialog('view', row.id);
};

/** 修改按钮 */
const handleEdit = (row: any) => {
  openDialog('edit', row.id);
};

const onDialogSuccess = () => {
  dialog.value.visible = false;
  getList();
};

/** 状态变更（上架/下架） */
const normalizeStatus = (value: string | number | undefined | null) => String(value ?? '');

const buildFullArticleFields = async (row: any) => {
  if (!row?.id) {
    return { ...row };
  }
  try {
    const res = await getCreditArticleDetail(row.id);
    if (res && res.code === 200 && res.data) {
      return { ...res.data, ...row };
    }
  } catch (error) {
    console.warn('获取文章详情失败，使用列表数据作为上架参数', error);
  }
  return { ...row };
};

const confirmStatusChange = async (row: any, status: string | number) => {
  const targetStatus = normalizeStatus(status);
  const statusText = targetStatus === '2' ? '上架' : '下架';
  const updateData: any = {
    id: row.id,
    articleStatus: targetStatus
  };
  if (targetStatus === '3') {
    const fullData = await buildFullArticleFields(row);
    Object.assign(updateData, {
      articleSummary: fullData.articleSummary ?? '',
      articleNo: fullData.articleNo ?? '',
      articleSource: fullData.articleSource ?? '',
      articleTitle: fullData.articleTitle ?? '',
      articleType: fullData.articleType ?? '',
      articleContent: fullData.articleContent ?? ''
    });
  }
  if (targetStatus === '2') {
    const fullData = await buildFullArticleFields(row);
    Object.assign(updateData, {
      articleSummary: fullData.articleSummary ?? '',
      articleNo: fullData.articleNo ?? '',
      articleSource: fullData.articleSource ?? '',
      articleTitle: fullData.articleTitle ?? '',
      articleType: fullData.articleType ?? '',
      articleContent: fullData.articleContent ?? '',
      publishTime: new Date().toISOString()
    });
  }
  const response = await updateCreditArticle(updateData);
  if (response && response.code === 200) {
    ElMessage.success(`${statusText}成功`);
    return true;
  } else {
    ElMessage.error(response?.msg || `${statusText}失败`);
    return false;
  }
};

/** 状态变更（上架/下架） */
const handlePublish = async (row: any) => {
  ElMessageBox.confirm(`确认要上架「${row.articleTitle || ''}」吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        const success = await confirmStatusChange(row, '2');
        if (success) {
          getList();
        }
      } catch (error) {
        ElMessage.error('上架失败，请稍后重试');
      }
    })
    .catch(() => {});
};

const handleOffline = async (row: any) => {
  ElMessageBox.confirm(`确认要下架「${row.articleTitle || ''}」吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        const success = await confirmStatusChange(row, '3');
        if (success) {
          getList();
        }
      } catch (error) {
        ElMessage.error('下架失败，请稍后重试');
      }
    })
    .catch(() => {});
};

/** 删除按钮 */
const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确认要删除「${row.articleTitle || ''}」吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        const response = await deleteCreditArticle({ ids: [row.id] });
        if (response && response.code === 200) {
          ElMessage.success('删除成功');
          getList();
        } else {
          ElMessage.error(response?.msg || '删除失败');
        }
      } catch (error) {
        ElMessage.error('删除失败，请稍后重试');
      }
    })
    .catch(() => {});
};

// 页面加载时获取列表数据
onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
.content-management {
  padding: 24px;
  min-height: calc(100vh - 120px);
  box-sizing: border-box;

  :deep(.el-form--inline) {
    .el-form-item {
      margin-bottom: 18px;
      margin-right: 16px;
    }
  }
}

.operation-bar {
  margin-bottom: 16px;

  .el-col {
    display: flex;
    justify-content: flex-start;
  }

  .el-button {
    width: auto;
    min-width: 80px;
  }
}

.add-btn {
  width: 80px !important;
  min-width: 80px !important;
  max-width: 80px !important;
  height: 32px !important;
  line-height: 32px;
  padding: 0 !important;
  box-sizing: border-box;
}

.pagination {
  margin-top: 24px;
  justify-content: end;
}

.flex-center {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.operation-btns {
  gap: 8px;

  :deep(.el-button) {
    font-size: 14px;
  }
}

.status-with-dot {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-dot-success {
  background-color: #108c58;
}

.status-dot-warning {
  background-color: #ff7b00;
}

.status-dot-danger {
  background-color: #f23255;
}

.status-dot-info {
  background-color: #909399;
}

.status-text {
  font-size: 14px;
}

.status-text-success {
  color: #108c58;
}

.status-text-warning {
  color: #ff7b00;
}

.status-text-danger {
  color: #f23255;
}

.status-text-info {
  color: #909399;
}
</style>
