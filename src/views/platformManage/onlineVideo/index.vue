<!-- 
标题：			index.vue
功能：			直播名称
说明:         
当前版本：	1.0
开发信息：	Created by 张峰 2025-11-4
修改人信息：张峰     2025-11-4
修改内容：培训课程管理检索列表
 -->
<template>
  <div class="content-management">
    <!-- 搜索条件 -->
    <el-form v-show="showSearch" ref="queryFormRef" :model="queryParams" inline label-width="auto">
      <!-- 所属类别搜索框 -->
      <el-form-item label="直播名称" prop="title">
        <el-input v-model.trim="queryParams.title" placeholder="请输入直播名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>

      <!-- 发布时间选择器 -->
      <el-form-item label="发布时间" prop="createTime">
        <el-date-picker v-model="queryParams.createTime" type="datetime" placeholder="选择发布时间" value-format="YYYY-MM-DD HH:mm:ss" />
      </el-form-item>
      <!-- 发布人 -->
      <el-form-item label="发布人" prop="publishUser">
        <el-input v-model.trim="queryParams.publishUser" placeholder="请输入发布人" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <!-- 所属状态下拉框 -->
      <el-form-item label="所属状态" prop="videoStatus">
        <el-select v-model="queryParams.videoStatus" placeholder="请选择所属状态" filterable clearable>
          <el-option v-for="item in video_status" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <!-- 查询和重置按钮 -->
      <el-form-item>
        <el-button v-throttle type="primary" icon="Search" @click="handleSearch">查询</el-button>
        <el-button v-throttle icon="Refresh" @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button v-throttle type="primary" icon="Plus" v-hasPermi="['skill:onlineVideo:add']" @click="handleAdd">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button v-throttle class="custom-btn-style primary-btn" @click="handleEnable" :disabled="selectedIds.length === 0">启用</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button v-throttle class="custom-btn-style primary-btn" @click="handleDisable" :disabled="selectedIds.length === 0">禁用</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-throttle
          v-hasPermi="['skill:onlineVideo:remove']"
          @click="handleDelete"
          class="custom-btn-style delete-btn"
          :disabled="selectedIds.length === 0"
          >删除</el-button
        >
      </el-col>
      <!-- <RightToolbar :show-search="showSearch" @query-table="getList"></RightToolbar> -->
    </el-row>

    <!-- 表格展示 -->
    <el-table :data="tableData" v-loading="loading" style="table-layout: fixed" @selection-change="handleSelectionChange">
      <el-table-column type="selection" />
      <el-table-column type="index" width="100" label="序号" />
      <!-- 课程标题 -->
      <el-table-column label="直播名称" prop="title" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ scope.row.title || '-' }}</span>
        </template>
      </el-table-column>

      <!-- 链接地址 -->
      <el-table-column label="链接地址" prop="videoUrl" show-overflow-tooltip>
        <template #default="scope">
          <el-link v-if="scope.row.videoUrl" :href="scope.row.videoUrl" target="_blank" type="primary" :underline="false">
            {{ scope.row.videoUrl || '-' }}
          </el-link>
        </template>
      </el-table-column>

      <!-- 发布时间 -->
      <el-table-column label="发布时间" prop="createTime" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ scope.row.createTime || '-' }}</span>
        </template>
      </el-table-column>
      <!-- 状态 -->
      <el-table-column label="所属状态" align="center" prop="videoStatus">
        <template #default="scope">
          <!-- <dict-tag :options="video_status" :value="scope.row.videoStatus" /> -->
          <div class="workingMode">
            <div
              v-if="scope.row.videoStatus != null"
              class="normal"
              :class="{
                reviewRejected: scope.row.videoStatus == 2,
                green: scope.row.videoStatus == 1
              }"
            ></div>
            <span v-if="scope.row.videoStatus == 1" style="color: #108c58">启用</span>
            <span v-if="scope.row.videoStatus == 2" style="color: #f23255">禁用</span>
          </div>
        </template>
      </el-table-column>
      <!-- 发布人 -->
      <el-table-column label="发布人" prop="publishUser" width="120" show-overflow-tooltip>
        <template #default="scope">
          {{ scope.row.publishUser || '-' }}
        </template>
      </el-table-column>

      <!-- 操作 -->
      <el-table-column label="操作" align="left" fixed="right">
        <template #default="scope">
          <div class="operation-buttons">
            <el-button v-throttle link type="primary" @click="handleEdit(scope.row)" v-hasPermi="['skill:onlineVideo:edit']"> 编辑 </el-button>
            <el-button v-if="scope.row.videoStatus === '1'" link type="primary" @click="handleStatusChange(scope.row, '2')"> 禁用 </el-button>
            <el-button v-if="scope.row.videoStatus === '2'" link v-throttle type="primary" @click="handleStatusChange(scope.row, '1')">
              启用
            </el-button>
            <el-button
              v-throttle
              link
              v-show="scope.row.videoStatus === '2'"
              type="primary"
              v-hasPermi="['skill:onlineVideo:remove']"
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
      <Pagination
        v-show="total > 0"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        v-model:total="total"
        @pagination="getList"
      />
    </div>

    <!-- 弹窗：新增/编辑/查看 -->
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
            v-if="dialog.type === 'add' || dialog.type === 'edit' || dialog.type === 'view'"
            :is="OnlineVideoEdit"
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
import { useRouter } from 'vue-router';
import { gethnOnlineVideoList, updateStatus, hnOnlineVideodelete } from '@/api/system/onlineVideo';
// // // 弹窗组件异步加载（首字母大写）
const OnlineVideoEdit = defineAsyncComponent(() => import('./Edit.vue'));
// const TrainingcourseDetail = defineAsyncComponent(() => import('./trainingcourseDetail.vue'));

