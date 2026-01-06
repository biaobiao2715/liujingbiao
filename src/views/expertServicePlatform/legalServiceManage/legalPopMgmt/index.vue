<!--
  标题: 专家咨询服务平台 - 普法内容管理
  功能: 用于普法内容的管理，包括查询、添加、编辑、删除、启用禁用等操作
  说明: 该页面提供普法内容的搜索、分页展示功能，并支持新增、编辑、删除和启用禁用操作。
  当前版本: 1.0
  负责人： 门世超
  开发信息: Created by AI Assistant
-->
<template>
  <div class="content-management">
    <!-- 搜索条件 -->
    <el-form ref="queryFormRef" :model="queryParams" inline label-position="left">
      <el-form-item label="普法标题" prop="title" label-width="auto">
        <el-input v-model="queryParams.title" placeholder="请输入普法标题" clearable @keyup.enter="handleQuery" />
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
        />
      </el-form-item>
      <el-form-item label="普法类型" prop="contentType" label-width="auto">
        <el-select v-model="queryParams.contentType" placeholder="请选择" filterable clearable>
          <el-option v-for="dict in legal_popularize_type" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="contentStatus" label-width="auto">
        <el-select v-model="queryParams.contentStatus" placeholder="请选择" filterable clearable>
          <el-option v-for="dict in legal_popularize_status" :key="dict.value" :label="dict.label" :value="dict.value" />
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
        <el-button v-throttle v-hasPermi="['skill:lawContent:add']" type="primary" icon="Plus" class="add-btn" @click="handleAdd"> 新增 </el-button>
      </el-col>
    </el-row>

    <!-- 表格 -->
    <el-table :data="tableData" v-loading="loading">
      <el-table-column type="index" label="序号" width="55" align="center" />

      <el-table-column label="发布时间" align="center" prop="publishTime" min-width="160">
        <template #default="scope">
          <span>{{ scope.row.publishTime }}</span>
        </template>
      </el-table-column>

      <el-table-column label="普法类型" align="center" prop="contentType" width="120">
        <template #default="scope">
          <dict-tag :options="legal_popularize_type" :value="scope.row.contentType" />
        </template>
      </el-table-column>

      <el-table-column label="普法标题" align="center" prop="contentTitle" :show-overflow-tooltip="true" min-width="200">
        <template #default="scope">
          <span>{{ scope.row.contentTitle }}</span>
        </template>
      </el-table-column>

      <el-table-column label="浏览量" align="center" prop="viewCount" width="100">
        <template #default="scope">
          <span>{{ scope.row.viewCount != null ? scope.row.viewCount : 0 }}</span>
        </template>
      </el-table-column>

      <el-table-column label="下载量" align="center" prop="downloadCount" width="100">
        <template #default="scope">
          <span>{{ scope.row.downloadCount != null ? scope.row.downloadCount : 0 }}</span>
        </template>
      </el-table-column>

      <el-table-column label="状态" align="center" prop="status" width="100">
        <template #default="scope">
          <div class="status-with-dot">
            <span class="status-dot" :class="`status-dot-${getStatusType(scope.row.status)}`"></span>
            <span class="status-text" :class="`status-text-${getStatusType(scope.row.status)}`">
              {{ scope.row.status }}
            </span>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="操作" fixed="right" align="left" width="320" class-name="small-padding fixed-width">
        <template #default="scope">
          <div style="display: flex; justify-content: flex-start; align-items: center">
            <el-button v-throttle v-hasPermi="['skill:lawContent:query']" link style="font-size: 14px; color: #108c58" @click="handleView(scope.row)"
              >详情</el-button
            >
            <el-button v-throttle v-hasPermi="['skill:lawContent:edit']" link style="font-size: 14px; color: #108c58" @click="handleEdit(scope.row)"
              >编辑</el-button
            >
            <el-button
              v-throttle
              v-hasPermi="['skill:lawContent:edit']"
              v-if="scope.row.status === '启用'"
              link
              style="font-size: 14px; color: #108c58"
              @click="handleStatusChange(scope.row, '3')"
            >
              禁用
            </el-button>
            <el-button
              v-throttle
              v-hasPermi="['skill:lawContent:edit']"
              v-if="scope.row.status === '禁用'"
              link
              style="font-size: 14px; color: #108c58"
              @click="handleStatusChange(scope.row, '2')"
            >
              启用
            </el-button>
            <el-button
              v-throttle
              v-hasPermi="['skill:lawContent:remove']"
              v-if="scope.row.status === '禁用'"
              link
              style="font-size: 14px; color: #108c58"
              @click="handleDeleteSingle(scope.row)"
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

    <!-- 弹窗 -->
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
            :is="dialog.type === 'view' ? ContentDetailDialog : ContentEditDialog"
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
import { ref, onMounted, getCurrentInstance, toRefs, defineAsyncComponent, Suspense } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getContentList, editContent, deleteContent } from '@/api/expertServicePlatform/legalServiceManage/contentManage';

