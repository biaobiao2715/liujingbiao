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
            <el-option label="全部" value="" />
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
            type="daterange"
            value-format="YYYY-MM-DD"
            range-separator=" - "
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
        
        <!-- 所属状态下拉框 -->
        <el-form-item label="所属状态" prop="contentStatus">
          <el-select v-model="queryParams.contentStatus" placeholder="请选择" filterable clearable>
            <el-option label="全部" value="" />
            <el-option label="启用" value="2" />
            <el-option label="禁用" value="3" />
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
          <el-button v-throttle type="primary" @click="handleAdd">新增</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button v-throttle type="success" @click="handleEnable">启用</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button v-throttle type="warning" @click="handleDisable">停用</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button v-throttle type="danger" @click="handleDelete">删除</el-button>
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
        
        <!-- 内容等级 -->
        <el-table-column label="内容等级" align="center" prop="contentLevel" width="100">
          <template #default="scope">
            <span>{{ getLevelText(scope.row.contentLevel) }}</span>
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
            <span>{{ scope.row.viewCount || 0 }}</span>
          </template>
        </el-table-column>
        
        <!-- 下载量 -->
        <el-table-column label="下载量" align="center" prop="downloadCount" width="100">
          <template #default="scope">
            <span>{{ scope.row.downloadCount || 0 }}</span>
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
              <el-button v-throttle type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
              <el-button v-throttle type="info" size="small" @click="handleView(scope.row)">查看</el-button>
              <el-button 
                v-if="scope.row.status === '启用'" 
                v-throttle 
                type="warning" 
                size="small" 
                @click="handleStatusChange(scope.row, '3')"
              >
                禁用
              </el-button>
              <el-button 
                v-if="scope.row.status === '禁用'" 
                v-throttle 
                type="success" 
                size="small" 
                @click="handleStatusChange(scope.row, '2')"
              >
                启用
              </el-button>
              <el-button 
                v-if="scope.row.status === '禁用'" 
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
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';
import { 
  getContentList, 
  getContentDetail,
  updateContentStatus,
  deleteContent
} from '../../../../api/expertServicePlatform/legalServiceManage/contentManage';

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

/** 获取普法内容列表 */
const getList = async () => {
  loading.value = true;
  try {
    // 调用真实的API接口
    const response = await getContentList(queryParams.value);
    const resData: any = response?.data || response;
    if (resData && resData.code === 200) {
      // 处理后端返回的数据，映射字段
      const processedData = (resData.rows || []).map((item: any) => {
        // 状态映射：2-已发布(启用) 3-已下架(禁用)
        let statusText = '未知';
        if (item.contentStatus === '2' || item.contentStatus === 2) {
          statusText = '启用';
        } else if (item.contentStatus === '3' || item.contentStatus === 3) {
          statusText = '禁用';
        }
        
        return {
          ...item,
          // 确保状态字段正确映射
          status: statusText,
          // 保留原始数据
          publishTime: item.publishTime || item.createTime || '-',
          viewCount: item.viewCount || 0,
          downloadCount: item.downloadCount || 0
        };
      });
      
      tableData.value = processedData;
      total.value = resData.total || 0;
      console.log('获取普法内容列表成功:', resData);
      console.log('处理后的表格数据:', processedData);
      console.log('第一条数据的所有字段:', processedData[0]);
    } else {
      ElMessage.error(resData?.msg || '获取普法内容列表失败');
    }
  } catch (error) {
    console.error('获取普法内容列表失败:', error);
    ElMessage.error('获取普法内容列表失败，请稍后重试');
  } finally {
    loading.value = false;
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
  queryParams.value.startTime = '';
  queryParams.value.endTime = '';
  queryParams.value.contentType = '';
  queryParams.value.contentStatus = '';
  queryParams.value.contentSummary = '';
  queryParams.value.orderByColumn = '';
  queryParams.value.isAsc = '';
  handleQuery();
};

// 表格选择变化事件
const handleSelectionChange = (selection: any[]) => {
  selectedIds.value = selection.map((item) => item.id);
  selectedRows.value = selection;
};

/** 新增按钮事件 */
const handleAdd = () => {
  router.push('/expertServicePlatform/legalServiceManage/addContent');
};

/** 启用按钮事件 */
const handleEnable = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要启用的内容');
    return;
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要启用选中的${selectedIds.value.length}条内容吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    await updateContentStatus({
      ids: selectedIds.value,
      contentStatus: '2' // 2-启用
    });
    
    ElMessage.success(`成功启用${selectedIds.value.length}条内容`);
    getList();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('启用失败');
    }
  }
};

/** 停用按钮事件 */
const handleDisable = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要停用的内容');
    return;
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要停用选中的${selectedIds.value.length}条内容吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    await updateContentStatus({
      ids: selectedIds.value,
      contentStatus: '3' // 3-停用
    });
    
    ElMessage.success(`成功停用${selectedIds.value.length}条内容`);
    getList();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('停用失败');
    }
  }
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
      `确定要删除选中的${selectedIds.value.length}条内容吗？删除后将无法恢复！`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }
    );
    
    await deleteContent(selectedIds.value);
    
    ElMessage.success(`成功删除${selectedIds.value.length}条内容`);
    getList();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
    }
  }
};

/** 编辑按钮事件 */
const handleEdit = (row: any) => {
  router.push({
    path: '/expertServicePlatform/legalServiceManage/editContent',
    query: { id: row.id }
  });
};

/** 查看按钮事件 */
const handleView = (row: any) => {
  router.push({
    path: '/expertServicePlatform/legalServiceManage/contentDetail',
    query: { id: row.id, type: 'view' }
  });
};

/** 状态变更事件 */
const handleStatusChange = async (row: any, newStatus: string) => {
  // newStatus: '2'-启用 '3'-禁用
  const statusText = newStatus === '2' ? '启用' : '禁用';
  
  try {
    await ElMessageBox.confirm(
      `确定要${statusText}该内容吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    await updateContentStatus({ 
      ids: [row.id], 
      contentStatus: newStatus 
    });
    
    ElMessage.success(`${statusText}成功`);
    // 刷新列表
    getList();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(`${statusText}失败`);
    }
  }
};

/** 单个删除事件 */
const handleDeleteSingle = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除"${row.contentTitle}"吗？删除后将无法恢复！`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }
    );
    
    await deleteContent([row.id]);
    
    ElMessage.success('删除成功');
    getList();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
    }
  }
};

/** 内容等级映射函数 */
const getLevelText = (level: string | number) => {
  switch (String(level)) {
    case '1':
      return '国家级';
    case '2':
      return '省级';
    case '3':
      return '市级';
    case '4':
      return '县级';
    default:
      return '-';
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
