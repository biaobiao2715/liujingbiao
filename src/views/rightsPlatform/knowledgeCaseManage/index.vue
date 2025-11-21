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
    <div class="filter-card">
      <el-form ref="queryFormRef" :model="queryParams" inline label-width="120px">
        <el-form-item label="知识库案件名称" prop="knowledgeCaseName" v-hasPermi="['safeguard:knowledgeCaseContent:groupName']">
          <el-select
            v-model="queryParams.knowledgeCaseName"
            placeholder="请选择"
            clearable
            filterable
            style="width: 220px"
          >
            <el-option v-for="item in caseNameOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间" prop="createTime">
          <el-date-picker
            v-model="queryParams.createTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="选择日期"
            style="width: 220px"
            clearable
          />
        </el-form-item>
        <el-form-item label="创建人" prop="createBy">
          <el-input
            v-model="queryParams.createBy"
            placeholder="请输入创建人姓名"
            clearable
            style="width: 220px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item class="filter-actions">
          <el-button type="primary" @click="handleSearch" v-hasPermi="['safeguard:knowledgeCaseContent:query']">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="table-card">
      <div class="table-toolbar">
        <div class="toolbar-left">
          <el-button type="primary" @click="handleCreate" v-hasPermi="['safeguard:knowledgeCaseContent:add']">新增</el-button>
          <el-button type="danger" plain @click="handleBatchDelete" v-hasPermi="['safeguard:knowledgeCaseContent:remove']">删除</el-button>
        </div>
        <div class="toolbar-right">
          <span class="table-tips">共查询到 {{ total }} 条数据</span>
        </div>
      </div>

      <el-table
        :data="tableData"
        border
        style="width: 100%"
        @selection-change="handleSelectionChange"
        :header-cell-style="{ background: '#fafafa', color: '#606266' }"
      >
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column label="序号" width="80" align="center">
          <template #default="scope">
            {{ (queryParams.pageNum - 1) * queryParams.pageSize + scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column prop="knowledgeCaseName" label="知识库案件名称" min-width="200" align="center" show-overflow-tooltip />
        <el-table-column prop="createTime" label="创建时间" min-width="180" align="center" show-overflow-tooltip />
        <el-table-column prop="createBy" label="创建人" min-width="120" align="center" show-overflow-tooltip />
        <el-table-column label="操作" width="200" align="center">
          <template #default="scope">
            <el-button type="primary" link @click="handleEdit(scope.row)" v-hasPermi="['safeguard:knowledgeCaseContent:edit']">编辑</el-button>
            <el-button type="primary" link @click="handleView(scope.row)" v-hasPermi="['safeguard:knowledgeCaseContent:query']">查看</el-button>
            <el-button type="danger" link @click="handleSingleDelete(scope.row)" v-hasPermi="['safeguard:knowledgeCaseContent:remove']">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
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
    const params = pickBy(
      {
        ...queryParams
      },
      (value) => value !== '' && value !== null && value !== undefined
    );
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
  background: #f5f6f8;
  min-height: calc(100vh - 120px);
}

.filter-card,
.table-card {
  background: #fff;
  border-radius: 8px;
  padding: 16px 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.filter-card {
  margin-bottom: 16px;

  .filter-actions {
    margin-left: 16px;
  }
}

.table-card {
  .table-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .table-tips {
      color: #909399;
      font-size: 13px;
    }
  }

  .pagination-wrapper {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>

