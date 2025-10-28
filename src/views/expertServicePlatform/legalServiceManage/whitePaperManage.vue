<!--
  标题: whitePaperManage.vue
  功能: 维权白皮书管理
  说明: 用于维权白皮书的管理，包括查询、添加、编辑、删除、启用停用、版本更新等操作
  当前版本: 1.0
  开发信息: Created by AI Assistant
-->
<template>
  <div class="white-paper-management">
    <!-- 主要内容区域 - 大盒子 -->
    <div class="main-content-box">
      <!-- 搜索条件 -->
      <el-form v-show="showSearch" ref="queryFormRef" :model="queryParams" inline :label-width="130">
        <!-- 维权白皮书标题搜索框 -->
        <el-form-item label="维权白皮书标题" prop="title">
          <el-input v-model="queryParams.title" placeholder="请输入标题" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        
        <!-- 所属状态下拉框 -->
        <el-form-item label="所属状态" prop="status">
          <el-select v-model="queryParams.status" placeholder="请选择" filterable clearable>
            <el-option label="全部" value="全部" />
            <el-option label="启用" value="启用" />
            <el-option label="禁用" value="禁用" />
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
          <el-button v-throttle type="text" @click="toggleSearch">
            {{ showSearch ? '收起' : '展开' }}
            <el-icon><ArrowUp v-if="showSearch" /><ArrowDown v-else /></el-icon>
          </el-button>
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
        <RightToolbar :show-search="showSearch" @query-table="getList"></RightToolbar>
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
        
        <!-- 白皮书标题 -->
        <el-table-column label="白皮书标题" align="center" prop="title" :show-overflow-tooltip="true" min-width="200">
          <template #default="scope">
            <router-link :to="'/expertServicePlatform/legalServiceManage/whitePaperDetail?id=' + scope.row.id + '&type=view'" class="link-type">
              <span>{{ scope.row.title }}</span>
            </router-link>
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
        <el-table-column label="所属状态" align="center" prop="status" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === '启用' ? 'success' : 'danger'">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        
        <!-- 最新版本号 -->
        <el-table-column label="最新版本号" align="center" prop="version" width="120">
          <template #default="scope">
            <span>{{ scope.row.version }}</span>
          </template>
        </el-table-column>
        
        <!-- 操作 -->
        <el-table-column label="操作" align="center" width="320">
          <template #default="scope">
            <div class="operation-buttons">
              <el-button v-throttle type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
              <el-button v-throttle type="info" size="small" @click="handleView(scope.row)">查看</el-button>
              <el-button v-throttle type="warning" size="small" @click="handleUpdateVersion(scope.row)">更新版本</el-button>
              <el-button 
                v-if="scope.row.status === '启用'" 
                v-throttle 
                type="warning" 
                size="small" 
                @click="handleStatusChange(scope.row, '禁用')"
              >
                禁用
              </el-button>
              <el-button 
                v-if="scope.row.status === '禁用'" 
                v-throttle 
                type="success" 
                size="small" 
                @click="handleStatusChange(scope.row, '启用')"
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
              <el-button v-throttle type="primary" size="small" @click="handleDownload(scope.row)">下载</el-button>
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
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';
import { ArrowUp, ArrowDown } from '@element-plus/icons-vue';

const router = useRouter();

// 搜索表单数据
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  title: '', // 白皮书标题
  status: '', // 状态
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

