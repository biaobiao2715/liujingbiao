<!-- 
标题：			index.vue
功能：			培训会议管理
说明:         
当前版本：	1.0
开发信息：	Created by 张峰 2025-10-31
修改人信息：张峰     2025-11-4
修改内容：时间查询支持到分钟
 -->
<template>
  <div class="supplier-management">
    <!-- 搜索条件 -->
    <el-form ref="queryFormRef" :model="queryParams" inline :label-width="100">
      <el-form-item label="会议标题">
        <el-input v-model="queryParams.meetingName" placeholder="请输入会议标题" clearable />
      </el-form-item>
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
      <el-form-item label="发布人">
        <el-input v-model="queryParams.publishUser" placeholder="请输入发布人" clearable />
      </el-form-item>
      <el-form-item label="所属类型">
        <el-select v-model="queryParams.meetingType" filterable clearable placeholder="请选择所属类别">
          <el-option v-for="dict in meeting_type" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="所属状态">
        <el-select v-model="queryParams.meetingStatus" filterable clearable placeholder="请选择所属状态">
          <el-option v-for="dict in meeting_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button v-throttle type="primary" @click="handleQuery">查询</el-button>
        <el-button v-throttle @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <div class="mb-12">
      <el-button v-throttle type="primary" v-hasPermi="['skill:HnMeetingCultivate:add']" @click="handleAdd">新增</el-button>
      <el-button
        v-throttle
        type="danger"
        v-hasPermi="['skill:HnMeetingCultivate:remove']"
        :disabled="selectedRows.length == 0"
        @click="handleBatchDelete(selectedRows)"
        >删除</el-button
      >
    </div>
    <!-- 表格展示 -->
    <el-table :data="tableData" border v-loading="loading" style="width: 100%" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column type="index" label="序号" width="55" align="center" />
      <el-table-column label="会议开始时间" align="center" prop="meetingStartTime" width="180" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.meetingStartTime || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="会议结束时间" align="center" prop="meetingEndTime" width="180" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.meetingEndTime || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="会议标题" align="center" prop="meetingName" :show-overflow-tooltip="true" min-width="120">
        <template #default="scope">
          <span>{{ scope.row.meetingName || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="会议地址" align="center" prop="meetingAddress" :show-overflow-tooltip="true" min-width="120">
        <template #default="scope">
          <span>{{ scope.row.meetingAddress || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="所属类型" align="center" prop="meetingType" width="100">
        <template #default="scope">
          <dict-tag :options="meeting_type" :value="scope.row.meetingType" />
        </template>
      </el-table-column>
      <el-table-column label="联系人" align="center" prop="meetingContact" :show-overflow-tooltip="true" min-width="120">
        <template #default="scope">
          <span>{{ scope.row.meetingContact || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="联系方式" align="center" prop="meetingPhone" :show-overflow-tooltip="true" min-width="120">
        <template #default="scope">
          <span>{{ scope.row.meetingPhone || '-' }}</span>
        </template>
      </el-table-column>

      <el-table-column label="报名人数" align="center" prop="enrollCount" width="120">
        <template #default="scope">
          <span>{{ scope.row.enrollCount || '0' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="发布时间" align="center" prop="publishTime" width="120" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ scope.row.publishTime || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="浏览量" align="center" prop="pageViews" width="120">
        <template #default="scope">
          <span>{{ scope.row.pageViews || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="所属状态" align="center" prop="meetingStatus" width="100">
        <template #default="scope">
          <dict-tag :options="meeting_status" :value="scope.row.meetingStatus" />
        </template>
      </el-table-column>

      <el-table-column label="发布人" align="center" prop="publishUser" width="120" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ scope.row.publishUser || '-' }}</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="200">
        <template #default="scope">
          <div style="display: flex; justify-content: space-evenly; align-items: center">
            <!-- 待开始 -->
            <template v-if="scope.row.meetingStatus === '1'">
              <el-link v-hasPermi="['skill:HnMeetingCultivate:edit']" type="primary" :disabled="editLoading" @click="handleEdit(scope.row)">
                <span v-if="editLoading && currentLoadingId === scope.row.id">加载中...</span>
                <span v-else>编辑</span>
              </el-link>
              <el-link type="primary" :disabled="detailLoading" @click="handleView(scope.row)">
                <span v-if="detailLoading && currentLoadingId === scope.row.id">加载中...</span>
                <span v-else>查看</span>
              </el-link>
              <el-link v-hasPermi="['skill:HnMeetingCultivate:cancel']" type="primary" @click="handleCancelMeeting(scope.row)">取消会议</el-link>
              <!-- <el-link v-hasPermi="['skill:HnMeetingCultivate:remove']" type="danger" @click="handleDelete(scope.row)">删除</el-link> -->
            </template>

            <!-- 进行中、已结束、已取消 -->
            <template v-else-if="['2', '3', '99'].includes(scope.row.meetingStatus)">
              <el-link type="primary" :disabled="detailLoading" @click="handleView(scope.row)">
                <span v-if="detailLoading && currentLoadingId === scope.row.id">加载中...</span>
                <span v-else>查看</span>
              </el-link>
              <el-link v-if="['3', '99'].includes(scope.row.meetingStatus)" v-hasPermi="['skill:HnMeetingCultivate:remove']" type="danger" @click="handleDelete(scope.row)">删除</el-link>
            </template>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <div class="flex-center pagination">
      <pagination
        v-show="total > 0"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        v-model:total="total"
        @pagination="getTableData"
      />
    </div>
  </div>
  <AddMeeting v-model="visible" :mode="dialogMode" :data="meetingData" @save="handleSave" />
  <!-- 取消会议 -->
  <el-dialog title="取消会议" v-model="dialogVisible" width="30%">
    <el-input type="textarea" :rows="2" placeholder="请输入取消原因" v-model="cancellation" max="200"></el-input>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="cancelloading" @click="Confirmcancel">确 定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, onActivated, getCurrentInstance } from 'vue';
import { toRefs } from '@vueuse/core';
import type { ComponentInternalInstance } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import axios from 'axios';
import router from '@/router';
// 确保引入 axios
import {
  getHnMeetingCultivateList,
  deleteHnMeetingCultivate,
  cancelHnMeetingCultivate,
  getHnMeetingCultivatedetail
} from '@/api/skill/HnMeetingCultivate';
// import { getProductAttributesList } from '@/api/platform/mallConfiguration/productAttributeLabel';
import AddMeeting from './Add.vue';

const getProductAttributesList = async (params: any) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        rows: []
      });
    }, 500);
  });
};

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { meeting_status } = toRefs<any>((proxy as any)?.useDict('meeting_status')); //会议状态
const { meeting_type } = toRefs<any>((proxy as any)?.useDict('meeting_type')); //会议类别

