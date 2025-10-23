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
      <el-card shadow="hover">
        <el-form ref="queryFormRef" :model="queryParams" :inline="true">
          <el-form-item label="专家姓名" prop="name">
            <el-input v-model="queryParams.expertName" placeholder="请输入专家姓名" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="专家编号" prop="expertNumber">
            <el-input v-model="queryParams.expertNumber" placeholder="请输入专家编号" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="入驻日期" prop="registrationTime">
            <el-date-picker v-model="queryParams.registrationTime" type="date" placeholder="请选择" value-format="YYYY-MM-DD" clearable />
          </el-form-item>
          <el-form-item label="审核状态" prop="auditStatus">
            <el-select v-model="queryParams.reviewStatus" placeholder="全部" filterable clearable style="width: 140px">
              <el-option v-for="dict in review_status" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">查询</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <!-- 表格 -->
        <el-table ref="tableRef" :data="list" border style="width: 100%" :header-cell-style="{ fontWeight: 500 }">
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column label="专家姓名" prop="expertName" align="center" :show-overflow-tooltip="true" />
          <el-table-column label="专家编号" prop="expertNumber" align="center" :show-overflow-tooltip="true">
            <template #default="scope">
              <el-link type="primary">{{ scope.row.expertNumber }}</el-link>
            </template>
          </el-table-column>
          <el-table-column label="联系电话" prop="contactPhone" align="center" :show-overflow-tooltip="true" />
          <el-table-column label="入驻时间" prop="registrationTime" align="center" width="180">
            <template #default="scope">
              {{ scope.row.registrationTime || '--' }}
            </template>
          </el-table-column>
          <el-table-column label="审核状态" prop="reviewStatus" align="center">
            <template #default="scope">
              {{ reviewStatusMap[scope.row.reviewStatus] || '未知' }}
            </template>
          </el-table-column>
          <el-table-column label="入库状态" prop="storageStatus" align="center">
            <template #default="scope">
              {{ scope.row.storageStatus === '0' ? '未入库' : '已入库' }}
            </template>
          </el-table-column>

          <el-table-column label="操作" align="center" width="200">
            <template #default="scope">
              <div style="display: flex; justify-content: space-evenly; align-items: center">
                <el-link type="primary" v-if="scope.row.reviewStatus !== '0'" @click="handleEdit(scope.row, 'view')">查看</el-link>
                <el-link type="primary" v-if="scope.row.reviewStatus === '0'" @click="handleEdit(scope.row, 'audit')">审核</el-link>
                <el-link type="primary" v-if="scope.row.reviewStatus !== '0'" @click="handleEdit(scope.row, 'edit')">编辑</el-link>
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
      </el-card>
    </div>
  </div>
</template>

<script setup name="TechnicalExpert" lang="ts">
import { getTechnicalExpertList, techUpdateOrSaveData } from '@/api/platform/technicalExpert';
import { TechnicalExpertListRequest, TechnicalExpertList } from '@/api/platform/technicalExpert/types';
import router from '@/router';
import { ComponentInternalInstance, getCurrentInstance, reactive, ref, toRefs } from 'vue';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { review_status, plat_qualification_grade, plat_credit_rating } = toRefs<any>(
  proxy?.useDict('review_status', 'plat_qualification_grade', 'plat_credit_rating')
);
// console.log('review_status', review_status);
// 查询参数
const queryParams = reactive<TechnicalExpertListRequest>({
  expertName: '',
  registrationTime: '',
  reviewStatus: '',
  pageNum: 1,
  pageSize: 10
});

// 列表与分页
const list = ref<TechnicalExpertList[]>([]);
const total = ref(0);
const tableRef = ref();
const queryFormRef = ref();
const loading = ref(false);

const reviewStatusMap = {
  '0': '待审核',
  '1': '审核通过',
  '2': '分配账号',
  '3': '分配权限',
  '4': '入驻成功',
  '99': '入驻失败'
};
const getList = () => {
  loading.value = true;
  getTechnicalExpertList(queryParams)
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

// 查询
const handleQuery = () => {
  getList();
};

// 重置
const resetQuery = () => {
  queryParams.expertName = '';
  queryParams.registrationTime = '';
  queryParams.reviewStatus = '';
  queryParams.expertNumber = '';
  queryParams.pageNum = 1;
  handleQuery();
};

const loadingStatus = ref(false);
// 操作
const toggleEnabled = async (row: TechnicalExpertList) => {
  if (loadingStatus.value || !row.id) return;
  loadingStatus.value = true;
  // 停用：0 -> 1
  // 启用：1 -> 0
  // 是否启用
  const isEnabled = row.startStopStatus === '1';
  const res = await techUpdateOrSaveData({
    optType: isEnabled ? '5' : '4',
    hnBaseTechExpertInfoBo: {
      id: row.id
    }
  }).finally(() => {
    loadingStatus.value = false;
  });
  if (res.data) {
    row.startStopStatus = isEnabled ? '0' : '1';
    proxy?.$modal.msgSuccess(isEnabled ? '已启用' : '已停用');
  }
};

const handleEdit = (row: any, type: 'view' | 'edit' | 'audit') => {
  // TODO: 跳转编辑页面或弹出编辑弹窗携带type参数
  router.push({
    path: '/platform/technicalExpert/details',
    query: {
      id: row.id,
      type
    }
  });
};
// 初始化
handleQuery();
</script>

<style scoped lang="scss">
.technical-expert-page {
  .table-header {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}
</style>