/** 获取维权白皮书列表 */
const getList = async () => {
  loading.value = true;
  try {
    // 模拟数据，实际开发时替换为真实API调用
    const mockData = {
      rows: [
        {
          id: 1,
          title: '2025年XXX通告',
          publishTime: '2019-12-12 10:29:30',
          viewCount: 1550,
          downloadCount: 988,
          status: '启用',
          version: 'V1.0'
        },
        {
          id: 2,
          title: 'XXX公告专家解读',
          publishTime: '2019-12-11 10:29:30',
          viewCount: 1872,
          downloadCount: 172,
          status: '禁用',
          version: 'V1.0'
        },
        {
          id: 3,
          title: '种子维权',
          publishTime: '2019-12-10 10:29:30',
          viewCount: 1981,
          downloadCount: 192,
          status: '启用',
          version: 'V1.0'
        },
        {
          id: 4,
          title: '种子司法判决',
          publishTime: '2019-12-11 10:29:30',
          viewCount: 1981,
          downloadCount: 192,
          status: '禁用',
          version: 'V1.0'
        },
        {
          id: 5,
          title: '农业知识产权保护指南',
          publishTime: '2019-12-09 14:30:00',
          viewCount: 1200,
          downloadCount: 350,
          status: '启用',
          version: 'V2.1'
        },
        {
          id: 6,
          title: '农产品质量安全法规解读',
          publishTime: '2019-12-08 09:15:00',
          viewCount: 980,
          downloadCount: 280,
          status: '启用',
          version: 'V1.5'
        },
        {
          id: 7,
          title: '农村土地承包经营权保护',
          publishTime: '2019-12-07 16:45:00',
          viewCount: 750,
          downloadCount: 150,
          status: '禁用',
          version: 'V1.0'
        },
        {
          id: 8,
          title: '农业补贴政策白皮书',
          publishTime: '2019-12-06 11:20:00',
          viewCount: 2100,
          downloadCount: 420,
          status: '启用',
          version: 'V3.0'
        }
      ],
      total: 8
    };
    
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    
    tableData.value = mockData.rows;
    total.value = mockData.total;
  } catch (error) {
    ElMessage.error('获取维权白皮书列表失败，请稍后重试');
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
  handleQuery();
};

/** 切换搜索显示 */
const toggleSearch = () => {
  showSearch.value = !showSearch.value;
};

// 表格选择变化事件
const handleSelectionChange = (selection: any[]) => {
  selectedIds.value = selection.map((item) => item.id);
  selectedRows.value = selection;
};

/** 新增按钮事件 */
const handleAdd = () => {
  router.push('/expertServicePlatform/legalServiceManage/addWhitePaper');
};

/** 启用按钮事件 */
const handleEnable = () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要启用的白皮书');
    return;
  }
  
  ElMessageBox.confirm(
    `确定要启用选中的${selectedIds.value.length}个白皮书吗？`,
    '系统提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    ElMessage.success(`成功启用${selectedIds.value.length}个白皮书`);
    getList();
  }).catch(() => {
    ElMessage.info('已取消启用');
  });
};

/** 停用按钮事件 */
const handleDisable = () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要停用的白皮书');
    return;
  }
  
  ElMessageBox.confirm(
    `确定要停用选中的${selectedIds.value.length}个白皮书吗？`,
    '系统提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    ElMessage.success(`成功停用${selectedIds.value.length}个白皮书`);
    getList();
  }).catch(() => {
    ElMessage.info('已取消停用');
  });
};

/** 删除按钮事件 */
const handleDelete = () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要删除的白皮书');
    return;
  }
  
  ElMessageBox.confirm(
    `确定要删除选中的${selectedIds.value.length}个白皮书吗？`,
    '系统提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    ElMessage.success(`成功删除${selectedIds.value.length}个白皮书`);
    getList();
  }).catch(() => {
    ElMessage.info('已取消删除');
  });
};

/** 编辑按钮事件 */
const handleEdit = (row: any) => {
  router.push({
    path: '/expertServicePlatform/legalServiceManage/editWhitePaper',
    query: { id: row.id }
  });
};

/** 查看按钮事件 */
const handleView = (row: any) => {
  router.push({
    path: '/expertServicePlatform/legalServiceManage/whitePaperDetail',
    query: { id: row.id, type: 'view' }
  });
};

/** 更新版本事件 */
const handleUpdateVersion = (row: any) => {
  ElMessageBox.confirm(
    `确定要更新白皮书"${row.title}"的版本吗？`,
    '系统提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    ElMessage.success('版本更新成功');
    getList();
  }).catch(() => {
    ElMessage.info('已取消版本更新');
  });
};

/** 状态变更事件 */
const handleStatusChange = (row: any, status: string) => {
  ElMessageBox.confirm(
    `确定要${status}白皮书"${row.title}"吗？`,
    '系统提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    ElMessage.success(`${status}成功`);
    getList();
  }).catch(() => {
    ElMessage.info('已取消操作');
  });
};

/** 单个删除事件 */
const handleDeleteSingle = (row: any) => {
  ElMessageBox.confirm(
    `确定要删除白皮书"${row.title}"吗？`,
    '系统提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    ElMessage.success('删除成功');
    getList();
  }).catch(() => {
    ElMessage.info('已取消删除');
  });
};

/** 下载事件 */
const handleDownload = (row: any) => {
  ElMessage.success(`开始下载白皮书"${row.title}"`);
  // 实际开发时这里应该调用下载API
};

// 页面加载时获取列表数据
onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
.white-paper-management {
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
  .white-paper-management {
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
  flex-wrap: wrap;
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
