<!-- 
标题：			index.vue
功能：			专家培训
说明:         
当前版本：	1.0
开发信息：	Created by 张峰 2025-10-27
修改人信息：张峰     2025-10-27
修改内容：用于展示专家培训的列表和查询功能。
 -->

<template>
  <div class="p-2 legal-expert-page">
    <el-card shadow="hover">
      <!-- 查询区域 -->
      <div class="mb-[10px]">
        <el-form ref="queryFormRef" :model="queryParams" inline :label-width="80">
          <el-form-item label="所属类别" prop="expertName">
            <el-input v-model="queryParams.expertName" placeholder="请选择所属类别" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="发布时间">
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
          <el-form-item label="发布人" prop="expertNumber">
            <el-input v-model="queryParams.expertNumber" placeholder="请输入发布人" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="所属状态" prop="reviewStatus">
            <el-select v-model="queryParams.reviewStatus" placeholder="所属状态" filterable clearable>
              <el-option v-for="dict in review_status" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="课程标题" prop="reviewStatus">
            <el-input v-model="queryParams.expertNumber" placeholder="请输入课程标题" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item>
            <el-button v-throttle type="primary" icon="Search" @click="handleQuery">查询</el-button>
            <el-button v-throttle icon="Refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="mb-12">
          <el-button v-throttle type="primary">新增</el-button>
      <el-button v-throttle type="primary" :disabled="selectedRows.length === 0">启用</el-button>
      <el-button v-throttle type="primary" :disabled="selectedRows.length === 0">禁用</el-button>
      <el-button v-throttle type="primary" :disabled="selectedRows.length === 0">删除</el-button>
    </div>
      <!-- 列表区域 -->
      <el-table
        ref="tableRef"
        v-loading="loading"
        border
        :data="expertList.slice((queryParams.pageNum - 1) * queryParams.pageSize, queryParams.pageNum * queryParams.pageSize)"
        style="width: 100%"
         @selection-change="handleSelectionChange"
      >
        <!-- <el-table-column type="selection" width="45" align="center" /> -->
        <el-table-column label="序号" width="60" align="center">
          <template #default="scope">
            <span>{{ (queryParams.pageNum - 1) * queryParams.pageSize + scope.$index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="expertName" label="发布时间" min-width="100" align="center" />
        <el-table-column label="课程标题" min-width="140" align="center">
          <template #default="scope">
            <el-link type="primary">{{ scope.row.expertNumber || '--' }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="phoneNumber" label="所属类别" min-width="130" align="center" />
        <el-table-column prop="registrationTime" label="发送数量" min-width="160" align="center" />
        <el-table-column label="浏览量" min-width="120" align="center" prop="reviewStatus">
          <template #default="scope">
            {{ reviewStatusMap[scope.row.reviewStatus] || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="下载量" min-width="100" align="center" prop="storageStatus">
          <template #default="scope">
            <span v-if="scope.row.storageStatus === '0'">待入库</span>
            <span v-else-if="scope.row.storageStatus === '1'">已入库</span>
            <span v-else>入库失败</span>
          </template>
        </el-table-column>
         <el-table-column prop="expertName" label="发布人" min-width="100" align="center" />
         <el-table-column prop="expertName" label="状态" min-width="100" align="center" />
        <el-table-column label="操作" align="center" width="200">
          <template #default="scope">
            <div style="display: flex; justify-content: space-evenly; align-items: center">
              <el-link type="primary" v-if="scope.row.reviewStatus === '1'" @click="handleEdit(scope.row, 'view')">查看</el-link>
              <el-link type="primary" v-if="scope.row.reviewStatus === '0'" @click="handleEdit(scope.row, 'audit')">审核</el-link>
              <el-link type="primary" v-if="scope.row.reviewStatus === '0'" @click="handleEdit(scope.row, 'edit')">编辑</el-link>
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
</template>

<script setup name="LegalExpert" lang="ts">
import { ref } from 'vue';
import { LegalExpertListRequest, LegalExpertList } from '@/api/platform/legalExpert/types';
import { getLegalExpertList, reviewStatusMap } from '@/api/platform/legalExpert';
import router from '@/router';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { review_status } = toRefs<any>(proxy?.useDict('review_status'));
const expertList = ref<LegalExpertList[]>([]);
const loading = ref(false);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const tableRef = ref<ElTableInstance>();

const registrationTime = ref<Array<string>>([]);
const selectedRows = ref([]); // 选中的表格数据
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
  // TODO: 跳转编辑页面或弹出编辑弹窗携带type参数
  router.push({
    path: '/platform/legalExpert/details',
    query: {
      id: row.id,
      type
    }
  });
};

// 每次页面激活时执行（从缓存中恢复）
onActivated(() => {
  getList();
});
// 处理表格复选框选择事件
const handleSelectionChange = (rows) => {
  selectedRows.value = rows;
};
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