const router = useRouter();
const { proxy } = getCurrentInstance() as any;
const { cultivate_type, video_status } = toRefs<any>(proxy?.useDict('cultivate_type', 'video_status'));

// 字典由后端提供：legal_popularize_type、legal_pop_content_status

// 搜索表单数据
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  title: '', //直播名称
  publishUser: '', // 发布人
  videoStatus: '', // 所属状态
  createTime: '' //发布时间
});

// 表格数据
const tableData = ref([]);
// 总记录数
const total = ref(0);
// 加载状态
const loading = ref(false);
// 表单引用
const queryFormRef = ref();
// 日期范围
const dateRange = ref(['', '']);
// 是否显示搜索
const showSearch = ref(true);
// 选中的行ID数组
const selectedIds = ref([]);
// 选中的行数据数组
const selectedRows = ref([]);

// 弹窗控制
const dialog = ref({
  visible: false,
  type: '', // 'add' | 'edit' | 'view'
  id: null as string | number | null
});

/** 获取培训课程列表 */
const getList = () => {
  loading.value = true;
  console.log('queryParams.value', queryParams.value);

  // 调用API接口
  gethnOnlineVideoList({ ...queryParams.value, orderByColumn: 'createTime', isAsc: 'desc' })
    .then((res: any) => {
      if (res && res.code === 200) {
        tableData.value = res.rows || [];
        total.value = res.total || 0;
      } else {
        // // ElMessage.error(res?.msg || '获取直播信息内容列表失败');
      }
      loading.value = false;
    })
    .catch((error) => {
      console.error('获取直播信息内容列表失败:', error);
      // // ElMessage.error('获取直播信息内容列表失败，请稍后重试');
      loading.value = false;
    });
};

/** 查询按钮事件 */
const handleSearch = () => {
  queryParams.value.pageNum = 1;
  getList();
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
    title: '', //直播名称
    publishUser: '', // 发布人
    videoStatus: '', // 所属状态
    createTime: '' //发布时间
  };
  handleQuery();
};

// 表格选择变化事件
const handleSelectionChange = (selection: any[]) => {
  selectedIds.value = selection.map((item) => item.id);
  selectedRows.value = selection;
};

/** 弹窗标题 */
const getDialogTitle = () => {
  const map: Record<string, string> = {
    'add': '新增直播信息内容',
    'edit': '编辑直播信息内容',
    'view': '查看直播信息内容'
  };
  return map[dialog.value.type] || '';
};

