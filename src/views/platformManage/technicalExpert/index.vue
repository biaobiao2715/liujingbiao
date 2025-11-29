<!--
标题: technicalExpertIndex.vue
功能: 技术专家审核
说明: 用于展示技术专家的列表和查询功能。
开发信息: Create by 李刘超 2025-10-17 16:59:29
当前版本: 1.0
-->

<template>
  <div class="p-2 technical-expert-page">
    <!-- 查询区域 -->
    <div class="mb-[10px]">
      <el-form ref="queryFormRef" :model="queryParams" inline :label-width="80">
        <el-form-item label="专家姓名" prop="name">
          <el-input v-model="queryParams.expertName" placeholder="请输入专家姓名" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="专家编号" prop="expertNumber">
          <el-input v-model="queryParams.expertNumber" placeholder="请输入专家编号" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="入驻时间">
          <el-date-picker
            v-model="registrationTime"
            type="daterange"
            value-format="YYYY-MM-DD"
            range-separator=" - "
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            @change="handleSelectDate"
          />
        </el-form-item>
        <el-form-item label="审核状态" prop="auditStatus">
          <el-select v-model="queryParams.reviewStatus" placeholder="全部" filterable clearable>
            <el-option v-for="dict in review_status" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">查询</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 表格 -->
      <el-table ref="tableRef" :data="list" border :header-cell-style="{ fontWeight: 500 }" v-loading="loading">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column label="专家姓名" prop="expertName" align="center" :show-overflow-tooltip="true" />
        <el-table-column label="专家编号" prop="expertNumber" align="center" :show-overflow-tooltip="true">
          <template #default="scope">
            <el-link type="primary" @click="handleEdit(scope.row, 'view')">{{ scope.row.expertNumber }}</el-link>
          </template>
        </el-table-column>
        <el-table-column label="联系电话" prop="contactPhone" align="center" :show-overflow-tooltip="true" />
        <el-table-column label="入驻时间" prop="registrationTime" align="center" width="180">
          <template #default="scope">
            {{ scope.row.registrationTime || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="审核状态" prop="reviewStatus" align="center">
          <!-- <template #default="scope">
            <el-button type="primary">{{ review_status?.find((item) => item.value === scope.row.reviewStatus)?.label || '--' }}</el-button>
          </template> -->
          <template #default="scope">
            <div class="workingMode">
              <div
                v-if="scope.row.reviewStatus != null"
                class="normal"
                :class="{
                  reviewRejected: scope.row.reviewStatus == 2,
                  green: scope.row.reviewStatus == 1,
                  pendingReview: scope.row.reviewStatus == 0
                }"
              ></div>
              <span v-if="scope.row.reviewStatus == 0" style="color: #ff7b00">待审核</span>
              <span v-if="scope.row.reviewStatus == 1" style="color: #108c58">审核通过</span>
              <span v-if="scope.row.reviewStatus == 2" style="color: #f23255">审核退回</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="入库状态" prop="storageStatus" align="center">
          <!-- <template #default="scope">
            {{ scope.row.storageStatus === '0' ? '未入库' : '已入库' }}
          </template> -->
          <template #default="scope">
            <div class="workingMode">
              <div
                v-if="scope.row.storageStatus != null"
                class="normal"
                :class="{
                  pendingReview: scope.row.storageStatus == 0,
                  green: scope.row.storageStatus == 1
                }"
              ></div>
              <span v-if="scope.row.storageStatus == 0" style="color: #ff7b00">未入库</span>
              <span v-if="scope.row.storageStatus == 1" style="color: #108c58">已入库</span>
              <!-- <span v-if="scope.row.storageStatus == 1" style="color: #108c58">已入库</span> -->
            </div>
          </template>
        </el-table-column>

        <el-table-column label="操作" align="center" fixed="right" width="200">
          <template #default="scope">
            <div style="display: flex; justify-content: center; align-items: center">
              <el-button type="text" style="font-size: 14px; color: #108c58" @click="openToggleDialog(scope.row)">
                {{ scope.row.startStopStatus === '1' ? '停用' : '启用' }}
              </el-button>
              <el-button
                v-throttle
                type="text"
                v-if="scope.row.reviewStatus !== '0'"
                v-hasPermi="['system:baseTechExpertInfo:list']"
                @click="handleEdit(scope.row, 'view')"
                style="font-size: 14px; color: #108c58"
                >查看</el-button
              >
              <el-button
                v-throttle
                v-if="scope.row.reviewStatus === '0'"
                type="text"
                style="font-size: 14px; color: #108c58"
                v-hasPermi="['system:baseEnterpriseInfo:edit']"
                @click="handleEdit(scope.row, 'audit')"
                >审核</el-button
              >
              <!-- <el-link
                  type="primary"
                  v-if="scope.row.reviewStatus !== '0'"
                  v-hasPermi="['system:baseEnterpriseInfo:edit']"
                  @click="handleEdit(scope.row, 'edit')"
                  >编辑</el-link
                > -->
            </div>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="total > 0"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        :total="total"
        @pagination="handleQuery"
      />
      <el-dialog v-model="toggleDialogVisible" width="30%">
        <template #header>
          <span>{{ toggleDialogData.startStopStatus === '1' ? '停用' : '启用' }}</span>
        </template>
        <div>{{ toggleDialogData.startStopStatus === '1' ? '请确认是否停用该专家信息?' : '请确认是否启用该专家信息？' }}</div>
        <template #footer>
          <el-button @click="closeToggleDialog">取消</el-button>
          <el-button type="primary" @click="confirmToggle" :loading="loadingStatus">确定</el-button>
        </template>
      </el-dialog>
    </div>
    <EditDetails ref="editDetailsRef" @refresh="refreshData" />
  </div>
