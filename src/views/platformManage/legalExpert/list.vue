<!-- 
标题: legalExpertList.vue
功能: 法务专家列表
说明: 用于展示所有法务专家的信息，包括姓名、编号、入驻日期、审核状态等。
开发信息: Create by 李刘超 2025-10-17 16:57:50
当前版本: 1.0
-->

<template>
  <div class="p-2 legal-expert-page">
    <el-card shadow="hover">
      <!-- 查询区域 -->
      <div class="mb-[10px]">
        <el-form ref="queryFormRef" :model="queryParams" :inline="true">
          <el-form-item label="专家姓名" prop="expertName">
            <el-input v-model="queryParams.expertName" placeholder="请输入专家姓名" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="专家编号" prop="expertNumber">
            <el-input v-model="queryParams.expertNumber" placeholder="请输入专家编号" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="入驻日期" prop="registrationTime">
            <el-date-picker v-model="queryParams.registrationTime" type="date" placeholder="请选择" value-format="YYYY-MM-DD" clearable />
          </el-form-item>
          <el-form-item label="审核状态" prop="reviewStatus">
            <el-select v-model="queryParams.reviewStatus" placeholder="全部" clearable style="width: 140px">
              <el-option v-for="(label, value) in reviewStatusMap" :key="value" :label="label" :value="value" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">查询</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
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
        <el-table-column prop="contactPhone" label="联系电话" min-width="130" align="center" />
        <el-table-column prop="registrationTime" label="入驻时间" min-width="160" align="center" />
        <el-table-column label="审核状态" min-width="120" align="center" prop="reviewStatus">
          <template #default="scope">
            {{ reviewStatusMap[scope.row.reviewStatus] || '未知' }}
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
            <el-link type="primary" v-if="scope.row.reviewStatus === '1'" @click="open(scope.row)">{{
              scope.row.startStopStatus === '1' ? '停用' : '启用'
            }}</el-link>
            <el-link style="margin-left: 10px" type="primary" v-if="scope.row.reviewStatus === '1'" @click="handleEdit(scope.row, 'view')"
              >查看</el-link
            >
            <el-link style="margin-left: 10px" type="primary" v-if="scope.row.reviewStatus === '0'" @click="handleEdit(scope.row, 'audit')"
              >审核</el-link
            >
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
    </el-card>

    <!-- 详情占位弹窗 -->
    <el-dialog v-model="dialogVisible" width="30%">
      <template #header>
        <span>{{ startStopStatusMessage }}</span>
      </template>
      <div>{{ dialogMessage.startStopStatus === '1' ? '请确认是否停用该专家信息?' : '请确认是否启用该专家信息？' }}</div>
      <template #footer>
        <el-button @click="close">取消</el-button>
        <el-button type="primary" @click="toggleEnabled(dialogMessage)" :loading="loadingStatus"> 确定 </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="LegalExpert" lang="ts">
import { ComponentInternalInstance, getCurrentInstance, ref } from 'vue';
import { LegalExpertListRequest, LegalExpertList } from '@/api/platform/legalExpert/types';
import { getLegalExpertList, legalUpdateOrSaveData } from '@/api/platform/legalExpert';
import router from '@/router';
import { reviewStatusMap } from '@/api/platform/legalExpert';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

// 弹窗相关
const dialogVisible = ref(false);
const dialogMessage = ref<LegalExpertList>({} as LegalExpertList);
const startStopStatusMessage = computed(() => (dialogMessage.value.startStopStatus === '1' ? '停用' : '启用'));

const expertList = ref<LegalExpertList[]>([]);
const loading = ref(false);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const tableRef = ref<ElTableInstance>();

const queryParams = ref<LegalExpertListRequest>({
  pageNum: 1,
  pageSize: 10,
  expertName: '',
  expertNumber: '',
  registrationTime: '',
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
  queryParams.value.expertName = '';
  queryParams.value.expertNumber = '';
  queryParams.value.registrationTime = '';
  queryParams.value.reviewStatus = '';
  queryParams.value.pageNum = 1;
  queryParams.value.pageSize = 10;
  handleQuery();
};

const handleEdit = (row: any, type: 'view' | 'edit' | 'audit') => {
  router.push({
    path: '/platform/legal/audit/details',
    query: {
      id: row.id,
      type
    }
  });
};
const loadingStatus = ref(false);
// 弹窗点击确定
const toggleEnabled = async (message: LegalExpertList) => {
  if (loadingStatus.value || !message.id) return;
  loadingStatus.value = true;
  // 停用：0 -> 1
  // 启用：1 -> 0
  // 是否启用
  const isEnabled = message.startStopStatus === '1';
  const res = await legalUpdateOrSaveData({
    optType: isEnabled ? '5' : '4',
    hnBaseLegalExpertInfoBo: {
      id: message.id
    }
  }).finally(() => {
    loadingStatus.value = false;
    close();
  });
  if (res.code === 200) {
    message.startStopStatus = isEnabled ? '0' : '1';
    proxy?.$modal.msgSuccess(isEnabled ? '已启用' : '已停用');
  }
};
const open = (row: LegalExpertList) => {
  dialogMessage.value = row;
  dialogVisible.value = true;
};
const close = () => {
  dialogVisible.value = false;
};

// 初始化
getList();
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
