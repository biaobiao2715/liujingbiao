<!--
  标题: contentManage.vue
  功能: 普法内容管理
  说明: 用于普法内容的管理，包括查询、添加、编辑、删除、启用停用等操作
  当前版本: 1.0
  开发信息: Created by AI Assistant
-->
<template>
  <div class="content-management">
    <!-- 主要内容区域 - 大盒子 -->
    <div class="main-content-box">
      <!-- 搜索条件 -->
      <el-form v-show="showSearch" ref="queryFormRef" :model="queryParams" inline :label-width="130">
        <!-- 普法类型搜索框 -->
        <el-form-item label="普法类型" prop="contentType">
          <el-select v-model="queryParams.contentType" placeholder="请选择" filterable clearable>
            <el-option label="请选择" value="" />
            <el-option 
              v-for="item in legal_popularize_type" 
              :key="item.value" 
              :label="item.label" 
              :value="item.value" 
            />
          </el-select>
        </el-form-item>
        
        <!-- 发布时间选择器 -->
        <el-form-item label="发布时间">
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
        
        <!-- 所属状态下拉框 -->
        <el-form-item label="所属状态" prop="contentStatus">
          <el-select v-model="queryParams.contentStatus" placeholder="请选择" filterable clearable>
            <el-option label="请选择" value="" />
            <el-option label="启用" value="3" />
            <el-option label="禁用" value="2" />
          </el-select>
        </el-form-item>
        
        <!-- 普法内容标题搜索框 -->
        <el-form-item label="普法内容标题" prop="title">
          <el-input v-model="queryParams.title" placeholder="请输入标题" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        
        <!-- 查询和重置按钮 -->
        <el-form-item>
          <el-button v-throttle type="primary" @click="handleSearch">查询</el-button>
          <el-button v-throttle @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 操作按钮 -->
      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <el-button v-throttle v-hasPermi="['skill:lawContent:add']" type="primary" @click="handleAdd">新增</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button v-throttle v-hasPermi="['skill:lawContent:edit']" type="success" @click="handleEnable">启用</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button v-throttle v-hasPermi="['skill:lawContent:edit']" type="warning" @click="handleDisable">停用</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button v-throttle v-hasPermi="['skill:lawContent:remove']" type="danger" @click="handleDelete">删除</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-tag type="info">共 {{ total }} 条数据</el-tag>
        </el-col>
        <RightToolbar :show-search="showSearch" @query-table="getList"></RightToolbar>
      </el-row>

      <!-- 表格展示 -->
      <el-table :data="tableData" border v-loading="loading" style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column type="index" label="序号" width="55" align="center" />
        
        <!-- 内容编号 -->
        <el-table-column label="内容编号" align="center" prop="contentNo" min-width="160">
          <template #default="scope">
            <span>{{ scope.row.contentNo }}</span>
          </template>
        </el-table-column>
        
        <!-- 内容标题 -->
        <el-table-column label="内容标题" align="center" prop="contentTitle" :show-overflow-tooltip="true" min-width="200">
          <template #default="scope">
            <router-link :to="'/expertServicePlatform/legalServiceManage/contentDetail?id=' + scope.row.id + '&type=view'" class="link-type">
              <span>{{ scope.row.contentTitle }}</span>
            </router-link>
          </template>
        </el-table-column>
        
        <!-- 普法类型 -->
        <el-table-column label="普法类型" align="center" prop="contentType" width="120">
          <template #default="scope">
            <dict-tag :options="legal_popularize_type" :value="scope.row.contentType" />
          </template>
        </el-table-column>
        
        <!-- 发布时间 -->
        <el-table-column label="发布时间" align="center" prop="publishTime" min-width="160">
          <template #default="scope">
            <span>{{ scope.row.publishTime }}</span>
          </template>
        </el-table-column>
        
        <!-- 浏览量 -->
        <el-table-column label="浏览量" align="center" prop="viewCount" width="100">
          <template #default="scope">
            <span>{{ scope.row.viewCount != null ? scope.row.viewCount : 0 }}</span>
          </template>
        </el-table-column>
        
        <!-- 下载量 -->
        <el-table-column label="下载量" align="center" prop="downloadCount" width="100">
          <template #default="scope">
            <span>{{ scope.row.downloadCount != null ? scope.row.downloadCount : 0 }}</span>
          </template>
        </el-table-column>
        
        <!-- 状态 -->
        <el-table-column label="状态" align="center" prop="status" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === '启用' ? 'success' : 'danger'">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        
        <!-- 操作 -->
        <el-table-column label="操作" align="center" width="280" fixed="right">
          <template #default="scope">
            <div class="operation-buttons">
              <el-button 
                v-throttle 
                v-hasPermi="['skill:lawContent:edit']" 
                type="primary" 
                size="small" 
                @click="handleEdit(scope.row)"
              >
                编辑
              </el-button>
              <el-button 
                v-throttle 
                v-hasPermi="['skill:lawContent:query']" 
                type="info" 
                size="small" 
                @click="handleView(scope.row)"
              >
                查看
              </el-button>
              <el-button 
                v-if="scope.row.status === '启用'" 
                v-throttle 
                v-hasPermi="['skill:lawContent:edit']" 
                type="warning" 
                size="small" 
                @click="handleStatusChange(scope.row, '2')"
              >
                禁用
              </el-button>
              <el-button 
                v-if="scope.row.status === '禁用'" 
                v-throttle 
                v-hasPermi="['skill:lawContent:edit']" 
                type="success" 
                size="small" 
                @click="handleStatusChange(scope.row, '3')"
              >
                启用
              </el-button>
              <el-button 
                v-if="scope.row.status === '禁用'" 
                v-throttle 
                v-hasPermi="['skill:lawContent:remove']" 
                type="danger" 
                size="small" 
                @click="handleDeleteSingle(scope.row)"
              >
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="flex-center pagination">
        <Pagination 
          v-show="total > 0" 
          :page="queryParams.pageNum" 
          :limit="queryParams.pageSize" 
          :total="total" 
          @pagination="getList" 
        />
      </div>
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
import { useRouter } from 'vue-router';
import { 
  getContentList, 
  editContent,
  deleteContent
} from '@/api/expertServicePlatform/legalServiceManage/contentManage';

