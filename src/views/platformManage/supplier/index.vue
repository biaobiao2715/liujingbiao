<!--
  标题: supplier/index.vue
  功能: 供应商管理首页
  说明: 用于供应商管理，包括查询、添加、编辑、删除等操作
  当前版本: 1.0
  开发信息: Created by 李春雷 2025-10-15
-->
<template>
  <div class="supplier-management">
    <!-- 搜索条件 -->
    <el-form :model="queryParams" inline :label-width="130" label-position="left">
      <el-form-item label="供应商编号">
        <el-input v-model="queryParams.enterpriseNumber" placeholder="请输入供应商编号" clearable />
      </el-form-item>
      <el-form-item label="供应商名称">
        <el-input v-model="queryParams.companyName" placeholder="请输入供应商名称" clearable />
      </el-form-item>
      <el-form-item label="统一社会信用代码">
        <el-input v-model="queryParams.licenseNumber" placeholder="请输入统一社会信用代码" clearable />
      </el-form-item>
      <el-form-item label="审核状态">
        <el-select v-model="queryParams.reviewStatus" placeholder="审核状态" filterable clearable>
          <el-option v-for="dict in review_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <!-- 审核通过时间 -->
      <!-- <el-form-item label="审核时间">
        <el-date-picker
          v-model="queryParams.reviewTime"
          type="daterange"
          value-format="YYYY-MM-DD"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />
      </el-form-item> -->
      <el-form-item>
        <el-button v-throttle icon="Search" type="primary" @click="handleSearch">查询</el-button>
        <el-button v-throttle icon="Refresh" @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格展示 -->
    <el-table :data="computedTableData" border v-loading="loading">
      <el-table-column type="index" label="序号" width="60"></el-table-column>
      <el-table-column prop="companyName" label="供应商名称" width="160" show-overflow-tooltip></el-table-column>
      <el-table-column prop="enterpriseNumber" label="供应商编号" width="210"> </el-table-column>
      <el-table-column prop="licenseNumber" label="统一社会信用代码" width="210"></el-table-column>
      <el-table-column prop="credentialLevel" label="资质等级" width="100">
        <template v-slot="scope">
          <div class="flex-center">
            <dict-tag :options="plat_qualification_grade" :value="scope.row.credentialLevel" />
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="creditLevel" label="信用等级">
        <template v-slot="scope">
          <div class="flex-center">
            <dict-tag :options="plat_credit_rating" :value="scope.row.creditLevel" />
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="reviewStatus" label="审核状态" width="100">
        <template v-slot="scope">
          <div class="flex-center">
            <dict-tag :options="review_status" :value="scope.row.reviewStatus" />
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="申请时间" width="180"> </el-table-column>
      <el-table-column prop="reviewTime" label="审核时间" width="180"> </el-table-column>
      <el-table-column prop="auditPerson" label="审核人" width="140"></el-table-column>
      <el-table-column label="操作" fixed="right" width="180" >
        <template #default="scope">
          <div class="flex-center operation-btns">
            <el-button
              v-throttle
              type="primary"
              link
              v-if="scope.row.reviewStatus !== '0'"
              @click="handleEdit(scope.row, 'view')"
              v-hasPermi="['system:baseEnterpriseInfo:query']"
              >查看</el-button
            >
            <el-button
              v-if="scope.row.reviewStatus === '1'"
              v-throttle
              link
              type="primary"
              @click="handleEdit(scope.row, 'edit')"
              v-hasPermi="['system:baseEnterpriseInfo:edit']"
              >修改信用等级</el-button
            >
            <el-button
              v-throttle
              link
              v-if="scope.row.reviewStatus === '0'"
              type="primary"
              @click="handleEdit(scope.row, 'audit')"
              v-hasPermi="['system:baseEnterpriseInfo:edit']"
              >审核</el-button
            >
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="flex-center pagination">
      <pagination
        v-show="queryParams.total > 0"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        :total="queryParams.total"
        @pagination="handlePageChange"
      />
    </div>
    <EditDetails ref="editDetailsRef" @saveSuccess="getTableData" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { baseEnterpriseInfoList } from '@/api/platform/enterprise';
import EditDetails from './EditDetails.vue';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { review_status, plat_qualification_grade, plat_credit_rating } = toRefs<any>(
  proxy?.useDict('review_status', 'plat_qualification_grade', 'plat_credit_rating')
);

const editDetailsRef = ref(null);

// 查询参数和分页数据
const queryParams = ref({
  enterpriseNumber: '',
  companyName: '',
  licenseNumber: '',
  reviewStatus: '',
  reviewTime: [],
  total: 0,
  pageSize: 10,
  pageNum: 1
});

// 表格数据
const tableData = ref([]);

// 表格加载状态
const loading = ref(false);

// 每次页面激活时执行（从缓存中恢复）
onActivated(() => {
  getTableData();
});

onMounted(() => {
  getTableData();
});

// 计算属性，用于处理表格中复杂的显示逻辑
const computedTableData = computed(() =>
  tableData.value.map((row) => ({
    ...row,
    credentialLevelText: row.credentialLevel === '0' ? '一级认证' : row.credentialLevel === '1' ? '二级认证' : '三级认证',
    creditLevelText:
      row.creditLevel === '0'
        ? '优秀'
        : row.creditLevel === '1'
          ? '良好'
          : row.creditLevel === '2'
            ? '一般'
            : row.creditLevel === '3'
              ? '一般以下'
              : '较差',
    reviewStatusText: row.reviewStatus === '0' ? '待审核' : row.reviewStatus === '1' ? '审核通过' : '审核退回',
    formattedSignUpTime: row.createTime ? row.createTime.substring(0, 10) : ''
  }))
);

// 查询按钮事件
const handleSearch = () => {
  queryParams.value.pageNum = 1;
  getTableData();
};

// 重置按钮事件
const handleReset = () => {
  queryParams.value = {
    enterpriseNumber: '',
    companyName: '',
    licenseNumber: '',
    reviewStatus: '',
    reviewTime: [],
    total: queryParams.value.total,
    pageSize: queryParams.value.pageSize,
    pageNum: 1
  };
  getTableData();
};

// 分页切换事件
const handlePageChange = async (pageInfo: { page: number; limit: number }) => {
  queryParams.value.pageNum = pageInfo.page;
  queryParams.value.pageSize = pageInfo.limit;
  getTableData();
};

// 获取列表数据
const getTableData = async () => {
  loading.value = true; // 开始加载
  try {
    const res = await baseEnterpriseInfoList({
      ...queryParams.value,
      enterpriseType: 0,
      reviewTime: undefined,
      reviewStartTime: queryParams.value.reviewTime?.[0],
      reviewEndTime: queryParams.value.reviewTime?.[1]
    });
    tableData.value = res.rows || [];
    queryParams.value.total = res.total || 0;
  } catch (error) {
    console.error('获取列表数据失败:', error);
  } finally {
    loading.value = false; // 加载结束
  }
};

// 编辑按钮事件
const handleEdit = (row: any, type: 'view' | 'edit' | 'audit') => {
  editDetailsRef.value.handleOpenDialog(row.id, type);
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
</style>