const ContentEditDialog = defineAsyncComponent(() => import('./ContentEditDialog.vue'));
const ContentDetailDialog = defineAsyncComponent(() => import('./ContentDetailDialog.vue'));

const { proxy } = getCurrentInstance() as any;
const { legal_popularize_type, legal_popularize_status } = toRefs<any>(proxy?.useDict('legal_popularize_type', 'legal_popularize_status'));

const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  contentType: '',
  contentSummary: '',
  contentStatus: '',
  startTime: '',
  endTime: '',
  orderByColumn: '',
  isAsc: '',
  title: ''
});

const tableData = ref([]);
const total = ref(0);
const loading = ref(false);
const queryFormRef = ref();
const dateRange = ref(['', '']);

const dialog = ref({
  visible: false,
  type: '',
  id: null as string | number | null
});

const getList = () => {
  loading.value = true;

  const [startTime, endTime] = dateRange.value || [];

  const params: any = {
    pageNum: queryParams.value.pageNum,
    pageSize: queryParams.value.pageSize,
    ...(queryParams.value.title ? { contentTitle: queryParams.value.title } : {}),
    ...(queryParams.value.contentType ? { contentType: queryParams.value.contentType } : {}),
    ...(queryParams.value.contentStatus ? { contentStatus: queryParams.value.contentStatus } : {}),
    ...(startTime && endTime ? { startTime, endTime } : {}),
    ...(queryParams.value.orderByColumn ? { orderByColumn: queryParams.value.orderByColumn } : {}),
    ...(queryParams.value.isAsc ? { isAsc: queryParams.value.isAsc } : {})
  };

  getContentList(params)
    .then((res: any) => {
      if (res && res.code === 200) {
        const processedData = (res.rows || []).map((item: any) => {
          let statusText = '未知';
          if (item.contentStatus === '2' || item.contentStatus === 2) {
            statusText = '启用';
          } else if (item.contentStatus === '3' || item.contentStatus === 3) {
            statusText = '禁用';
          }

          const viewCount = item.viewCount ?? item.view_count ?? 0;
          const downloadCount = item.downloadCount ?? item.download_count ?? 0;

          return {
            ...item,
            status: statusText,
            publishTime: item.publishTime || item.createTime || '-',
            viewCount: viewCount != null && viewCount !== '' ? Number(viewCount) : 0,
            downloadCount: downloadCount != null && downloadCount !== '' ? Number(downloadCount) : 0
          };
        });

        tableData.value = processedData;
        total.value = res.total || 0;
      } else {
        // ElMessage.error(res?.msg || '获取普法内容列表失败');
      }
      loading.value = false;
    })
    .catch(() => {
      // ElMessage.error('获取普法内容列表失败，请稍后重试');
      loading.value = false;
    });
};

const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

const resetQuery = () => {
  queryFormRef.value?.resetFields();
  dateRange.value = ['', ''];
  queryParams.value.title = '';
  queryParams.value.contentType = '';
  queryParams.value.contentStatus = '';
  queryParams.value.startTime = '';
  queryParams.value.endTime = '';
  queryParams.value.orderByColumn = '';
  queryParams.value.isAsc = '';
  queryParams.value.pageNum = 1;
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

const getDialogTitle = () => {
  const map: Record<string, string> = {
    'add': '新增普法内容',
    'edit': '编辑普法内容',
    'view': '查看普法内容'
  };
  return map[dialog.value.type] || '';
};

const openDialog = (type: 'add' | 'edit' | 'view', id?: string | number) => {
  dialog.value = { visible: true, type, id: id ?? null };
};

const handleAdd = () => {
  openDialog('add');
};

const handleEdit = (row: any) => {
  if (!row.id) {
    ElMessage.warning('数据ID缺失，无法编辑');
    return;
  }
  openDialog('edit', row.id);
};

const handleView = (row: any) => {
  openDialog('view', row.id);
};

const onDialogSuccess = () => {
  dialog.value.visible = false;
  getList();
};

const handleStatusChange = async (row: any, newStatus: string) => {
  const statusText = newStatus === '2' ? '启用' : '禁用';

  try {
    await ElMessageBox.confirm(`是否确认${statusText}？`, '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    });

    await editContent({
      contentTitle: 'single_operation',
      contentType: 'single',
      contentSummary: 'single_operation',
      ids: [Number(row.id)],
      contentStatus: newStatus
    });

    ElMessage.success(`${statusText}成功`);
    getList();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(`${statusText}失败，请稍后重试`);
    }
  }
};

const handleDeleteSingle = async (row: any) => {
  try {
    await ElMessageBox.confirm('是否确认删除？删除后将无法恢复！', '操作确认', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    });

    await deleteContent([Number(row.id)]);

    ElMessage.success('删除成功');
    getList();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败，请稍后重试');
    }
  }
};

const getStatusType = (status: string) => {
  if (status === '启用') return 'success';
  if (status === '禁用') return 'danger';
  return 'info';
};

onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
.content-management {
  padding: 24px;
  min-height: calc(100vh - 120px);
  box-sizing: border-box;
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
