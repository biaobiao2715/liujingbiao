<!-- 
标题：    index.vue
功能：    知识库案件管理列表
说明：    与举报通道管理同级的案件管理入口
当前版本：1.0
开发信息：Created by Cursor AI 2025-11-19
修改人信息：
修改内容：
-->
<template>
  <div class="knowledge-case-page" v-loading="loading">
    <!-- 搜索条件 -->
    <el-form
      ref="queryFormRef"
      :model="queryParams"
      inline
      label-position="left"
    >
      <el-form-item label="知识库案件名称" prop="knowledgeCaseName" label-width="auto" v-hasPermi="['safeguard:knowledgeCaseContent:groupName']">
        <el-select
          v-model="queryParams.knowledgeCaseName"
          placeholder="请选择"
          clearable
          filterable
        >
          <el-option v-for="item in caseNameOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间" prop="createTime" label-width="auto">
        <el-date-picker
          v-model="queryParams.createTime"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="选择日期"
          clearable
        />
      </el-form-item>
      <el-form-item label="创建人" prop="createBy" label-width="auto">
        <el-input
          v-model="queryParams.createBy"
          placeholder="请输入创建人姓名"
          clearable
          @keyup.enter="handleSearch"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch" v-hasPermi="['safeguard:knowledgeCaseContent:query']">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作栏 -->
    <el-row :gutter="12" class="operation-bar">
      <el-col :span="1.5">
        <el-button
          v-throttle
          type="primary"
          icon="Plus"
          class="add-btn"
          @click="handleCreate"
          v-hasPermi="['safeguard:knowledgeCaseContent:add']"
        >
          新增
        </el-button>
        <el-button
          v-throttle
          :class="[
            'kc-action-btn',
            'kc-action-btn--danger',
            { 'is-active': selectionRows.length > 0 }
          ]"
          :disabled="!selectionRows.length"
          @click="handleBatchDelete"
          v-hasPermi="['safeguard:knowledgeCaseContent:remove']"
        >
          删除
        </el-button>
      </el-col>
    </el-row>

    <!-- 表格 -->
    <el-table
      :data="tableData"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column label="序号" width="80" align="center">
        <template #default="scope">
          {{ (queryParams.pageNum - 1) * queryParams.pageSize + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column prop="knowledgeCaseName" label="知识库案件名称" min-width="200" show-overflow-tooltip />
      <el-table-column prop="createTime" label="创建时间" min-width="180" show-overflow-tooltip />
      <el-table-column prop="createBy" label="创建人" min-width="120" show-overflow-tooltip />
      <el-table-column label="操作" width="200" align="left">
        <template #default="scope">
          <div style="display: flex; justify-content: flex-start; align-items: center">
            <el-button
              type="text"
              style="font-size: 14px; color: #108c58"
              @click="handleEdit(scope.row)"
              v-hasPermi="['safeguard:knowledgeCaseContent:edit']"
            >
              编辑
            </el-button>
            <el-button
              type="text"
              style="font-size: 14px; color: #108c58"
              @click="handleView(scope.row)"
              v-hasPermi="['safeguard:knowledgeCaseContent:query']"
            >
              查看
            </el-button>
            <el-button
              type="text"
              style="font-size: 14px; color: #108c58"
              @click="handleSingleDelete(scope.row)"
              v-hasPermi="['safeguard:knowledgeCaseContent:remove']"
            >
              删除
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        :current-page="queryParams.pageNum"
        :page-size="queryParams.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 案件详情弹窗（新增/编辑） -->
    <CaseDetailDialog
      :visible="dialogVisible"
      :mode="dialogMode"
      :detail="currentRow"
      @update:visible="dialogVisible = $event"
      @confirm="handleDialogConfirm"
      @close="handleDialogClose"
    />

    <!-- 案件查看弹窗 -->
    <CaseViewDialog
      :visible="viewDialogVisible"
      :detail="currentRow"
      @update:visible="viewDialogVisible = $event"
      @close="handleViewDialogClose"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import type { FormInstance } from 'element-plus';
import { ElMessage, ElMessageBox } from 'element-plus';
import { pickBy } from 'lodash';
import { fetchKnowledgeCaseList, fetchKnowledgeCaseNames, deleteKnowledgeCase } from '@/api/rightsPlatform/knowledgeCaseManage/index';
import CaseDetailDialog from './CaseDetailDialog.vue';
import CaseViewDialog from './CaseViewDialog.vue';

interface KnowledgeCaseItem {
  id?: string | number;
  knowledgeCaseName?: string;
  createTime?: string;
  createBy?: string;
}

const queryFormRef = ref<FormInstance>();
const loading = ref(false);
const tableData = ref<KnowledgeCaseItem[]>([]);
const total = ref(0);
const selectionRows = ref<KnowledgeCaseItem[]>([]);
const caseNameOptions = ref<{ label: string; value: string }[]>([]);

// 弹窗相关
const dialogVisible = ref(false);
const dialogMode = ref<'view' | 'edit' | 'add'>('add');
const currentRow = ref<KnowledgeCaseItem | null>(null);

// 查看弹窗相关
const viewDialogVisible = ref(false);

const queryParams = reactive({
  knowledgeCaseName: '',
  createTime: '',
  createBy: '',
  pageNum: 1,
  pageSize: 10
});

const handleSearch = () => {
  queryParams.pageNum = 1;
  fetchTableData();
};

const handleReset = () => {
  queryFormRef.value?.resetFields();
  queryParams.knowledgeCaseName = '';
  queryParams.createTime = '';
  queryParams.createBy = '';
  queryParams.pageNum = 1;
  queryParams.pageSize = 10;
  fetchTableData();
};

const handleSizeChange = (size: number) => {
  queryParams.pageSize = size;
  queryParams.pageNum = 1;
  fetchTableData();
};

const handlePageChange = (page: number) => {
  queryParams.pageNum = page;
  fetchTableData();
};

const handleCreate = () => {
  dialogMode.value = 'add';
  currentRow.value = null;
  dialogVisible.value = true;
};

const handleEdit = (row: KnowledgeCaseItem) => {
  dialogMode.value = 'edit';
  currentRow.value = row;
  dialogVisible.value = true;
};

const handleView = (row: KnowledgeCaseItem) => {
  currentRow.value = row;
  viewDialogVisible.value = true;
};

const handleSingleDelete = async (row: KnowledgeCaseItem) => {
  if (!row.id) {
    ElMessage.warning('该案件数据异常，无法删除');
    return;
  }

  try {
    await ElMessageBox.confirm('确定要删除该案件吗？', '系统提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    loading.value = true;
    const response: any = await deleteKnowledgeCase(row.id);
    if (response && response.code === 200) {
      ElMessage.success('删除成功');
      fetchTableData();
    } else {
      ElMessage.error(response?.msg || '删除失败，请稍后重试');
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败，请稍后重试');
    }
  } finally {
    loading.value = false;
  }
};

const handleBatchDelete = async () => {
  if (!selectionRows.value.length) {
    ElMessage.warning('请先选择要删除的案件');
    return;
  }

  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectionRows.value.length} 个案件吗？`, '系统提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    loading.value = true;
    const ids = selectionRows.value.map((row) => row.id).filter((id) => id !== undefined && id !== null);
    if (ids.length === 0) {
      ElMessage.warning('选中的案件数据异常，无法删除');
      return;
    }

    const response: any = await deleteKnowledgeCase(ids);
    if (response && response.code === 200) {
      ElMessage.success('批量删除成功');
      selectionRows.value = [];
      fetchTableData();
    } else {
      ElMessage.error(response?.msg || '批量删除失败，请稍后重试');
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败，请稍后重试');
    }
  } finally {
    loading.value = false;
  }
};

const handleDialogConfirm = () => {
  fetchTableData();
};

const handleDialogClose = () => {
  dialogVisible.value = false;
  currentRow.value = null;
};

const handleViewDialogClose = () => {
  viewDialogVisible.value = false;
  currentRow.value = null;
};

const handleSelectionChange = (rows: KnowledgeCaseItem[]) => {
  selectionRows.value = rows;
};

const fetchCaseNameOptions = async () => {
  try {
    const res = await fetchKnowledgeCaseNames();
    const list = res?.data ?? res ?? [];
    caseNameOptions.value = (list || []).map((item: any) => {
      if (typeof item === 'string') {
        return { label: item, value: item };
      }
      const name = item?.knowledgeCaseName || item?.groupName || item?.label || item?.name || '';
      return {
        label: name,
        value: item?.knowledgeCaseName || item?.value || name
      };
    });
  } catch (error: any) {
    ElMessage.error(error?.message || '获取案件名称失败');
  }
};

const fetchTableData = async () => {
  loading.value = true;
  try {
    const params: Record<string, any> = pickBy(
      {
        ...queryParams
      },
      (value) => value !== '' && value !== null && value !== undefined
    );
    if (params.createTime) {
      const createDate = params.createTime;
      params.params = {
        ...(params.params || {}),
        beginCreateTime: `${createDate} 00:00:00`,
        endCreateTime: `${createDate} 23:59:59`
      };
      delete params.createTime;
    }
    const res = await fetchKnowledgeCaseList(params);
    tableData.value = res?.rows || res?.data?.records || res?.data || [];
    total.value = res?.total ?? res?.data?.total ?? 0;
  } catch (error: any) {
    ElMessage.error(error?.message || '查询失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchCaseNameOptions();
  fetchTableData();
});
</script>

<style scoped lang="scss">
.knowledge-case-page {
  padding: 24px;
  height: calc(100vh - 120px);
  box-sizing: border-box;
}

.operation-bar {
  margin-bottom: 16px;

  .el-col {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
  }

  .table-tips {
    color: #909399;
    font-size: 13px;
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

.kc-action-btn {
  width: auto;
  min-width: 96px;
  height: 36px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  background-color: #f2f3f5;
  border-color: #f2f3f5;
  color: #666666;
  transition: all 0.2s ease;

  &:disabled {
    background-color: #f4f5f5;
    border-color: #e6e8eb;
    color: #c0c4cc;
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    background-color: #e6e8eb;
    border-color: #e6e8eb;
  }

  &--danger {
    color: #909399;

    &.is-active:not(:disabled) {
      background-color: #f23255;
      border-color: #f23255;
      color: #ffffff;

      &:hover {
        background-color: #d42040;
        border-color: #d42040;
      }
    }
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
  display: flex;
  justify-content: flex-end;
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