const productBrandList = ref([]); // 商品品牌列表

const tableData = ref([]); // 表格数据

const dialogVisible = ref(false); //取消会议确认框

const total = ref(0); // 总条数

const loading = ref(false); // 加载中

const queryFormRef = ref(); // 查询表单ref

const dateRange = ref<string[]>([]); // 会议日期范围

const selectedRows = ref([]); // 选中的表格数据
const selectedIds = ref([]); //选中数据的Id
const cancellation = ref(); //取消原因
// 当前选中的 Tab
const activeTab = ref('all');

const cancelobj = ref(); //取消会议row

const cancelloading = ref(false); //取消loading
const detailLoading = ref(false); // 详情加载状态
const editLoading = ref(false); // 编辑加载状态
const currentLoadingId = ref(''); // 当前正在加载的会议ID
const shipmentVisible = ref(false); //发货弹窗
const shipmentloading = ref(false); //发货确认loading
const logisticsVisible = ref(false); //是否展示物流信息
const shipmentFormFormRef = ref(null);
const logisticsFormFormRef = ref(null);
/* 发货的row */
const rowdata = ref();
const visible = ref(false); //新增编辑弹窗
const dialogMode = ref(); //弹窗类型
const meetingData = ref({}); //弹窗数据
// 搜索表单数据
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  meetingType: '', //会议类别
  publishTime: '', //发布时间
  publishUser: '', //发布人
  meetingStatus: '', //会议状态
  meetingName: '', // 会议标题
  meetingEndTime: '', // 会议结束时间
  meetingStartTime: '', // 会议开始时间
  orderByColumn:'publishTime', // 需要排序的列名
  isAsc:'desc' // 排序方式
});
/* 发货配送信息 */
const shipmentForm = ref({
  deliveryOptions: '' //配送方式
});
/* 物流信息 */
const logisticsForm = ref({
  deliveryCompany: '', //快递公司
  deliverySn: '' //物流单号
});
const options = ref([
  {
    value: '1',
    label: '同城自提'
  },
  {
    value: '2',
    label: '快递'
  }
]);
onMounted(() => {
  getTableData();
});

