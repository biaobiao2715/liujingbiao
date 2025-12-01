<!-- 产品管理-保险列表页 -->
<template>
  <div class="product-insurance-manage">
    <el-form
      v-show="showSearch"
      ref="queryFormRef"
      :model="queryParams"
      inline
      :label-width="90"
      label-position="left"
    >
      <el-form-item label="产品名称" prop="productName">
        <el-input
          v-model="queryParams.productName"
          placeholder="请输入产品名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="产品类型" prop="productType">
        <el-select
          v-model="queryParams.productType"
          placeholder="请选择"
          clearable
        >
          <el-option
            v-for="dict in product_insurance_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="适用对象" prop="applicableObject">
        <el-select
          v-model="queryParams.applicableObject"
          placeholder="请选择"
          clearable
          multiple
          :collapse-tags="false"
        >
          <el-option
            v-for="dict in applicable_object"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="productStatus">
        <el-select
          v-model="queryParams.productStatus"
          placeholder="请选择"
          clearable
        >
          <el-option
            v-for="dict in product_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button v-throttle type="primary" icon="Search" @click="handleQuery">查询</el-button>
        <el-button v-throttle icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="12" class="operation-bar">
      <el-col :span="1.5">
        <el-button
          v-throttle
          v-hasPermi="['system:insuranceProductsVersion:add']"
          type="primary"
          icon="Plus"
          class="add-btn"
          @click="handleAdd"
        >
          新增
        </el-button>
      </el-col>
    </el-row>

    <el-table
      :data="tableData"
      v-loading="loading"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="index" label="序号" width="55" align="center" />
      <el-table-column label="产品名称" prop="productName" min-width="150" :show-overflow-tooltip="true" />
      <el-table-column label="产品简介" prop="productIntro" min-width="150" :show-overflow-tooltip="true" />
      <el-table-column label="产品类型" prop="productType" width="140">
        <template #default="scope">
          <dict-tag :options="product_insurance_type" :value="scope.row.productType" />
        </template>
      </el-table-column>
      <el-table-column label="适用对象" prop="applicableObject" min-width="180" :show-overflow-tooltip="true">
        <template #default="scope">
          <dict-tag :options="applicable_object" :value="typeof scope.row.applicableObject === 'string' ? scope.row.applicableObject.split(',') : scope.row.applicableObject" />
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="productStatus" width="100">
        <template #default="scope">
          <div class="status-with-dot">
            <span 
              class="status-dot" 
              :class="`status-dot-${getStatusType(scope.row.productStatus)}`"
            ></span>
            <span 
              class="status-text"
              :class="`status-text-${getStatusType(scope.row.productStatus)}`"
            >
              {{ getStatusLabel(scope.row.productStatus) }}
            </span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="createTime" min-width="160">
        <template #default="scope">
          <span>{{ scope.row.createTime || '--' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" align="left" width="320" class-name="small-padding fixed-width">
        <template #default="scope">
          <div style="display: flex; justify-content: flex-start; align-items: center">
            <el-button
              v-throttle
              v-hasPermi="['system:insuranceProductsVersion:query']"
              type="text"
              style="font-size: 14px; color: #108c58"
              @click="handleView(scope.row)"
            >
              详情
            </el-button>
            <el-button
              v-throttle
              v-hasPermi="['system:insuranceProductsVersion:edit']"
              v-if="canEdit(scope.row)"
              type="text"
              style="font-size: 14px; color: #108c58"
              @click="handleEdit(scope.row)"
            >
              编辑
            </el-button>
            <el-button
              v-throttle
              v-hasPermi="['system:insuranceProductsVersion:edit']"
              v-if="canPublish(scope.row)"
              type="text"
              style="font-size: 14px; color: #108c58"
              @click="handlePublish(scope.row)"
            >
              上架
            </el-button>
            <el-button
              v-throttle
              v-hasPermi="['system:insuranceProductsVersion:edit']"
              v-if="canOffline(scope.row)"
              type="text"
              style="font-size: 14px; color: #108c58"
              @click="handleOffline(scope.row)"
            >
              下架
            </el-button>
            <el-button
              v-throttle
              v-hasPermi="['system:insuranceProductsVersion:remove']"
              v-if="canDelete(scope.row)"
              type="text"
              style="font-size: 14px; color: #108c58"
              @click="handleDelete(scope.row)"
            >
              删除
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <pagination
        v-show="total > 0"
        :page="queryParams.pageNum"
        :limit="queryParams.pageSize"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @update:page="handlePageChange"
        @update:limit="handlePageSizeChange"
        @pagination="getList"
      />
    </div>

    <el-dialog
      v-model="dialog.visible"
      :title="dialog.type === 'add' ? '新增保险产品' : dialog.type === 'edit' ? '编辑保险产品' : '保险产品详情'"
      width="50%"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <Suspense>
        <template #default>
          <component
            :is="dialog.type === 'view' ? ProductInsuranceDetail : ProductInsuranceForm"
            :id="dialog.id"
            :type="dialog.type"
            @success="onDialogSuccess"
            @cancel="dialog.visible = false"
          />
        </template>
        <template #fallback>
          <el-skeleton :rows="6" animated />
        </template>
      </Suspense>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, getCurrentInstance, toRefs, defineAsyncComponent, computed } from 'vue';
import type { ComponentInternalInstance } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { FormInstance } from 'element-plus';
import { insuranceProductList, editInsuranceProduct, deleteInsuranceProduct } from '@/api/creditPlatform/productInsuranceManage';
import { useUserStore } from '@/store/modules/user';

const ProductInsuranceForm = defineAsyncComponent(() => import('./ProductInsuranceForm.vue'));
const ProductInsuranceDetail = defineAsyncComponent(() => import('./ProductInsuranceDetail.vue'));

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { product_insurance_type, applicable_object, product_status } = toRefs<any>(
  proxy?.useDict('product_insurance_type', 'applicable_object', 'product_status')
);

const userStore = useUserStore();
const isAdmin = computed(() => {
  const roles = userStore.roles || [];
  return roles.includes('admin') || roles.includes('Admin') || roles.includes('ADMIN') || roles.includes('superadmin');
});
const isFinancialInstitution = computed(() => {
  const roles = userStore.roles || [];
  return roles.some(role => 
    role === 'financial_institution' || 
    role === 'financial' || 
    role?.toLowerCase().includes('financial')
  );
});

interface InsuranceProduct {
  id?: number;
  productName?: string;
  productIntro?: string;
  productType?: string;
  applicableObject?: string;
  productStatus?: string;
  createTime?: string;
  [key: string]: any;
}

const showSearch = ref(true);
const loading = ref(false);
const queryFormRef = ref<FormInstance>();

const dialog = reactive({
  visible: false,
  type: 'add' as 'add' | 'edit' | 'view',
  id: null as string | number | null
});

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  productName: '',
  productType: '',
  productStatus: '',
  applicableObject: [] as string[],
  orderByColumn: 'createTime',
  isAsc: 'desc'
});

