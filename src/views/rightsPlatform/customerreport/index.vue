div<!--
标题：		index.vue
功能：		供应商/企业信客户举报页面
说明：
当前版本：	1.0
开发信息：	Created by 张峰 2025-11-18
修改人信息：	李政达 2025-11-18
修改内容：	供应商/企业信客户举报页面开发
 -->
<template>
  <div class="content-management">
    <!-- 搜索条件 -->
    <el-form ref="queryFormRef" :model="queryParams" inline>
      <!-- 举报编号 -->
      <el-form-item label="举报编号" prop="reportCode">
        <el-input v-model="queryParams.reportCode" placeholder="请输入举报编号" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <!-- 举报类型 -->
      <el-form-item label="举报类别" prop="reportTypeId">
        <el-select v-model="queryParams.reportTypeId" placeholder="请选择举报类型" filterable clearable>
          <el-option v-for="item in report_type_id" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <!-- 被举报方 -->
      <el-form-item label="被举报方" prop="reportPersonName">
        <el-input v-model="queryParams.reportPersonName" placeholder="请输入被举报方" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <!-- 举报商品 -->
      <el-form-item label="举报商品" prop="reportGoodsCode">
        <el-input v-model="queryParams.reportGoodsCode" placeholder="请输入举报商品" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <!-- 创建时间 -->
      <el-form-item label="创建时间" prop="publishTime" label-width="auto">
        <el-date-picker
          v-model="queryParams.publishTime"
          type="datetimerange"
          value-format="YYYY-MM-DD HH:mm:ss"
          format="YYYY-MM-DD HH:mm:ss"
          :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
          range-separator=" - "
          start-placeholder="开始时间"
          end-placeholder="结束时间"
        />
      </el-form-item>

      <!-- 所属状态下拉框 -->
      <el-form-item label="所属状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择所属状态" filterable clearable>
          <el-option v-for="item in report_status" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <!-- 查询和重置按钮 -->
      <el-form-item>
        <el-button v-throttle type="primary" @click="handleSearch">查询</el-button>
        <el-button v-throttle @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格展示 -->
    <el-table :data="tableData" v-loading="loading">
      <el-table-column type="index" width="100" label="序号" align="center" :show-overflow-tooltip="true" />
      <!-- 举报编号 -->
      <el-table-column label="举报编号" align="center" prop="reportCode" width="300" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.reportCode || '-' }}</span>
        </template>
      </el-table-column>
      <!-- 举报类别 -->
      <el-table-column label="举报类别" align="center" prop="reportTypeId" :show-overflow-tooltip="true">
        <template #default="scope">
          <dict-text :options="report_type_id" :value="scope.row.reportTypeId" />
        </template>
      </el-table-column>
      <!-- 被举报方 -->
      <el-table-column label="被举报方" align="center" prop="reportPersonName" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.reportPersonName || '-' }}</span>
        </template>
      </el-table-column>
      <!-- 举报商品 -->
      <el-table-column label="举报商品" align="center" prop="reportGoodsName" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.reportGoodsName || '-' }}</span>
        </template>
      </el-table-column>
      <!-- 创建时间 -->
      <el-table-column label="创建时间" align="center" prop="createTime" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.createTime || '-' }}</span>
        </template>
      </el-table-column>
      <!-- 所属状态 -->
      <el-table-column label="所属状态" align="center" prop="status" width="120" :show-overflow-tooltip="true">
        <template #default="scope">
          <div class="status-cell-wrapper">
            <span :class="['status-text', getStatusClass(scope.row.status)]">{{ getStatusName(scope.row.status) }}</span>
          </div>
        </template>
      </el-table-column>

      <!-- 操作 -->
      <el-table-column label="操作" fixed="right" width="180" class-name="flex-center">
        <template #default="scope">
          <div class="operation-buttons">
            <!-- 查看按钮 - 已结案和已撤回显示 -->
            <el-button
              v-if="scope.row.status === '3' || scope.row.status === '4' || scope.row.status === '0'"
              v-hasPermi="['safeguard:report:query']"
              style="font-size: 14px; color: #108c58"
              v-throttle
              type="primary"
              link
              size="small"
              @click="handleEdit(scope.row)"
              >查看</el-button
            >

            <!-- 申诉按钮 - 只在处理中和已驳回状态显示 -->
            <el-button
              v-if="scope.row.status === '1' || scope.row.status === '2'"
              style="font-size: 14px; color: #108c58"
              v-throttle
              type="success"
              size="small"
              link
              :disabled="
                Number(scope.row.rejectTimes) > 3 ||
                (scope.row.appealTime != null && scope.row.status === '1') ||
                (scope.row.caseCode == null && scope.row.status === '2')
              "
              @click="handleAppeal(scope.row)"
            >
              申诉
            </el-button>

            <!-- 撤回按钮 - 只在待处理和处理中状态显示 -->
            <!-- <el-button
              v-if="scope.row.status === '0' || scope.row.status === '1'"
              v-hasPermi="['safeguard:report:back']"
              v-throttle
              type="warning"
              size="small"
              @click="handleWithdraw(scope.row)"
            >
              撤回
            </el-button> -->
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <Pagination
        v-show="total > 0"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        v-model:total="total"
        @pagination="getList"
      />
    </div>
    <!-- 撤回 -->
    <el-dialog title="撤回举报" v-model="revokedialogVisible" width="30%">
      <el-input type="textarea" maxlength="200" show-word-limit :rows="2" placeholder="请输入撤回原因" v-model="revoke"> </el-input>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="revokedialogVisible = false">取 消</el-button>
          <el-button type="primary" :loading="revokeLoading" @click="revokeconfirm">确 定</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 弹窗：申诉/查看 -->
    <el-dialog
      v-if="dialog.visible"
      v-model="dialog.visible"
      :title="getDialogTitle()"
      width="50%"
      :destroy-on-close="false"
      :close-on-click-modal="false"
    >
      <Suspense>
        <template #default>
          <component
            :is="dialog.type === 'view' ? Detail : Appealmodal"
            :id="dialog.id"
            :type="dialog.type"
            :status="dialog.status"
            @success="onDialogSuccess"
            @cancel="onDialogClosees"
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
import { Document, Search, RefreshLeft } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';
import { pickBy } from 'lodash';
import { getreportlist, reportback } from '@/api/rightsPlatform/customerreport';
const { proxy } = getCurrentInstance() as any;
const { report_type_id, report_status } = toRefs<any>(proxy?.useDict('report_type_id', 'report_status'));
// // 弹窗组件异步加载（首字母大写）
const Appealmodal = defineAsyncComponent(() => import('./appealmodal.vue'));
const Detail = defineAsyncComponent(() => import('./Detail.vue'));
// 搜索表单数据
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  reportCode: '', //举报编号
  reportTypeId: '', // 举报类型
  reportPersonName: '', // 被举报方
  reportGoodsCode: '', //举报商品
  publishTime: [] as string[] | [],
  status: '' //所属状态
});

