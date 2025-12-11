<!--
  标题: enterprise/index.vue
  功能: 专家培训会议
  说明: 用于专家培训会议管理，包括查询、编辑等操作
  当前版本: 1.0
  开发信息: Created by 刘景彪 2025-10-15
-->
<template>
  <div class="meeting-management">
    <!-- 搜索条件 -->
    <el-form ref="queryFormRef" :model="queryParams" inline label-position="left">
      <el-form-item label="所属类别" prop="meetingType" label-width="auto">
        <el-select v-model="queryParams.meetingType" placeholder="请选择" clearable>
          <el-option v-for="item in meeting_type" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="发布人" prop="publishUser" label-width="auto">
        <el-input v-model="queryParams.publishUser" placeholder="请输入发布人姓名" clearable />
      </el-form-item>
      <el-form-item label="会议标题" prop="meetingName" label-width="auto">
        <el-input v-model="queryParams.meetingName" placeholder="请输入会议标题" clearable />
      </el-form-item>
      <!-- <el-form-item label="报名状态" prop="applicationStatus" label-width="auto">
        <el-select v-model="queryParams.applicationStatus" placeholder="请选择" clearable>
          <el-option v-for="item in enroll_status" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item> -->
      <el-form-item label="所属状态" prop="meetingStatus" label-width="auto">
        <el-select v-model="queryParams.meetingStatus" placeholder="请选择" clearable>
          <el-option v-for="item in meeting_status" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="发布时间" prop="publishTime" label-width="auto">
        <el-date-picker
          v-model="queryParams.publishTime"
          type="datetimerange"
          value-format="YYYY-MM-DD HH:mm:ss"
          format="YYYY-MM-DD HH:mm:ss"
          range-separator=" - "
          start-placeholder="开始时间"
          end-placeholder="结束时间"
        />
      </el-form-item>
      <el-form-item>
        <el-button icon="Search" type="primary" @click="handleSearch">查询</el-button>
        <el-button icon="Refresh" @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格展示 -->
    <el-table :data="tableData" v-loading="loading" style="width: 100%">
      <el-table-column type="index" label="序号" width="55" />
      <el-table-column label="会议开始时间" prop="meetingStartTime" min-width="160">
        <template #default="scope">
          <span>{{ scope.row.meetingStartTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="会议结束时间" prop="meetingEndTime" min-width="160">
        <template #default="scope">
          <span>{{ scope.row.meetingEndTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="会议标题" prop="meetingName" min-width="120" :show-overflow-tooltip="true" />
      <el-table-column label="会议地址" prop="meetingAddress" min-width="160" :show-overflow-tooltip="true" />
      <el-table-column label="所属分类" align="center" prop="meetingType" min-width="100">
        <template #default="scope">
          <dict-tag :options="meeting_type" :value="scope.row.meetingType" />
        </template>
      </el-table-column>
      <el-table-column label="联系方式" prop="meetingPhone" min-width="120" />
      <el-table-column label="发布人" prop="publishUser" min-width="120" />
      <!-- <el-table-column label="报名状态" align="center" prop="enrollStatus" min-width="80">
        <template #default="scope">
          <dict-tag :options="enroll_status" :value="scope.row.enrollStatus" />
        </template>
      </el-table-column> -->
      <!-- <el-table-column label="浏览量" prop="pageViews" min-width="80" />
      <el-table-column label="报名人数" prop="enrollCount" min-width="80" /> -->
      <el-table-column label="发布时间" prop="publishTime" min-width="160">
        <template #default="scope">
          <span>{{ scope.row.publishTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="meetingStatus" min-width="80">
        <!-- <template #default="scope">
          <dict-tag :options="meeting_status" :value="scope.row.meetingStatus" />
        </template> -->
        <template #default="scope">
          <div class="flex-center-center">
            <div
              v-if="scope.row.meetingStatus != null"
              class="normal"
              :class="{
                green: scope.row.meetingStatus == 2,
                reviewRejected: scope.row.meetingStatus == 3 || scope.row.meetingStatus == 99,
                pendingReview: scope.row.meetingStatus == 1
              }"
            ></div>
            <span v-if="scope.row.meetingStatus == 1" class="pendingReview-color">待开始</span>
            <span v-if="scope.row.meetingStatus == 2" class="green-color">进行中</span>
            <span v-if="scope.row.meetingStatus == 3" class="reviewRejected-color">已结束</span>
            <span v-if="scope.row.meetingStatus == 99" class="reviewRejected-color">已取消</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" width="120">
        <template #default="scope">
          <el-button type="primary" link @click="handleView(scope.row)">查看</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="flex-center pagination">
      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </div>

    <el-dialog
      class="dialog-preview"
      :title="dlgTitle"
      v-model="dlgPreviewVisible"
      :before-close="cancelDlg"
      :close-on-click-modal="true"
      :destroy-on-close="true"
      append-to-body
      width="50%"
    >
      <Details :id="selectID" :type="selectType" @refresh="refreshData" @cancel="cancelDlg" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance, toRefs, onMounted, onActivated, type ComponentInternalInstance } from 'vue';
import { listHnMeetingCultivate } from '@/api/expertServicePlatform/trainingMeeting/index';
import Details from './Details.vue';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { meeting_status, meeting_type, enroll_status } = toRefs<any>(proxy?.useDict('meeting_status', 'meeting_type', 'enroll_status'));

// 搜索表单数据
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  meetingType: '',
  publishTime: [],
  publishUser: '',
  meetingName: '',
  // applicationStatus: '',
  meetingStatus: ''
});

// 表格数据
const tableData = ref([]);
const total = ref(0);
const loading = ref(true);
const queryFormRef = ref();
// 对话框相关状态
const dlgPreviewVisible = ref(false);
const dlgTitle = ref('');
const isReadonly = ref(false);
const selectID = ref<string | number>('');
const selectType = ref<'view' | 'edit' | 'audit'>('view');

/** 查询企业列表 */
const getList = () => {
  loading.value = true;
  const { publishTime, ...rest } = queryParams.value as any;
  const [startTime, endTime] = Array.isArray(publishTime) ? publishTime : [];
  const params = { ...rest, ...(startTime && endTime ? { startTime, endTime } : {}) };

  listHnMeetingCultivate(params).then((res) => {
    tableData.value = res.rows;
    total.value = res.total;
    loading.value = false;
  });
};

// 查询按钮事件
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
  handleQuery();
};

// 打开对话框：审核/查看/编辑
const handleEdit = (row: any, type: 'view' | 'edit' | 'audit') => {
  selectID.value = row.id;
  selectType.value = type;
  isReadonly.value = type === 'view';
  dlgTitle.value = type === 'audit' ? '企业审核' : type === 'edit' ? '企业编辑' : '企业详情';
  dlgPreviewVisible.value = true;
};

// 关闭对话框
const cancelDlg = () => {
  dlgPreviewVisible.value = false;
};

// 子组件刷新回调
const refreshData = () => {
  dlgPreviewVisible.value = false;
  getList();
};

// 每次页面激活时执行（从缓存中恢复）
onActivated(() => {
  getList();
});

onMounted(() => {
  getList();
});

const getStatusLabel = (status: string) => {
  if (status === '0') return '待开始';
  if (status === '1') return '已结束';
  if (status === '2') return '已开始';
  return '';
};
const getStatusStyle = (status: string) => {
  if (status === '0') return 'color:#1890ff;';
  if (status === '1') return 'color:#ff4d4f;';
  if (status === '2') return 'color:#faad14;';
  return '';
};

const handleView = (row: any) => {
  selectID.value = row.id;
  selectType.value = 'view';
  dlgTitle.value = '会议详情';
  dlgPreviewVisible.value = true;
};
</script>

<style scoped lang="scss">
.meeting-management {
  min-height: calc(100vh - 120px);
  padding: 24px;
}
.pagination {
  margin-top: 24px;
  justify-content: end;
}
</style>
