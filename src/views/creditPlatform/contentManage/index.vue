<!--
  标题: creditPlatform/contentManage/index.vue
  功能: 金融内容管理
  说明: 用于金融文章的管理，包括查询、新增、编辑、删除、上架下架等操作
  当前版本: 1.0
-->
<template>
  <div class="content-management">
    <!-- 搜索条件 -->
    <el-form v-show="showSearch" ref="queryFormRef" :model="queryParams" inline label-position="left">
      <el-form-item label="文章名称" prop="articleTitle" label-width="auto">
        <el-input v-model="queryParams.articleTitle" placeholder="请输入文章名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="发布时间" prop="publishTime" label-width="auto">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          value-format="YYYY-MM-DD"
          range-separator=" - "
          start-placeholder="开始日期"
          end-placeholder="结束日期"
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
        <el-button v-throttle v-hasPermi="['credit:creditArticle:add']" type="primary" icon="Plus" @click="handleAdd"> 新增 </el-button>
      </el-col>
    </el-row>

    <!-- 表格 -->
    <el-table :data="tableData" border v-loading="loading" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" />
      <el-table-column type="index" label="序号" width="55" align="center" />
      <el-table-column label="文章名称" prop="articleTitle" min-width="150" :show-overflow-tooltip="true" />
      <el-table-column label="文章简介" prop="articleSummary" min-width="200" :show-overflow-tooltip="true" />
      <el-table-column label="状态" prop="articleStatus" width="100">
        <template #default="scope">
          <dict-tag :options="art_article_status" :value="scope.row.articleStatus" />
        </template>
      </el-table-column>
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
      <el-table-column label="操作" fixed="right" width="320" class-name="small-padding fixed-width">
        <template #default="scope">
          <div class="flex-center operation-btns">
            <el-button v-throttle v-hasPermi="['credit:creditArticle:query']" type="primary" link @click="handleDetails(scope.row)">详情</el-button>
            <el-button v-throttle v-hasPermi="['credit:creditArticle:edit']" type="primary" link @click="handleEdit(scope.row)">编辑</el-button>
            <el-button
              v-throttle
              v-hasPermi="['credit:creditArticle:edit']"
              v-if="canOffline(scope.row)"
              type="primary"
              link
              @click="handleStatusChange(scope.row, '3')"
            >
              下架
            </el-button>
            <el-button
              v-throttle
              v-hasPermi="['credit:creditArticle:edit']"
              v-if="canPublish(scope.row)"
              type="primary"
              link
              @click="handleStatusChange(scope.row, '2')"
            >
              上架
            </el-button>
            <el-button
              v-throttle
              v-hasPermi="['credit:creditArticle:remove']"
              v-if="canDelete(scope.row)"
              type="primary"
              link
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
import { ref, getCurrentInstance, onMounted, toRefs, defineAsyncComponent, Suspense } from 'vue';
import type { ComponentInternalInstance } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getCreditArticleList, updateCreditArticle, deleteCreditArticle, getCreditArticleDetail } from '@/api/creditPlatform/contentManage';

const ContentFormDialog = defineAsyncComponent(() => import('./ContentFormDialog.vue'));
const ContentDetailDialog = defineAsyncComponent(() => import('./ContentDetailDialog.vue'));

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
// 使用字典数据
const { art_article_status, art_article_type } = toRefs<any>(proxy?.useDict('art_article_status', 'art_article_type'));

// 搜索表单数据
const queryParams = ref({
  pageNum: 1,
  pageSize: 20,
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
    const response = await getCreditArticleList(queryParams.value);
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
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  queryParams.value.startTime = dateRange.value[0] || '';
  queryParams.value.endTime = dateRange.value[1] || '';
  getList();
};

/** 搜索按钮事件 */
const handleSearch = () => {
  queryParams.value.startTime = dateRange.value[0] || '';
  queryParams.value.endTime = dateRange.value[1] || '';
  handleQuery();
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

const getStatusCode = (row: any) => String(row?.articleStatus ?? '');
const canPublish = (row: any) => ['1', '3'].includes(getStatusCode(row));
const canOffline = (row: any) => getStatusCode(row) === '2';
const canDelete = (row: any) => getStatusCode(row) === '3';

const getDialogTitle = () => {
  const map: Record<string, string> = {
    'add': '新增金融内容',
    'edit': '编辑金融内容',
    'view': '查看金融内容'
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
const handleStatusChange = async (row: any, status: string) => {
  const statusText = status === '2' ? '上架' : '下架';
  try {
    const message = `确定要${statusText}文章「${row.articleTitle || ''}」吗？`;
    await proxy?.$modal
      .confirm(message)
      .then(async () => {
        const success = await confirmStatusChange(row, status);
        if (success) {
          getList();
        }
      })
      .catch(() => {});
  } catch (error) {
    console.error(`${statusText}失败:`, error);
  }
};

/** 删除按钮 */
const handleDelete = (row: any) => {
  console.log('删除的行数据:', row);
  console.log('传递的ID:', row.id, '类型:', typeof row.id);
  ElMessageBox.confirm(`确定要删除文章"${row.articleTitle}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        console.log('删除请求参数:', { ids: [row.id] });
        const response = await deleteCreditArticle({ ids: [row.id] });
        if (response && response.code === 200) {
          ElMessage.success('删除成功');
          getList();
        } else {
          ElMessage.error(response?.msg || '删除失败');
        }
      } catch (error) {
        console.error('删除失败:', error);
        ElMessage.error('删除失败，请重试');
      }
    })
    .catch(() => {
      ElMessage.info('删除操作已取消');
    });
};

// 页面加载时获取列表数据
onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
.content-management {
  padding: 24px;
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

:deep(.el-table) {
  .el-table__header {
    background-color: #fafafa;
    
    th {
      background-color: #fafafa !important;
      color: #606266;
      font-weight: 600;
    }
  }
  
  .el-table__body {
    tr {
      &:hover {
        background-color: #f5f7fa;
      }
    }
  }
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
</style>