// 弹窗控制
const dialog = ref({
  visible: false,
  type: '', // 'appeal'| 'view'
  id: null as string | number | null,
  status: '' // 0:待处理、1处理中、2已驳回、3已结案、4已撤回
});
const tableData = ref([]);
// 日期范围
const dateRange = ref(['', '']);
// 表单引用
const queryFormRef = ref();
/* 表格loading */
const loading = ref(false);
/* 表格分页总数 */
const total = ref(0);
/* 撤回弹窗 */
const revokedialogVisible = ref(false);
/* 撤回原因 */
const revoke = ref();
/* 撤回loading */
const revokeLoading = ref(false);
/** 查询按钮事件 */
const handleSearch = () => {
  queryParams.value.pageNum = 1;
  getList();
};
// // 处理日期选择事件
const handleSelectDate = (val: string[]) => {
  queryParams.value.startTime = val?.[0] || '';
  queryParams.value.endTime = val?.[1] || '';
};
/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** 重置按钮操作 */
const handleReset = () => {
  queryFormRef.value?.resetFields();
  dateRange.value = ['', ''];
  queryParams.value = {
    pageNum: 1,
    pageSize: 10,
    reportCode: '', //举报编号
    reportTypeId: '', // 举报类型
    reportPersonName: '', // 被举报方
    reportGoodsCode: '', //举报商品
    publishTime: [] as string[] | [],

    status: '' //所属状态
  };
  handleQuery();
};
const revokerow = ref(); //撤回的row
/* 撤回 */
const handleWithdraw = (row) => {
  revoke.value = '';
  revokerow.value = row;
  revokedialogVisible.value = true;
};
/* 撤回提交 */
const revokeconfirm = async () => {
  revokeLoading.value = true;
  if (!revoke.value) {
    revokeLoading.value = false;
    return ElMessage.warning('请输入撤回原因');
  }
  try {
    const params = {
      id: revokerow.value.id,
      withdrawCause: revoke.value
    };
    await reportback(params);
    revokedialogVisible.value = false;
    getList(); //更新表格
  } catch (error) {
    ElMessage.error(error);
  } finally {
    revokeLoading.value = false;
  }
};
/* 列表查询 */
const getList = async () => {
  loading.value = true;
  try {
    console.log('queryParams.value-------', queryParams.value);

    const res = await getreportlist({
      ...queryParams.value,
      publishTime: undefined,
      startTime: queryParams.value.publishTime?.[0],
      endTime: queryParams.value.publishTime?.[1]
    });
    console.log('res-------', res);
    tableData.value = res.rows || [];
    total.value = res.total || 0;
  } catch (error) {
    ElMessage.error(error);
  } finally {
    loading.value = false;
  }
};
const statusOptions = [
  { value: '0', label: '待处理' },
  { value: '1', label: '处理中' },
  { value: '2', label: '已驳回' },
  { value: '3', label: '已结案' },
  { value: '4', label: '已撤回' }
];
const getStatusClass = (status: string | undefined | null) => {
  const statusMap: Record<string, string> = {
    '0': 'status-pending', // 待处理
    '1': 'status-processing', // 处理中
    '2': 'status-rejected', // 已驳回
    '3': 'status-closed', // 已结案
    '4': 'status-withdrawn' // 已撤回
  };
  return statusMap[String(status)] || 'status-default';
};
const getStatusName = (status: string | undefined | null) => {
  if (status === undefined || status === null || status === '') return '-';
  const option = statusOptions.find((item) => item.value === String(status));
  return option?.label || '-';
};
/** 打开弹窗 */
const openDialog = (type: 'appeal' | 'view', status, id?: string | number) => {
  dialog.value = { visible: true, type, status, id: id ?? null };
};
/* 申诉 */
const handleAppeal = (row) => {
  console.log('row', row);
  openDialog('appeal', row.status, row.id);
};
/* 查看 */
const handleEdit = (row) => {
  console.log('row', row);
  openDialog('view', row.status, row.id);
};
/** 弹窗标题 */
const getDialogTitle = () => {
  const map: Record<string, string> = {
    'appeal': '举报申诉',
    'view': '查看举报'
  };
  return map[dialog.value.type] || '';
};
/** 弹窗成功回调 */
const onDialogSuccess = () => {
  dialog.value.visible = false;
  getList();
};
const onDialogClosees = () => {
  dialog.value.visible = false;
};
// 页面加载时获取列表数据
onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
.content-management {
  padding: 24px;
  //   background-color: #f5f5f5;
  min-height: calc(100vh - 120px);
}

