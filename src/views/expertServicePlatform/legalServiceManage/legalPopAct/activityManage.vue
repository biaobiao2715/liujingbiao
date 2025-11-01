<!--
  标题: activityManage.vue
  功能: 普法活动管理
  说明: 用于普法活动的管理，包括查询、添加、编辑、删除、取消活动等操作
  当前版本: 1.0
  开发信息: Created by AI Assistant
-->
<template>
  <div class="activity-management">
    <!-- 主要内容区域 - 大盒子 -->
    <div class="main-content-box">
      <!-- 搜索条件 -->
      <el-form v-show="showSearch" ref="queryFormRef" :model="queryParams" inline :label-width="130">
        <!-- 普法活动标题搜索框 -->
        <el-form-item label="普法活动标题" prop="activityTitle">
          <el-input v-model="queryParams.activityTitle" placeholder="请输入标题" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        
        <!-- 所属状态下拉框 -->
        <el-form-item label="所属状态" prop="activityStatus">
          <el-select v-model="queryParams.activityStatus" placeholder="请选择" filterable clearable>
            <el-option label="请选择" value="请选择" />
            <el-option 
              v-for="item in legal_popularize_status" 
              :key="item.value" 
              :label="item.label" 
              :value="item.value" 
            />
          </el-select>
        </el-form-item>
      
        
        <!-- 所属类型下拉框 -->
        <el-form-item label="所属类型" prop="activityType">
          <el-select v-model="queryParams.activityType" placeholder="请选择" filterable clearable>
            <el-option label="请选择" value="请选择" />
            <el-option 
              v-for="item in legal_popularize_activity_type" 
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
            type="daterange"
            value-format="YYYY-MM-DD"
            range-separator=" - "
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
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
          <el-button v-throttle type="primary" @click="handleAdd">新增</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button v-throttle type="danger" @click="handleDelete">删除</el-button>
        </el-col>
        <RightToolbar :show-search="showSearch" @query-table="getList"></RightToolbar>
      </el-row>

      <!-- 表格展示 -->
      <el-table :data="tableData" border v-loading="loading" style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column type="index" label="序号" width="55" align="center" />
        
        <!-- 普法活动开始时间 -->
        <el-table-column label="普法活动开始时间" align="center" prop="startTime" min-width="180">
          <template #default="scope">
            <span>{{ scope.row.startTime }}</span>
          </template>
        </el-table-column>
        
        <!-- 普法活动结束时间 -->
        <el-table-column label="普法活动结束时间" align="center" prop="endTime" min-width="180">
          <template #default="scope">
            <span>{{ scope.row.endTime }}</span>
          </template>
        </el-table-column>
        
        <!-- 普法活动标题 -->
        <el-table-column label="普法活动标题" align="center" prop="activityTitle" :show-overflow-tooltip="true" min-width="200">
          <template #default="scope">
            <router-link :to="'/expertServicePlatform/legalServiceManage/activityDetail?id=' + scope.row.id + '&type=view'" class="link-type">
              <span>{{ scope.row.activityTitle }}</span>
            </router-link>
          </template>
        </el-table-column>
        
        <!-- 普法活动地址 -->
        <el-table-column label="普法活动地址" align="center" prop="activityAddress" :show-overflow-tooltip="true" min-width="250">
          <template #default="scope">
            <span>{{ scope.row.activityAddress }}</span>
          </template>
        </el-table-column>
        
        <!-- 所属类型 -->
        <el-table-column label="所属类型" align="center" prop="activityType" width="120">
          <template #default="scope">
            <span>{{ scope.row.activityType }}</span>
          </template>
        </el-table-column>
        
        <!-- 联系人 -->
        <el-table-column label="联系人" align="center" prop="activityContact" width="100">
          <template #default="scope">
            <span>{{ scope.row.activityContact }}</span>
          </template>
        </el-table-column>
        
        <!-- 联系方式 -->
        <el-table-column label="联系方式" align="center" prop="activityContactPhone" width="120">
          <template #default="scope">
            <span>{{ scope.row.activityContactPhone }}</span>
          </template>
        </el-table-column>
        
        <!-- 报名人数 -->
        <el-table-column label="报名人数" align="center" prop="enrollCount" width="100">
          <template #default="scope">
            <span>{{ scope.row.enrollCount || 0 }}</span>
          </template>
        </el-table-column>
        
        <!-- 发布时间 -->
        <el-table-column label="发布时间" align="center" prop="publishTime" min-width="160">
          <template #default="scope">
            <span>{{ scope.row.publishTime }}</span>
          </template>
        </el-table-column>
        
        <!-- 状态 -->
        <el-table-column label="状态" align="center" prop="activityStatus" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.activityStatus)">
              {{ getDictLabel(legal_popularize_status, scope.row.activityStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <!-- 操作 -->
        <el-table-column label="操作" align="center" width="280">
          <template #default="scope">
            <div class="operation-buttons">
              <el-button v-throttle type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
              <el-button v-throttle type="info" size="small" @click="handleView(scope.row)">查看</el-button>
              <el-button 
                v-if="scope.row.activityStatus === '1'" 
                v-throttle 
                type="warning" 
                size="small" 
                @click="handleCancelActivity(scope.row)"
              >
                取消活动
              </el-button>
              <el-button 
                v-if="scope.row.activityStatus === '4' || scope.row.activityStatus === '3'" 
                v-throttle 
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance, toRefs } from 'vue';
import type { ComponentInternalInstance } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';
import { 
  getActivityList, 
  deleteActivity, 
  cancelActivity,
  type ActivityListQuery 
} from '@/api/expertServicePlatform/legalServiceManage/activityManage';

const router = useRouter();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

// 使用字典数据
const { legal_popularize_activity_type, legal_popularize_status } = toRefs<any>(
  (proxy as any)?.useDict('legal_popularize_activity_type', 'legal_popularize_status')
);

// 搜索表单数据
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  activityTitle: '', // 活动标题
  activityStatus: '', // 状态
  activityType: '', // 活动类型
  startTime: '', // 开始时间
  endTime: '' // 结束时间
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

/** 获取普法活动列表 */
const getList = async () => {
  loading.value = true;
  try {
    // 构建查询参数
    const params: ActivityListQuery = {
      pageNum: queryParams.value.pageNum,
      pageSize: queryParams.value.pageSize,
      activityTitle: queryParams.value.activityTitle || undefined,
      activityStatus: queryParams.value.activityStatus === '请选择' ? undefined : queryParams.value.activityStatus,
      activityType: queryParams.value.activityType === '请选择' ? undefined : queryParams.value.activityType,
      startTime: queryParams.value.startTime || undefined,
      endTime: queryParams.value.endTime || undefined
    };
    
    // 调用真实API - 响应拦截器已处理，直接访问 rows 和 total
    const response: any = await getActivityList(params);
    
    console.log('API返回数据:', response);
    
    // 参考商品管理的写法，直接访问 response.rows 和 response.total
    if (response.code === 200) {
      tableData.value = response.rows || [];
      total.value = response.total || 0;
      console.log('表格数据:', tableData.value);
      console.log('总数:', total.value);
    } else {
      tableData.value = [];
      total.value = 0;
      ElMessage.error(response.msg || '获取数据失败');
    }
  } catch (error) {
    console.error('获取普法活动列表失败:', error);
    ElMessage.error('获取普法活动列表失败，请稍后重试');
    tableData.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

/** 获取字典标签 */
const getDictLabel = (dict: any, value: string) => {
  const item = dict?.value?.find((item: any) => item.value === value);
  return item?.label || value;
};

/** 获取状态标签类型 */
const getStatusType = (status: string) => {
  // 1-待开始 2-进行中 3-已结束 4-已取消
  switch (status) {
    case '1':
      return 'primary';
    case '2':
      return 'success';
    case '3':
      return 'danger';
    case '4':
      return 'warning';
    default:
      return 'info';
  }
};

/** 查询按钮事件 */
const handleSearch = () => {
  queryParams.value.startTime = dateRange.value[0];
  queryParams.value.endTime = dateRange.value[1];
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
  queryParams.value.activityTitle = '';
  queryParams.value.activityStatus = '';
  queryParams.value.activityType = '';
  queryParams.value.startTime = '';
  queryParams.value.endTime = '';
  queryParams.value.pageNum = 1;
  handleQuery();
};

// 表格选择变化事件
const handleSelectionChange = (selection: any[]) => {
  selectedIds.value = selection.map((item) => item.id);
  selectedRows.value = selection;
};

/** 新增按钮事件 */
const handleAdd = () => {
  router.push('/expertServicePlatform/legalServiceManage/addActivity');
};

/** 删除按钮事件 */
const handleDelete = async () => {
  const ids = selectedIds.value.slice();
  
  if (ids.length === 0) {
    ElMessage.warning('请先选择要删除的活动');
    return;
  }
  
  const tip = `确定要删除选中的 ${ids.length} 个活动吗？删除后将无法恢复。`;
  
  try {
    await ElMessageBox.confirm(tip, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    
    loading.value = true;
    
    // 调用删除API - 响应拦截器已处理，response 直接是后端返回数据
    const response: any = await deleteActivity(ids);
    
    if (response && response.code === 200) {
      ElMessage.success(`成功删除 ${ids.length} 个活动`);
      // 刷新并清空选择
      await getList();
      selectedIds.value = [];
      selectedRows.value = [];
    } else {
      ElMessage.error(response?.msg || '删除失败，请重试');
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除活动失败:', error);
      ElMessage.error('删除失败，请稍后重试');
    } else {
      ElMessage.info('删除操作已取消');
    }
  } finally {
    loading.value = false;
  }
};

/** 编辑按钮事件 */
const handleEdit = (row: any) => {
  router.push({
    path: '/expertServicePlatform/legalServiceManage/editActivity',
    query: { id: row.id }
  });
};

/** 查看按钮事件 */
const handleView = (row: any) => {
  router.push({
    path: '/expertServicePlatform/legalServiceManage/activityDetail',
    query: { id: row.id, type: 'view' }
  });
};

/** 取消活动事件 */
const handleCancelActivity = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要取消活动"${row.activityTitle}"吗？取消后将无法恢复。`,
      '取消活动确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    
    // 调用取消活动API - 响应拦截器已处理，response 直接是后端返回数据
    const response: any = await cancelActivity(row.id);
    
    if (response && response.code === 200) {
      ElMessage.success('活动取消成功');
      // 重新加载列表
      await getList();
    } else {
      ElMessage.error(response?.msg || '取消活动失败，请稍后重试');
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消活动失败:', error);
      ElMessage.error('取消活动失败，请稍后重试');
    }
  }
};

/** 单个删除事件 */
const handleDeleteSingle = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除活动"${row.activityTitle}"吗？删除后将无法恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    
    // 调用删除API - 响应拦截器已处理，response 直接是后端返回数据
    const response: any = await deleteActivity([row.id]);
    
    if (response && response.code === 200) {
      ElMessage.success('删除成功');
      // 重新加载列表
      await getList();
    } else {
      ElMessage.error(response?.msg || '删除活动失败，请稍后重试');
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除活动失败:', error);
      ElMessage.error('删除活动失败，请稍后重试');
    }
  }
};

// 页面加载时获取列表数据
onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
.activity-management {
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
  
  &.el-tag--primary {
    background-color: #ecf5ff;
    border-color: #409eff;
    color: #409eff;
  }
  
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
  
  &.el-tag--warning {
    background-color: #fdf6ec;
    border-color: #e6a23c;
    color: #e6a23c;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .activity-management {
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