</template>

<script setup name="TechnicalExpert" lang="ts">
import { getTechnicalExpertList, techUpdateOrSaveData } from '@/api/platform/technicalExpert';
import { TechnicalExpertListRequest, TechnicalExpertList } from '@/api/platform/technicalExpert/types';
import { ComponentInternalInstance, getCurrentInstance, reactive, ref, toRefs } from 'vue';
import EditDetails from './editDetails.vue';

const editDetailsRef = ref<any>();

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { review_status, plat_qualification_grade, plat_credit_rating } = toRefs<any>(
  proxy?.useDict('review_status', 'plat_qualification_grade', 'plat_credit_rating')
);
// 查询参数
const registrationTime = ref<Array<string>>([]);
const queryParams = reactive<TechnicalExpertListRequest>({
  expertName: '',
  registrationTime: [],
  reviewEndTime: '',
  reviewStatus: '',
  pageNum: 1,
  pageSize: 10
});
// 停用/启用弹窗相关
const loadingStatus = ref(false);
const toggleDialogVisible = ref(false);
const toggleDialogData = ref<TechnicalExpertList>({} as TechnicalExpertList);
const openToggleDialog = (row: TechnicalExpertList) => {
  toggleDialogData.value = row;
  toggleDialogVisible.value = true;
};
const closeToggleDialog = () => {
  toggleDialogVisible.value = false;
};
// 确认停用/启用操作
const confirmToggle = async () => {
  if (loadingStatus.value || !toggleDialogData.value.id) return;
  loadingStatus.value = true;

  // 当前状态为启用(1)时，执行停用操作；当前状态为停用(0)时，执行启用操作
  const isEnabled = toggleDialogData.value.startStopStatus === '1';
  const res = await techUpdateOrSaveData({
    optType: isEnabled ? '5' : '4', // 停用传5，启用传4
    hnBaseTechExpertInfoBo: {
      id: toggleDialogData.value.id
    }
  }).finally(() => {
    loadingStatus.value = false;
    closeToggleDialog();
  });

  if (res.code === 200) {
    // 修复提示信息反向问题：停用成功显示"已停用"，启用成功显示"已启用"
    proxy?.$modal.msgSuccess(isEnabled ? '已停用' : '已启用');

    // 更新列表数据状态
    const index = list.value.findIndex((item) => item.id === toggleDialogData.value.id);
    if (index !== -1) {
      list.value[index].startStopStatus = isEnabled ? '0' : '1';
    }
    getList();
  }
};

// 列表与分页
const list = ref<TechnicalExpertList[]>([]);
const total = ref(0);
const tableRef = ref();
const queryFormRef = ref();
const loading = ref(false);

const getList = () => {
  loading.value = true;
  getTechnicalExpertList({
    ...queryParams,
    registrationTime: undefined
  })
    .then((res) => {
      if (res.code === 200) {
        list.value = res.rows || [];
        total.value = res.total || 0;
      }
    })
    .finally(() => {
      loading.value = false;
    });
};

// 刷新数据
const refreshData = () => {
  getList();
};

// 查询
const handleQuery = () => {
  getList();
};

// 重置
const resetQuery = () => {
  registrationTime.value = [];
  queryParams.expertName = '';
  queryParams.reviewStartTime = '';
  queryParams.reviewEndTime = '';
  queryParams.reviewStatus = '';
  queryParams.expertNumber = '';
  queryParams.pageNum = 1;
  handleQuery();
};

const handleSelectDate = (val: any) => {
  queryParams.reviewStartTime = val?.[0] || '';
  queryParams.reviewEndTime = val?.[1] || '';
};

const handleEdit = (row: any, type: 'view' | 'edit' | 'audit') => {
  // TODO: 跳转编辑页面或弹出编辑弹窗携带type参数
  editDetailsRef.value.handleOpenDialog(row.id, type);
  //   router.push({
  //     path: '/platform/technicalExpert/details',
  //     query: {
  //       id: row.id,
  //       type
  //     }
  //   });
};
// 初始化

// 每次页面激活时执行（从缓存中恢复）
onActivated(() => {
  handleQuery();
});
onMounted(() => {
  handleQuery();
});
</script>

<style scoped lang="scss">
.technical-expert-page {
  .table-header {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  padding: 24px;
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
</style>