// 弹窗组件异步加载（首字母大写）
const ContentEditDialog = defineAsyncComponent(() => import('./ContentEditDialog.vue'));
const ContentDetailDialog = defineAsyncComponent(() => import('./ContentDetailDialog.vue'));

const router = useRouter();
const { proxy } = getCurrentInstance() as any;
const { legal_popularize_type, legal_pop_content_status } = toRefs<any>(
  proxy?.useDict('legal_popularize_type', 'legal_pop_content_status')
);

// 字典由后端提供：legal_popularize_type、legal_pop_content_status

// 搜索表单数据
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  contentType: '', // 内容类型:1法律法规2政策解读3案例分析4司法判决
  contentSummary: '', // 内容简介
  contentStatus: '', // 内容状态:0草稿1待审核2已发布3已下架4审核不通过99已关闭
  startTime: '', // 开始时间
  endTime: '', // 结束时间
  orderByColumn: '', // 排序列
  isAsc: '', // 排序的方向desc或者asc
  title: '' // 普法内容标题
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

/** 获取普法内容列表 */
const getList = () => {
  loading.value = true;
  
  // 准备查询参数，参考商品管理的写法
  const { title, dateRange: _, ...rest } = queryParams.value as any;
  const [startTime, endTime] = dateRange.value || [];
  
  const params: any = {
    ...rest,
    // 将title映射为contentTitle（后端接口使用contentTitle作为查询参数）
    ...(title ? { contentTitle: title } : {}),
    // 日期范围处理
    ...(startTime && endTime ? { startTime, endTime } : {})
  };
  
  // 过滤空字符串参数
  Object.keys(params).forEach(key => {
    if (params[key] === '') {
      delete params[key];
    }
  });
  
  // 调用API接口
  getContentList(params).then((res: any) => {
    if (res && res.code === 200) {
      const processedData = (res.rows || []).map((item: any) => {
        let statusText = '未知';
        if (item.contentStatus === '3' || item.contentStatus === 3) {
          statusText = '启用';
        } else if (item.contentStatus === '2' || item.contentStatus === 2) {
          statusText = '禁用';
        }
        
        // 处理浏览量和下载量：正确映射后端字段
        // 检查后端可能使用的字段名（viewCount/view_count/downloadCount/download_count）
        const viewCount = item.viewCount ?? item.view_count ?? 0;
        const downloadCount = item.downloadCount ?? item.download_count ?? 0;
        
        return {
          ...item,
          // 确保状态字段正确映射
          status: statusText,
          // 保留原始数据
          publishTime: item.publishTime || item.createTime || '-',
          // 处理浏览量：确保正确显示数值
          viewCount: viewCount != null && viewCount !== '' ? Number(viewCount) : 0,
          // 处理下载量：确保正确显示数值
          downloadCount: downloadCount != null && downloadCount !== '' ? Number(downloadCount) : 0
        };
      });
      
      tableData.value = processedData;
      total.value = res.total || 0;
    } else {
      ElMessage.error(res?.msg || '获取普法内容列表失败');
    }
    loading.value = false;
  }).catch((error) => {
    console.error('获取普法内容列表失败:', error);
    ElMessage.error('获取普法内容列表失败，请稍后重试');
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
  queryParams.value.startTime = '';
  queryParams.value.endTime = '';
  queryParams.value.contentType = '';
  queryParams.value.contentStatus = '';
  queryParams.value.contentSummary = '';
  queryParams.value.title = '';
  queryParams.value.orderByColumn = '';
  queryParams.value.isAsc = '';
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
    'add': '新增普法内容',
    'edit': '编辑普法内容',
    'view': '查看普法内容'
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

  // 检查目标内容是否都是禁用状态（启用操作只能对禁用状态的内容进行）
  // 状态：'3'-启用 '2'-禁用
  const invalidRows = selectedRows.value.filter((row: any) => {
    const status = row.contentStatus || row.status;
    return status === '3' || status === '启用' || status === 3;
  });
  
  if (invalidRows.length > 0) {
    ElMessage.warning('所选内容中包含已启用的内容，无法重复启用');
    return;
  }

  // 弹窗确认
  ElMessageBox.confirm(
    '是否确认启用？', 
    '操作确认', 
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
      center: true
    }
  )
    .then(() => {
      // 批量启用 - 使用正确的数据格式
      const enableData = {
        contentTitle: 'batch_enable', // 批量操作标识（随意值）
        contentType: 'batch', // 批量操作标识（随意值）
        contentSummary: 'batch_operation', // 批量操作标识（随意值）
        ids: selectedIds.value, // 内容ID数组
        contentStatus: '3' // 3表示已启用
      };

      editContent(enableData)
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
  // 状态：'3'-启用 '2'-禁用
  const invalidRows = selectedRows.value.filter((row: any) => {
    const status = row.contentStatus || row.status;
    return status === '2' || status === '禁用' || status === 2;
  });
  
  if (invalidRows.length > 0) {
    ElMessage.warning('所选内容中包含已停用的内容，无法重复停用');
    return;
  }

  // 弹窗确认
  ElMessageBox.confirm(
    '是否确认禁用？', 
    '操作确认', 
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
      center: true
    }
  )
    .then(() => {
      // 批量停用 - 使用正确的数据格式
      const disableData = {
        contentTitle: 'batch_disable', // 批量操作标识（随意值）
        contentType: 'batch', // 批量操作标识（随意值）
        contentSummary: 'batch_operation', // 批量操作标识（随意值）
        ids: selectedIds.value, // 内容ID数组
        contentStatus: '2' // 2表示已禁用
      };

      editContent(disableData)
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
  const hasEnabledItems = selectedRows.value.some(row => row.status === '启用');
  if (hasEnabledItems) {
    ElMessage.warning('只能删除已停用的内容，请先停用后再删除');
    return;
  }
  
  try {
    await ElMessageBox.confirm(
      '是否确认删除？删除后将无法恢复！',
      '操作确认',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }
    );
    
    await deleteContent(selectedIds.value);
    
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
  const statusText = newStatus === '3' ? '启用' : '禁用';
  
  try {
    await ElMessageBox.confirm(
      `是否确认${statusText}？`,
      '操作确认',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }
    );
    
    await editContent({ 
      contentTitle: 'single_operation', // 单个操作标识（随意值）
      contentType: 'single', // 单个操作标识（随意值）
      contentSummary: 'single_operation', // 单个操作标识（随意值）
      ids: [row.id], 
      contentStatus: newStatus 
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
  try {
    await ElMessageBox.confirm(
      '是否确认删除？删除后将无法恢复！',
      '操作确认',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }
    );
    
    await deleteContent([row.id]);
    
    ElMessage.success('删除成功');
    getList();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败，请稍后重试');
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
  background-color: #f5f5f5;
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
