<!-- 
标题：			index.vue
功能：			培训课程管理
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
      <el-form-item label="所属类别" prop="cultivateType">
        <el-select v-model="queryParams.cultivateType" placeholder="请选择所属类别" filterable clearable>
          <el-option v-for="item in cultivate_type" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>

      <!-- 发布时间选择器 -->
      <el-form-item label="发布时间">
        <el-date-picker
          v-model="dateRange"
          type="datetimerange"
          value-format="YYYY-MM-DD HH:mm"
          format="YYYY-MM-DD HH:mm"
          :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
          range-separator=" - "
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          @change="handleSelectDate"
        />
      </el-form-item>
      <!-- 发布人 -->
      <el-form-item label="发布人" prop="publishUser">
        <el-input v-model.trim="queryParams.publishUser" placeholder="请输入发布人" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <!-- 所属状态下拉框 -->
      <el-form-item label="所属状态" prop="cultivateStatus">
        <el-select v-model="queryParams.cultivateStatus" placeholder="请选择所属状态" filterable clearable>
          <el-option v-for="item in cultivate_status" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>

      <!-- 课程标题标题搜索框 -->
      <el-form-item label="课程标题" prop="cultivateName">
        <el-input v-model.trim="queryParams.cultivateName" placeholder="请输入课程标题" clearable @keyup.enter="handleQuery" />
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
        <el-button v-throttle type="primary" v-hasPermi="['skill:courseCultivate:add']" @click="handleAdd">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button v-throttle type="success" @click="handleEnable">启用</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button v-throttle type="warning" @click="handleDisable">禁用</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button v-throttle type="danger" v-hasPermi="['skill:courseCultivate:remove']" @click="handleDelete">删除</el-button>
      </el-col>
      <!-- <RightToolbar :show-search="showSearch" @query-table="getList"></RightToolbar> -->
    </el-row>

    <!-- 表格展示 -->
    <el-table :data="tableData" border v-loading="loading" style="width: 100%" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" />
      <el-table-column type="index" label="序号" width="55" align="center" />
      <!-- 发布时间 -->
      <el-table-column label="发布时间" align="center" prop="publishTime" min-width="160">
        <template #default="scope">
          <span>{{ scope.row.publishTime }}</span>
        </template>
      </el-table-column>
      <!-- 课程标题 -->
      <el-table-column label="课程标题" align="center" prop="cultivateName" min-width="160">
        <template #default="scope">
          <span>{{ scope.row.cultivateName }}</span>
        </template>
      </el-table-column>

      <!-- 所属类别 -->
      <el-table-column label="所属类别" align="center" prop="cultivateType" width="120">
        <template #default="scope">
          <dict-tag :options="cultivate_type" :value="scope.row.cultivateType" />
        </template>
      </el-table-column>

      <!-- 浏览量 -->
      <el-table-column label="浏览量" align="center" prop="pageViews" width="100">
        <template #default="scope">
          <span>{{ scope.row.pageViews != null ? scope.row.pageViews : 0 }}</span>
        </template>
      </el-table-column>

      <!-- 收藏量 -->
      <el-table-column label="收藏量" align="center" prop="collectCount" width="100">
        <template #default="scope">
          <span>{{ scope.row.collectCount != null ? scope.row.collectCount : 0 }}</span>
        </template>
      </el-table-column>

      <!-- 状态 -->
      <el-table-column label="状态" align="center" prop="cultivateStatus" width="100">
        <template #default="scope">
          <dict-tag :options="cultivate_status" :value="scope.row.cultivateStatus" />
        </template>
      </el-table-column>

      <!-- 发布人 -->
      <el-table-column label="发布人" align="center" prop="publishUser" width="120" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ scope.row.publishUser }}</span>
        </template>
      </el-table-column>

      <!-- 操作 -->
      <el-table-column label="操作" align="center" width="280" fixed="right">
        <template #default="scope">
          <div class="operation-buttons">
            <el-button v-throttle type="primary" size="small" @click="handleEdit(scope.row)" v-hasPermi="['skill:courseCultivate:edit']">
              编辑
            </el-button>
            <el-button v-throttle type="info" size="small" @click="handleView(scope.row)"> 查看 </el-button>
            <el-button v-if="scope.row.cultivateStatus === '1'" type="warning" size="small" @click="handleStatusChange(scope.row, '2')">
              禁用
            </el-button>
            <el-button v-if="scope.row.cultivateStatus === '2'" v-throttle type="success" size="small" @click="handleStatusChange(scope.row, '1')">
              启用
            </el-button>
            <el-button
              v-throttle
              v-show="scope.row.cultivateStatus === '2'"
              type="danger"
              size="small"
              @click="handleDeleteSingle(scope.row)"
              v-hasPermi="['skill:courseCultivate:remove']"
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
      width="80%"
      destroy-on-close
      :close-on-click-modal="false"
      @close="dialog.type = ''"
    >
      <Suspense>
        <template #default>
          <component
            ref="dialogRef"
            :is="dialog.type === 'view' ? Detail : Edit"
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
      <template #footer>
        <el-button type="primary" v-if="dialog.type !== 'view'" @click="handleSubmit" :loading="saving">
          {{ dialog.type === 'add' ? '发布' : '保存' }}
        </el-button>
        <el-button @click="dialog.visible = false">{{ dialog.type === 'view' ? '关闭' : '取消' }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance, toRefs, defineAsyncComponent, Suspense } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';
import { getCourseCultivateList, updateStatus, courseCultivatedelete } from '@/api/system/courseCultivate';
// // 弹窗组件异步加载（首字母大写）
const Edit = defineAsyncComponent(() => import('./Edit.vue'));
const Detail = defineAsyncComponent(() => import('./Detail.vue'));

