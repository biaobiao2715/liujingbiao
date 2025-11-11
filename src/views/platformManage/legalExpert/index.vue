<!-- 
标题: legalExpertIndex.vue
功能: 法务专家审核
说明: 用于展示法务专家的列表和查询功能。
开发信息: Create by 李刘超 2025-10-17 16:59:29
当前版本: 1.0
-->

<template>
  <div class="p-2 legal-expert-page">
    <el-card shadow="hover">
      <!-- 查询区域 -->
      <div class="mb-[10px]">
        <el-form ref="queryFormRef" :model="queryParams" inline :label-width="80">
          <el-form-item label="专家姓名" prop="expertName">
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
          <el-form-item label="审核状态" prop="reviewStatus">
            <el-select v-model="queryParams.reviewStatus" placeholder="审核状态" filterable clearable>
              <el-option v-for="dict in review_status" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button v-throttle type="primary" icon="Search" @click="handleQuery">查询</el-button>
            <el-button v-throttle icon="Refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      <!-- 列表区域 -->
      <el-table
        ref="tableRef"
        v-loading="loading"
        border
        :data="expertList.slice((queryParams.pageNum - 1) * queryParams.pageSize, queryParams.pageNum * queryParams.pageSize)"
        style="width: 100%"
      >
        <!-- <el-table-column type="selection" width="45" align="center" /> -->
        <el-table-column label="序号" width="60" align="center">
          <template #default="scope">
            <span>{{ (queryParams.pageNum - 1) * queryParams.pageSize + scope.$index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="expertName" label="专家名称" min-width="100" align="center" />
        <el-table-column label="专家编码" min-width="140" align="center">
          <template #default="scope">
            <el-link type="primary">{{ scope.row.expertNumber || '--' }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="phoneNumber" label="联系电话" min-width="130" align="center" />
        <el-table-column prop="registrationTime" label="入驻时间" min-width="160" align="center" />
        <el-table-column label="审核状态" min-width="120" align="center" prop="reviewStatus">
          <template #default="scope">
            {{ reviewStatusMap[scope.row.reviewStatus] || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="入库状态" min-width="100" align="center" prop="storageStatus">
          <template #default="scope">
            <span v-if="scope.row.storageStatus === '0'">待入库</span>
            <span v-else-if="scope.row.storageStatus === '1'">已入库</span>
            <span v-else>入库失败</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="200">
          <template #default="scope">
            <div style="display: flex; justify-content: space-evenly; align-items: center">
              <el-link type="primary" @click="openToggleDialog(scope.row)">
                {{ scope.row.startStopStatus === '1' ? '停用' : '启用' }}
              </el-link>
              <el-button
                v-throttle
                type="primary"
                v-if="scope.row.reviewStatus !== '0'"
                v-hasPermi="['system:baseLegalExpertInfo:query']"
                @click="handleEdit(scope.row, 'view')"
                >查看</el-button
              >
              <el-button
                v-throttle
                v-if="scope.row.reviewStatus === '0'"
                type="primary"
                v-hasPermi="['system:baseLegalExpertInfo:process']"
                @click="handleEdit(scope.row, 'audit')"
                >审核</el-button
              >
              <!-- <el-link
                type="primary"
                v-if="scope.row.reviewStatus === '0'"
                v-hasPermi="['system:baseTechExpertInfo:process']"
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
    </el-card>
    <EditDetails ref="editDetailsRef" />
  </div>
</template>

<script setup name="LegalExpert" lang="ts">
import { ref } from 'vue';
import { LegalExpertListRequest, LegalExpertList } from '@/api/platform/legalExpert/types';
import { getLegalExpertList, legalUpdateOrSaveData, reviewStatusMap } from '@/api/platform/legalExpert';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { review_status } = toRefs<any>(proxy?.useDict('review_status'));
const toggleDialogVisible = ref(false);
const toggleDialogData = ref<LegalExpertList>({} as LegalExpertList);
const expertList = ref<LegalExpertList[]>([]);
import EditDetails from './editDetails.vue';
const editDetailsRef = ref(null);
const loading = ref(false);
const openToggleDialog = (row: LegalExpertList) => {
  toggleDialogData.value = row;
  toggleDialogVisible.value = true;
};
const total = ref(0); // 确认停用/启用操作
// 停用/启用弹窗相关
const loadingStatus = ref(false);
const closeToggleDialog = () => {
  toggleDialogVisible.value = false;
};
const confirmToggle = async () => {
  if (loadingStatus.value || !toggleDialogData.value.id) return;
  loadingStatus.value = true;

  // 当前状态为启用(1)时，执行停用操作；当前状态为停用(0)时，执行启用操作
  const isEnabled = toggleDialogData.value.startStopStatus === '1';
  const res = await legalUpdateOrSaveData({
    optType: isEnabled ? '5' : '4', // 停用传5，启用传4
    hnBaseLegalExpertInfoBo: {
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
    const index = expertList.value.findIndex((item) => item.id === toggleDialogData.value.id);
    if (index !== -1) {
      expertList.value[index].startStopStatus = isEnabled ? '0' : '1';
    }
    getList();
  }
};

const queryFormRef = ref<ElFormInstance>();
const tableRef = ref<ElTableInstance>();

const registrationTime = ref<Array<string>>([]);

const queryParams = ref<LegalExpertListRequest>({
  pageNum: 1,
  pageSize: 10,
  expertName: '',
  expertNumber: '',
  reviewStartTime: '',
  reviewEndTime: '',
  reviewStatus: ''
});

const getList = () => {
  loading.value = true;
  getLegalExpertList(queryParams.value)
    .then((res) => {
      expertList.value = res?.rows || [];
      total.value = res.total || 0;
    })
    .finally(() => {
      loading.value = false;
    });
};

// 搜索
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

// 重置
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  registrationTime.value = [];
  queryParams.value.expertName = '';
  queryParams.value.expertNumber = '';
  queryParams.value.reviewStartTime = '';
  queryParams.value.reviewEndTime = '';
  queryParams.value.reviewStatus = '';
  queryParams.value.pageNum = 1;
  queryParams.value.pageSize = 10;
  handleQuery();
};

const handleSelectDate = (val: Array<string>) => {
  queryParams.value.reviewStartTime = val?.[0] || '';
  queryParams.value.reviewEndTime = val?.[1] || '';
};

// 操作
const handleEdit = (row: any, type: 'view' | 'edit' | 'audit') => {
  editDetailsRef.value.handleOpenDialog(row.id, type);
};

// 每次页面激活时执行（从缓存中恢复）
onActivated(() => {
  getList();
});
</script>

<style scoped lang="scss">
.legal-expert-page {
  .table-header {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}
</style>