const tableData = ref<InsuranceProduct[]>([]);
const total = ref(0);

const handleSelectionChange = () => {};

const getList = () => {
  loading.value = true;
  const params = {
    ...queryParams,
    applicableObject: Array.isArray(queryParams.applicableObject) && queryParams.applicableObject.length > 0 
      ? queryParams.applicableObject.join(',') 
      : queryParams.applicableObject
  };
  insuranceProductList(params).then((res) => {
    tableData.value = res.rows || [];
    total.value = res.total || 0;
    loading.value = false;
  }).catch(() => {
    loading.value = false;
  });
};

const handleQuery = () => {
  queryParams.pageNum = 1;
  getList();
};

const resetQuery = () => {
  queryFormRef.value?.resetFields?.();
  queryParams.pageNum = 1;
  queryParams.pageSize = 20;
  queryParams.productName = '';
  queryParams.productType = '';
  queryParams.productStatus = '';
  queryParams.applicableObject = [];
  queryParams.orderByColumn = 'createTime';
  queryParams.isAsc = 'desc';
  handleQuery();
};

const canPublish = (row: InsuranceProduct) => {
  const status = row.productStatus;
  const canStatusPublish = status === '5' || status === 'pending' || status === 'waiting' || 
                          status === '3' || status === 'disabled' || status === 'draft';
  if (!canStatusPublish) return false;
  if (isFinancialInstitution.value) return false;
  return isAdmin.value;
};

const canOffline = (row: InsuranceProduct) => {
  const status = row.productStatus;
  return status === '2' || status === 'enabled' || status === '1';
};

const canEdit = (row: InsuranceProduct) => {
  const status = row.productStatus;
  return status === '3' || status === 'disabled' || status === '5' || status === 'pending' || status === 'waiting' || status === 'draft';
};

const canDelete = (row: InsuranceProduct) => {
  const status = row.productStatus;
  return status !== '2' && status !== 'enabled' && status !== '1';
};