// 主要内容区域 - 大盒子
.main-content-box {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 24px;
  margin-bottom: 24px;

  // 搜索表单样式
  .el-form {
    margin-bottom: 20px;

    .el-form-item {
      margin-bottom: 16px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  // 操作按钮区域样式
  .mb8 {
    margin-bottom: 16px;
  }

  // 表格样式
  .el-table {
    margin-bottom: 20px;

    :deep(.el-table__header) {
      background-color: #fafafa;

      th {
        background-color: #fafafa !important;
        color: #606266;
        font-weight: 600;
      }
    }

    :deep(.el-table__body) {
      tr {
        &:hover {
          background-color: #f5f7fa;
        }
      }
    }
  }

  // 分页样式
  .pagination {
    margin-top: 20px;
    justify-content: end;
  }
}

// 链接样式
.link-type {
  color: #409eff;
  text-decoration: none;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
    color: #66b1ff;
  }
}

// 按钮样式优化
.el-button {
  border-radius: 4px;
  font-weight: 500;

  &.el-button--small {
    padding: 5px 12px;
    font-size: 12px;
  }
}

// 标签样式
.el-tag {
  border-radius: 4px;
  font-weight: 500;

  &.el-tag--success {
    background-color: #f0f9ff;
    border-color: #67c23a;
    color: #67c23a;
  }

  &.el-tag--danger {
    background-color: #fef0f0;
    border-color: #f56c6c;
    color: #f56c6c;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .content-management {
    padding: 16px;
  }

  .main-content-box {
    padding: 16px;
  }
}

// 加载状态样式
.el-loading-mask {
  border-radius: 8px;
}

// 表格列宽优化
.el-table-column {
  .cell {
    padding: 8px 12px;
  }
}
.status-cell-wrapper {
  position: relative;
  display: inline-block;
  width: 100%;
}

/* 所属状态样式 */
.status-text {
  position: relative;
  padding-left: 16px;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }
}
.status-pending {
  color: #909399;

  &::before {
    background-color: #909399;
  }
}
.status-processing {
  color: #e6a23c;

  &::before {
    background-color: #e6a23c;
  }
}
.status-rejected {
  color: #f56c6c;

  &::before {
    background-color: #f56c6c;
  }
}
.status-closed {
  color: #108c58;

  &::before {
    background-color: #108c58;
  }
}
.status-withdrawn {
  color: #909399;

  &::before {
    background-color: #909399;
  }
}
.status-default {
  color: #909399;

  &::before {
    background-color: #909399;
  }
}

.status-icon {
  position: absolute;
  top: 0;
  right: -10px;
  font-size: 24px;
  color: #409eff;
  z-index: 10;
  background: #fff;
  border-radius: 50%;
  padding: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
// 操作按钮组样式
.operation-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex-wrap: nowrap;
  white-space: nowrap;

  .el-button {
    margin: 0;
    padding: 4px 8px;
    font-size: 12px;
    min-width: auto;
    flex-shrink: 0;
  }
}

// 表格操作列样式
:deep(.el-table__body-wrapper) {
  .operation-buttons {
    .el-button + .el-button {
      margin-left: 0;
    }
  }
}
</style>