/** 打开弹窗 */
const openDialog = (type: 'add' | 'edit' | 'view', id?: string | number) => {
  dialog.value = { visible: true, type, id: id ?? null };
};

/** 新增按钮事件 */
const handleAdd = () => {
  openDialog('add');
};

/** 启用按钮事件 */
const handleEnable = () => {
  // 如果没有选择内容，则提示用户选择
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要启用的内容');
    return;
  }
  const invalidRows = selectedRows.value.filter((row: any) => {
    const status = row.videoStatus;
    return status === '1' || status === '启用' || status === 1;
  });

  if (invalidRows.length > 0) {
    ElMessage.warning('所选内容中包含已启用的内容，无法重复启用');
    return;
  }

  // 弹窗确认
  ElMessageBox.confirm('是否确认启用？', '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      // 批量启用 - 使用正确的数据格式
      const enableData = {
        ids: selectedIds.value, // 内容ID数组
        videoStatus: '1' // 1表示已启用
      };

      updateStatus(enableData)
        .then((response: any) => {
          if (response.code === 200) {
            ElMessage.success(`成功启用 ${selectedIds.value.length} 条内容`);
            getList();
            // 清空选中状态
            selectedIds.value = [];
            selectedRows.value = [];
          } else {
            // ElMessage.error(response.msg || '启用操作失败');
          }
        })
        .catch((error) => {
          console.error('启用操作失败:', error);
          // ElMessage.error('启用操作失败，请稍后重试');
        });
    })
    .catch(() => {
      // 用户取消操作
    });
};

/** 停用按钮事件 */
const handleDisable = () => {
  // 如果没有选择内容，则提示用户选择
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要停用的内容');
    return;
  }

  // 检查目标内容是否都是启用状态（停用操作只能对启用状态的内容进行）
  // 状态：'3'-启用 '2'-禁用
  const invalidRows = selectedRows.value.filter((row: any) => {
    const status = row.videoStatus;
    return status === '2' || status === '禁用' || status === 2;
  });

  if (invalidRows.length > 0) {
    ElMessage.warning('所选内容中包含已停用的内容，无法重复停用');
    return;
  }

  // 弹窗确认
  ElMessageBox.confirm('是否确认禁用？', '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      // 批量停用 - 使用正确的数据格式
      const disableData = {
        ids: selectedIds.value, // 内容ID数组
        videoStatus: '2' // 2表示已禁用
      };

      updateStatus(disableData)
        .then((response: any) => {
          if (response.code === 200) {
            ElMessage.success(`成功停用 ${selectedIds.value.length} 条内容`);
            getList();
            // 清空选中状态
            selectedIds.value = [];
            selectedRows.value = [];
          } else {
            // ElMessage.error(response.msg || '停用操作失败');
          }
        })
        .catch((error) => {
          console.error('停用操作失败:', error);
          // ElMessage.error('停用操作失败，请稍后重试');
        });
    })
    .catch(() => {
      // 用户取消操作
    });
};

/** 删除按钮事件 */
const handleDelete = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要删除的内容');
    return;
  }

  // 检查是否有启用状态的内容
  const hasEnabledItems = selectedRows.value.some((row) => row.videoStatus == '1');
  if (hasEnabledItems) {
    ElMessage.warning('只能删除已停用的内容，请先停用后再删除');
    return;
  }

  try {
    await ElMessageBox.confirm('是否确认删除？删除后将无法恢复！', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    });

    await hnOnlineVideodelete(selectedIds.value);

    ElMessage.success(`成功删除 ${selectedIds.value.length} 条内容`);
    getList();
    // 清空选中状态
    selectedIds.value = [];
    selectedRows.value = [];
  } catch (error: any) {
    if (error !== 'cancel') {
      // ElMessage.error('删除失败，请稍后重试');
    }
  }
};

/** 编辑按钮事件 */
const handleEdit = (row: any) => {
  if (!row.id) {
    ElMessage.warning('数据ID缺失，无法编辑');
    return;
  }
  openDialog('edit', row.id);
};