// 处理日期选择事件
const handleSelectDate = (val: string[]) => {
  queryParams.value.meetingStartTime = val?.[0] || '';
  queryParams.value.meetingEndTime = val?.[1] || '';
};

const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getTableData();
};

/** 重置按钮操作 */
const handleReset = () => {
  queryParams.value = {
    pageNum: 1,
    pageSize: 10,
    meetingType: '', //会议类别
    publishTime: '', //发布时间
    publishUser: '', //发布人
    meetingStatus: '', //会议状态
    meetingName: '', // 会议标题
    meetingEndTime: '', // 会议结束时间
    meetingStartTime: '', // 会议开始时间
    orderByColumn:'publishTime', // 需要排序的列名
    isAsc:'desc' // 排序方式
  };
  dateRange.value = [];
  getTableData();
};

/* 新增 */
const handleAdd = () => {
  dialogMode.value = 'add';
  meetingData.value = {};
  visible.value = true;
};
// 导出按钮操作
// const handleExport = async () => {
//   if (selectedRows.value.length === 0) {
//     ElMessage.error('请先选择要导出的数据');
//     return;
//   }
//   loading.value = true;
//   const ids = selectedRows.value.map((row) => row.id);
//   try {
//     const res: any = await exportGoodsPriceHistory({ ids: ids.join() });
//     if (res) {
//       // 创建 Blob 对象
//       const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
//       const link = document.createElement('a');
//       link.href = URL.createObjectURL(blob);
//       link.download = '商品价格调整历史.xlsx';
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       URL.revokeObjectURL(link.href); // 释放 URL 对象
//     } else {
//       ElMessage.error('导出失败，未返回有效数据');
//     }
//   } catch (error) {
//     console.error('导出失败:', error);
//     ElMessage.error('导出失败，请稍后重试');
//   } finally {
//     loading.value = false;
//   }
// };
// 表格选择变化事件
const handleSelectionChange = (selection) => {
  selectedIds.value = selection.map((item) => item.id);
  selectedRows.value = selection;
};
// 获取销售订单列表
const getTableData = async () => {
  loading.value = true;
  try {
    const res: any = await getHnMeetingCultivateList(queryParams.value);
    if (res.code === 200) {
      tableData.value = res.rows || [];
      total.value = res.total || 0;
      console.log('会议列表数据:', tableData.value);
    } else {
      ElMessage.error(res.msg || '获取培训会议列表数据失败');
    }
  } catch (error) {
    console.error('查询培训会议列表数据失败:', error);
    ElMessage.error('查询培训会议列表数据失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

/** 查看会议详情 */
const handleView = async (row: any) => {
  detailLoading.value = true;
  currentLoadingId.value = row.id;
  try {
    let params = {
      isView: true,
      id: row.id
    };
    let res = await getHnMeetingCultivatedetail(params);
    dialogMode.value = 'view';
    meetingData.value = res;
    visible.value = true;
  } catch (error) {
    ElMessage.error(error);
  } finally {
    // 清除 loading 状态
    detailLoading.value = false;
    currentLoadingId.value = '';
  }
};
/* 编辑会议 */
const handleEdit = async (row: any) => {
  editLoading.value = true;
  currentLoadingId.value = row.id;
  try {
    let params = {
      isView: false,
      id: row.id
    };
    let res = await getHnMeetingCultivatedetail(params);
    dialogMode.value = 'edit';
    meetingData.value = res;
    visible.value = true;
  } catch (error) {
    ElMessage.error(error);
  } finally {
    // 清除 loading 状态
    editLoading.value = false;
    currentLoadingId.value = '';
  }
};
/* 取消会议 */
const handleCancelMeeting = (row: any) => {
  dialogVisible.value = true;
  cancelobj.value = row;
};
/* 确认取消 */
const Confirmcancel = async () => {
  cancelloading.value = true;
  console.log(cancelobj.value);
  if (!cancellation.value) {
    return ElMessage.warning('请输入取消原因');
  }
  try {
    let params = {
      ids: [cancelobj.value.id],
      cancelReason: cancellation.value.trim()
    };
    await cancelHnMeetingCultivate(params);
    ElMessage.success('取消会议成功');
    dialogVisible.value = false; // 关闭对话框
    cancellation.value = ''; // 清空输入
    getTableData(); // 刷新列表
  } catch (error) {
    console.error('取消会议失败', error);
    ElMessage.error(error || '取消会议失败，请稍后重试');
  } finally {
    cancelloading.value = false;
  }
};
/* 删除 */
const handleDelete = async (row: any) => {
  console.log('row.id', row.id);
  try {
    await ElMessageBox.confirm(`是否确认删除？`, '操作确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    // 用户点击“确定”后才执行
    await deleteHnMeetingCultivate([row.id]);

    ElMessage.success('删除成功');
    getTableData(); //刷新列表
  } catch (err) {
    // 用户取消 or 请求异常
    console.error('删除失败', err);
  }
};
// 批量删除函数
const handleBatchDelete = async (selectedRows: any[]) => {
  if (!selectedRows.length) {
    ElMessage.warning('请选择要删除的数据');
    return;
  }

  try {
    await ElMessageBox.confirm(`是否确认删除选中的 ${selectedRows.length} 条数据？`, '操作确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    // 批量删除
    const ids = selectedRows.map((row) => row.id);
    await deleteHnMeetingCultivate(ids);

    ElMessage.success(`成功删除 ${selectedRows.length} 条数据`);
    getTableData(); //刷新列表
  } catch (err) {
    console.error('批量删除失败', err);
  }
};
onMounted(() => {
  getTableData();
});

// 每次页面激活时执行（从缓存中恢复）
onActivated(() => {
  getTableData();
});

const handleSave = (data: any) => {
  getTableData();
};
</script>

<style scoped lang="scss">
.supplier-management {
  padding: 24px;
}

.pagination {
  margin-top: 24px;
  justify-content: end;
}

.order-tabs {
  margin: 12px 0 20px 0;

  :deep(.el-tabs__header) {
    margin-bottom: 0;
  }
}

// 金额样式
.amount-text {
  color: #f56c6c;
  font-weight: 600;
  font-size: 14px;
}

// 表格样式优化
:deep(.el-table) {
  .el-table__header {
    th {
      background-color: #f5f7fa;
      color: #606266;
      font-weight: 600;
    }
  }

  .el-table__row {
    &:hover {
      background-color: #f5f7fa;
    }
  }
}

// 状态标签样式
:deep(.el-tag) {
  font-weight: 500;
  border: none;
}
</style>
