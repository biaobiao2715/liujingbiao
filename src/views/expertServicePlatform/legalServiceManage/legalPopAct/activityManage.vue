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
        <el-form-item label="普法活动标题" prop="title">
          <el-input v-model="queryParams.title" placeholder="请输入标题" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        
        <!-- 所属状态下拉框 -->
        <el-form-item label="所属状态" prop="status">
          <el-select v-model="queryParams.status" placeholder="请选择" filterable clearable>
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
          <!-- <el-button v-throttle type="text" @click="toggleSearch">
            {{ showSearch ? '收起' : '展开' }}
            <el-icon><ArrowUp v-if="showSearch" /><ArrowDown v-else /></el-icon>
          </el-button> -->
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
        <el-table-column label="普法活动标题" align="center" prop="title" :show-overflow-tooltip="true" min-width="200">
          <template #default="scope">
            <router-link :to="'/expertServicePlatform/legalServiceManage/activityDetail?id=' + scope.row.id + '&type=view'" class="link-type">
              <span>{{ scope.row.title }}</span>
            </router-link>
          </template>
        </el-table-column>
        
        <!-- 普法活动地址 -->
        <el-table-column label="普法活动地址" align="center" prop="address" :show-overflow-tooltip="true" min-width="250">
          <template #default="scope">
            <span>{{ scope.row.address }}</span>
          </template>
        </el-table-column>
        
        <!-- 所属类型 -->
        <el-table-column label="所属类型" align="center" prop="activityType" width="120">
          <template #default="scope">
            <span>{{ scope.row.activityType }}</span>
          </template>
        </el-table-column>
        
        <!-- 联系人 -->
        <el-table-column label="联系人" align="center" prop="contactPerson" width="100">
          <template #default="scope">
            <span>{{ scope.row.contactPerson }}</span>
          </template>
        </el-table-column>
        
        <!-- 联系方式 -->
        <el-table-column label="联系方式" align="center" prop="contactInfo" width="120">
          <template #default="scope">
            <span>{{ scope.row.contactInfo }}</span>
          </template>
        </el-table-column>
        
        <!-- 报名人数 -->
        <el-table-column label="报名人数" align="center" prop="registrationCount" width="100">
          <template #default="scope">
            <span>{{ scope.row.registrationCount || 0 }}</span>
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
        
        <!-- 状态 -->
        <el-table-column label="状态" align="center" prop="status" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ scope.row.status }}
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
                v-if="scope.row.status === '待开始'" 
                v-throttle 
                type="warning" 
                size="small" 
                @click="handleCancelActivity(scope.row)"
              >
                取消活动
              </el-button>
              <el-button 
                v-if="scope.row.status === '已取消' || scope.row.status === '已结束'" 
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
import { ArrowUp, ArrowDown } from '@element-plus/icons-vue';

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
  title: '', // 活动标题
  status: '', // 状态
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
    // 模拟数据，实际开发时替换为真实API调用
    const mockData = {
      rows: [
        {
          id: 1,
          title: '技术培训会议',
          activityType: '专家讲座',
          startTime: '2019-12-12 10:29:30',
          endTime: '2019-12-12 11:29:30',
          address: '湖北省武汉市汉南区农耕4楼会议室',
          contactPerson: '张三',
          contactInfo: '13888888888',
          registrationCount: 200,
          publishTime: '2019/12/12 10:29',
          viewCount: 1550,
          status: '待开始'
        },
        {
          id: 2,
          title: '技术培训会议',
          activityType: '普法培训',
          startTime: '2019-12-12 10:29:30',
          endTime: '2019-12-12 11:29:30',
          address: '湖北省武汉市汉南区农耕4楼会议室',
          contactPerson: '王五',
          contactInfo: '13888888888',
          registrationCount: 200,
          publishTime: '2019/12/10 10:29',
          viewCount: 1981,
          status: '已结束'
        },
        {
          id: 3,
          title: '法律知识普及讲座',
          activityType: '法律咨询',
          startTime: '2019-12-15 14:00:00',
          endTime: '2019-12-15 16:00:00',
          address: '湖北省武汉市汉南区法律服务中心',
          contactPerson: '李四',
          contactInfo: '13999999999',
          registrationCount: 150,
          publishTime: '2019/12/13 09:30',
          viewCount: 1200,
          status: '进行中'
        },
        {
          id: 4,
          title: '农业政策解读会',
          activityType: '政策解读',
          startTime: '2019-12-20 09:00:00',
          endTime: '2019-12-20 12:00:00',
          address: '湖北省武汉市汉南区农业局会议室',
          contactPerson: '赵六',
          contactInfo: '13777777777',
          registrationCount: 80,
          publishTime: '2019/12/18 15:20',
          viewCount: 800,
          status: '已取消'
        }
      ],
      total: 4
    };
    
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    
    tableData.value = mockData.rows;
    total.value = mockData.total;
  } catch (error) {
    ElMessage.error('获取普法活动列表失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

/** 获取状态标签类型 */
const getStatusType = (status: string) => {
  switch (status) {
    case '待开始':
      return 'primary';
    case '进行中':
      return 'success';
    case '已结束':
      return 'danger';
    case '已取消':
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
  router.push('/expertServicePlatform/legalServiceManage/addActivity');
};

/** 删除按钮事件 */
const handleDelete = () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要删除的活动');
    return;
  }
  
  ElMessageBox.confirm(
    `确定要删除选中的${selectedIds.value.length}个活动吗？`,
    '系统提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    ElMessage.success(`成功删除${selectedIds.value.length}个活动`);
    getList();
  }).catch(() => {
    ElMessage.info('已取消删除');
  });
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
const handleCancelActivity = (row: any) => {
  ElMessageBox.confirm(
    `确定要取消活动"${row.title}"吗？`,
    '系统提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    ElMessage.success('活动取消成功');
    getList();
  }).catch(() => {
    ElMessage.info('已取消操作');
  });
};

/** 单个删除事件 */
const handleDeleteSingle = (row: any) => {
  ElMessageBox.confirm(
    `确定要删除活动"${row.title}"吗？`,
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