/** 查看按钮事件 */
const handleView = (row: any) => {
  openDialog('view', row.id);
};

/** 弹窗成功回调 */
const onDialogSuccess = () => {
  dialog.value.visible = false;
  getList();
};

/** 状态变更事件 */
const handleStatusChange = async (row: any, newStatus: string) => {
  // newStatus: '1'-启用 '2'-禁用
  const statusText = newStatus === '1' ? '启用' : '禁用';

  try {
    await ElMessageBox.confirm(`是否确认${statusText}？`, '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    });

    await updateStatus({
      ids: [row.id],
      videoStatus: newStatus
    });

    ElMessage.success(`${statusText}成功`);
    // 刷新列表
    getList();
  } catch (error: any) {
    if (error !== 'cancel') {
      // ElMessage.error(`${statusText}失败，请稍后重试`);
    }
  }
};

/** 单个删除事件 */
const handleDeleteSingle = async (row: any) => {
  if (row.videoStatus == '1') {
    return ElMessage.warning('请禁用后再删除');
  }
  try {
    await ElMessageBox.confirm('是否确认删除？删除后将无法恢复！', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    });

    await hnOnlineVideodelete([row.id]);

    ElMessage.success('删除成功');
    getList();
  } catch (error: any) {
    if (error !== 'cancel') {
      // ElMessage.error('删除失败，请稍后重试');
    }
  }
};

// 字典渲染已使用 <dict-tag>，无需本地映射函数

// 页面加载时获取列表数据
onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
.content-management {
  padding: 24px;
  //   background-color: #f5f5f5;
  // min-height: 100vh;
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

// 操作按钮组样式
.operation-buttons {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 4px;
  flex-wrap: nowrap;
  white-space: nowrap;

  .el-button {
    margin: 0;
    // padding: 4px 8px;
    // font-size: 12px;
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

.custom-action-btn {
  background-color: #f2f3f5 !important;
  border: none !important;
  color: #333333 !important;

  &:hover {
    background-color: #e5e7eb !important;
    color: #333333 !important;
  }

  &:focus {
    background-color: #f2f3f5 !important;
    color: #333333 !important;
  }

  &.is-disabled {
    background-color: #f2f3f5 !important;
    color: #999999 !important;
    cursor: not-allowed;
  }

  &.delete-btn:not(.is-disabled) {
    color: #f56c6c !important;

    &:hover {
      color: #f56c6c !important;
    }

    &:focus {
      color: #f56c6c !important;
    }
  }
}
// 工作模式
.workingMode {
  display: flex;
  align-items: center;
  justify-content: center;
}

// 正常
.normal {
  width: 6px;
  height: 6px;
  margin-right: 5px;
  border-radius: 4px;
}
.green {
  background: #108c58;
}
// 异常
.reviewRejected {
  background: #f23255 !important;
}
.pendingReview {
  background: #ff7b00 !important;
}

.custom-btn-style {
  background-color: #f2f3f5 !important;
  border: none !important;
  color: #1d2129 !important;
  &:hover {
    background-color: #e5e7eb !important;
    color: #1d2129 !important;
  }

  &:focus {
    background-color: #f2f3f5 !important;
    color: #1d2129 !important;
  }

  &.is-disabled {
    background-color: #f2f3f5 !important;
    color: #999999 !important;
    cursor: not-allowed;
  }
  &:not(.is-disabled) {
    color: #1d2129 !important;

    &:hover {
      color: #1d2129 !important;
    }

    &:focus {
      color: #1d2129 !important;
    }
  }
  &.delete-btn:not(.is-disabled) {
    color: #ffffff !important;
    background-color: #f23255 !important;
    &:hover {
      color: #ffffff !important;
      background-color: #f23255 !important;
    }

    &:focus {
      color: #ffffff !important;
      background-color: #f23255 !important;
    }
  }
  &.primary-btn:not(.is-disabled) {
    color: #ffffff !important;
    background-color: #108c58 !important;
    &:hover {
      color: #ffffff !important;
      background-color: #108c58 !important;
    }

    &:focus {
      color: #ffffff !important;
      background-color: #108c58 !important;
    }
  }
}
</style>