const getStatusLabel = (status: string | number) => {
  const value = String(status ?? '');
  const list = product_status.value || [];
  const target = list.find((item: any) => String(item.value) === value);
  return target?.label || '--';
};

const getStatusType = (status: string | number) => {
  const value = String(status ?? '');
  // 根据业务逻辑：2-已上架, 3-已下架, 5-待上架
  if (value === '2' || value === '1' || value === 'enabled') return 'success'; // 已上架
  if (value === '3' || value === 'disabled' || value === 'offline') return 'danger'; // 已下架
  if (value === '5' || value === 'pending' || value === 'waiting' || value === 'draft') return 'warning'; // 待上架
  return 'info';
};

const handleAdd = () => {
  dialog.visible = true;
  dialog.type = 'add';
  dialog.id = null;
};

const onDialogSuccess = () => {
  dialog.visible = false;
  getList();
};

const handleEdit = (row: InsuranceProduct) => {
  dialog.visible = true;
  dialog.type = 'edit';
  dialog.id = row.id || null;
};

const handleView = (row: InsuranceProduct) => {
  dialog.visible = true;
  dialog.type = 'view';
  dialog.id = row.id || null;
};

const handlePublish = (row: InsuranceProduct) => {
  ElMessageBox.confirm(`确认要上架「${row.productName}」吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const data = { ...row, productStatus: '2', optType: '2' };
      const response = await editInsuranceProduct(data);
      if (response && response.code === 200) {
        ElMessage.success('上架成功');
        getList();
      } else {
        ElMessage.error(response?.msg || '上架失败');
      }
    } catch (error) {
      ElMessage.error('上架失败，请稍后重试');
    }
  }).catch(() => {});
};

const handleOffline = (row: InsuranceProduct) => {
  ElMessageBox.confirm(`确认要下架「${row.productName}」吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const data = { ...row, productStatus: '3', optType: '2' };
      const response = await editInsuranceProduct(data);
      if (response && response.code === 200) {
        ElMessage.success('下架成功');
        getList();
      } else {
        ElMessage.error(response?.msg || '下架失败');
      }
    } catch (error) {
      ElMessage.error('下架失败，请稍后重试');
    }
  }).catch(() => {});
};

const handleDelete = (row: InsuranceProduct) => {
  ElMessageBox.confirm(`确认要删除「${row.productName}」吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await deleteInsuranceProduct(row.id as number | string);
      if (response && response.code === 200) {
        ElMessage.success('删除成功');
        getList();
      } else {
        ElMessage.error(response?.msg || '删除失败');
      }
    } catch (error) {
      ElMessage.error('删除失败，请稍后重试');
    }
  }).catch(() => {});
};

const handlePageChange = (page: number) => {
  queryParams.pageNum = page;
  getList();
};

const handlePageSizeChange = (size: number) => {
  queryParams.pageSize = size;
  queryParams.pageNum = 1;
  getList();
};

onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
.product-insurance-manage {
  padding: 24px;
  height: calc(100vh - 120px);
  box-sizing: border-box;
}

.operation-bar {
  margin-bottom: 16px;

  .el-col {
    display: flex;
    justify-content: flex-start;
  }

  .el-button {
    width: auto;
    min-width: 80px;
  }
}

.add-btn {
  width: 80px !important;
  min-width: 80px !important;
  max-width: 80px !important;
  height: 32px !important;
  line-height: 32px;
  padding: 0 !important;
  box-sizing: border-box;
}

:deep(.el-table) {
  .el-table__header {
    background-color: #fafafa;
    
    th {
      background-color: #fafafa !important;
      color: #606266;
      font-weight: 600;
    }
  }
  
  .el-table__body {
    tr {
      &:hover {
        background-color: #f5f7fa;
      }
    }
  }
}

.pagination {
  margin-top: 24px;
  justify-content: end;
}

.flex-center {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.operation-btns {
  gap: 8px;
  
  :deep(.el-button) {
    font-size: 14px;
  }
}

.status-with-dot {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-dot-success {
  background-color: #108c58;
}

.status-dot-warning {
  background-color: #ff7b00;
}

.status-dot-danger {
  background-color: #f23255;
}

.status-dot-info {
  background-color: #909399;
}

.status-text {
  font-size: 14px;
}

.status-text-success {
  color: #108c58;
}

.status-text-warning {
  color: #ff7b00;
}

.status-text-danger {
  color: #f23255;
}

.status-text-info {
  color: #909399;
}
</style>