const router = useRouter();
const { proxy } = getCurrentInstance() as any;
const { cultivate_type, cultivate_status } = toRefs<any>(proxy?.useDict('cultivate_type', 'cultivate_status'));

// 字典由后端提供：legal_popularize_type、legal_pop_content_status

// 搜索表单数据
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  cultivateType: '', //所属类别
  publishUser: '', // 发布人
  cultivateStatus: '', // 所属状态
  publishStartTime: '', // 发布开始时间
  publishEndTime: '', // 发布结束时间
  cultivateName: '', // 课程标题
  orderByColumn: 'publishTime', // 需要排序的列名
  isAsc: 'desc' // 排序方式
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
// 处理日期选择事件
const handleSelectDate = (val: string[]) => {
  queryParams.value.publishStartTime = val?.[0] || '';
  queryParams.value.publishEndTime = val?.[1] || '';
};
/** 获取培训课程列表 */
const getList = () => {
  loading.value = true;
  // 调用API接口
  getCourseCultivateList(queryParams.value)
    .then((res: any) => {
      if (res && res.code === 200) {
        tableData.value = res.rows || [];
        total.value = res.total || 0;
      } else {
        ElMessage.error(res?.msg || '获取培训课程内容列表失败');
      }
      loading.value = false;
    })
    .catch((error) => {
      console.error('获取培训课程内容列表失败:', error);
      ElMessage.error('获取培训课程内容列表失败，请稍后重试');
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
    cultivateType: '', //所属类别
    publishUser: '', // 发布人
    cultivateStatus: '', // 所属状态
    publishStartTime: '', // 发布开始时间
    publishEndTime: '', // 发布结束时间
    cultivateName: '', // 课程标题
    orderByColumn: 'publishTime', // 需要排序的列名
    isAsc: 'desc' // 排序方式
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
    'add': '新增培训课程内容',
    'edit': '编辑培训课程内容',
    'view': '查看培训课程内容'
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
    const status = row.cultivateStatus;
    return status === '1' || status === '启用' || status === 1;
  });

  if (invalidRows.length > 0) {
    ElMessage.warning('所选内容中包含已启用的内容，无法重复启用');
    return;
  }

  // 弹窗确认
  ElMessageBox.confirm('是否确认启用？', '操作确认', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning',
    center: true
  })
    .then(() => {
      // 批量启用 - 使用正确的数据格式
      const enableData = {
        ids: selectedIds.value, // 内容ID数组
        cultivateStatus: '1' // 1表示已启用
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
            ElMessage.error(response.msg || '启用操作失败');
          }
        })
        .catch((error) => {
          console.error('启用操作失败:', error);
          ElMessage.error('启用操作失败，请稍后重试');
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
  // 状态：'1'-启用 '2'-禁用
  const invalidRows = selectedRows.value.filter((row: any) => {
    const status = row.cultivateStatus;
    return status === '2' || status === '禁用' || status === 2;
  });

  if (invalidRows.length > 0) {
    ElMessage.warning('所选内容中包含已停用的内容，无法重复停用');
    return;
  }

  // 弹窗确认
  ElMessageBox.confirm('是否确认禁用？', '操作确认', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning',
    center: true
  })
    .then(() => {
      // 批量停用 - 使用正确的数据格式
      const disableData = {
        ids: selectedIds.value, // 内容ID数组
        cultivateStatus: '2' // 2表示已禁用
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
            ElMessage.error(response.msg || '停用操作失败');
          }
        })
        .catch((error) => {
          console.error('停用操作失败:', error);
          ElMessage.error('停用操作失败，请稍后重试');
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
  const hasEnabledItems = selectedRows.value.some((row) => row.cultivateStatus == '1');
  if (hasEnabledItems) {
    ElMessage.warning('只能删除已停用的内容，请先停用后再删除');
    return;
  }

  try {
    await ElMessageBox.confirm('是否确认删除？删除后将无法恢复！', '操作确认', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
      center: true
    });

    await courseCultivatedelete(selectedIds.value);

    ElMessage.success(`成功删除 ${selectedIds.value.length} 条内容`);
    getList();
    // 清空选中状态
    selectedIds.value = [];
    selectedRows.value = [];
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败，请稍后重试');
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
  // newStatus: '3'-启用 '2'-禁用
  const statusText = newStatus === '1' ? '启用' : '禁用';

  try {
    await ElMessageBox.confirm(`是否确认${statusText}？`, '操作确认', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
      center: true
    });

    await updateStatus({
      ids: [row.id],
      cultivateStatus: newStatus
    });

    ElMessage.success(`${statusText}成功`);
    // 刷新列表
    getList();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(`${statusText}失败，请稍后重试`);
    }
  }
};

/** 单个删除事件 */
const handleDeleteSingle = async (row: any) => {
  if (row.cultivateStatus == '1') {
    return ElMessage.warning('请禁用后再删除');
  }
  try {
    await ElMessageBox.confirm('是否确认删除？删除后将无法恢复！', '操作确认', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
      center: true
    });

    await courseCultivatedelete([row.id]);

    ElMessage.success('删除成功');
    getList();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败，请稍后重试');
    }
  }
};

const dialogRef = ref(null);
const saving = ref<boolean>(false);
const handleSubmit = () => {
  nextTick(async () => {
    if (dialogRef.value && typeof dialogRef.value.handleSubmit === 'function') {
      try {
        saving.value = true;
        await dialogRef.value.handleSubmit();
      } finally {
        saving.value = false;
      }
    }
  });
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
  min-height: 100vh;
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
