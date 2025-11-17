<!-- 产品管理-保险列表页 -->
<template>
  <div class="product-insurance-manage">
    <!-- 搜索条件 -->
    <el-form
      v-show="showSearch"
      ref="queryFormRef"
      :model="queryParams"
      inline
      :label-width="100"
      class="search-form"
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
          placeholder="全部"
          clearable
        >
          <el-option label="全部" value="" />
          <el-option
            v-for="dict in prod_insurance_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="适用对象" prop="applicableObject">
        <el-select
          v-model="queryParams.applicableObject"
          placeholder="全部"
          clearable
        >
          <el-option label="全部" value="" />
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
          placeholder="全部"
          clearable
        >
          <el-option label="全部" value="" />
          <el-option
            v-for="dict in product_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label-width="0">
        <el-button v-throttle type="primary" icon="Search" @click="handleQuery">查询</el-button>
        <el-button v-throttle icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作栏 -->
    <el-row :gutter="12" class="operation-bar">
      <el-col :span="1.5">
        <el-button v-throttle type="primary" icon="Plus" @click="handleAdd">
          + 新增保险产品
        </el-button>
      </el-col>
    </el-row>

    <!-- 表格 -->
    <el-table
      :data="tableData"
      border
      v-loading="loading"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column type="index" label="序号" width="55" align="center" />
      <el-table-column label="产品名称" align="center" prop="productName" min-width="150" :show-overflow-tooltip="true" />
      <el-table-column label="产品简介" align="center" prop="productIntro" min-width="150" :show-overflow-tooltip="true" />
      <el-table-column label="产品类型" align="center" prop="productType" width="140">
        <template #default="scope">
          <dict-tag :options="prod_insurance_type" :value="scope.row.productType" />
        </template>
      </el-table-column>
      <el-table-column label="适用对象" align="center" prop="applicableObject" width="120">
        <template #default="scope">
          <dict-tag :options="applicable_object" :value="scope.row.applicableObject" />
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="productStatus" width="100">
        <template #default="scope">
          <dict-tag :options="product_status" :value="scope.row.productStatus" />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" min-width="160">
        <template #default="scope">
          <span>{{ scope.row.createTime || '--' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="320" class-name="small-padding fixed-width">
        <template #default="scope">
          <div class="operation-buttons">
            <el-button v-throttle type="primary" size="small" link @click="handleView(scope.row)">详情</el-button>
            <el-button v-throttle type="primary" size="small" link @click="handleEdit(scope.row)">修改</el-button>
            <el-button
              v-throttle
              v-if="scope.row.productStatus === 'draft' || scope.row.productStatus === 'disabled'"
              type="primary"
              size="small"
              link
              @click="handlePublish(scope.row)"
            >
              上架
            </el-button>
            <el-button
              v-throttle
              v-if="scope.row.productStatus === 'enabled'"
              type="primary"
              size="small"
              link
              @click="handleOffline(scope.row)"
            >
              下架
            </el-button>
            <el-button
              v-throttle
              type="primary"
              size="small"
              link
              @click="handleDelete(scope.row)"
            >
              删除
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
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

    <!-- 新增/编辑/详情弹窗 -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.type === 'add' ? '新增保险产品' : dialog.type === 'edit' ? '编辑保险产品' : '保险产品详情'"
      :width="dialog.type === 'view' ? '70%' : '60%'"
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
import { reactive, ref, onMounted, getCurrentInstance, toRefs, defineAsyncComponent } from 'vue';
import type { ComponentInternalInstance } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { FormInstance } from 'element-plus';
import { insuranceProductList } from '@/api/creditPlatform/productInsuranceManage';

const ProductInsuranceForm = defineAsyncComponent(() => import('./ProductInsuranceForm.vue'));
const ProductInsuranceDetail = defineAsyncComponent(() => import('./ProductInsuranceDetail.vue'));

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { prod_insurance_type, applicable_object, product_status } = toRefs<any>(
  proxy?.useDict('prod_insurance_type', 'applicable_object', 'product_status')
);

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
  pageSize: 20,
  productName: '',
  productType: '',
  productStatus: '',
  applicableObject: ''
});

const tableData = ref<InsuranceProduct[]>([]);
const total = ref(922);

const handleSelectionChange = () => {
  // 预留选择功能
};

/** 获取列表 */
const getList = () => {
  loading.value = true;
  insuranceProductList(queryParams).then((res) => {
    tableData.value = res.rows || [];
    total.value = res.total || 0;
    loading.value = false;
  }).catch(() => {
    loading.value = false;
  });
};

// 搜索与重置
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
  queryParams.applicableObject = '';
  handleQuery();
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
  }).then(() => {
    ElMessage.success('已模拟上架操作');
    getList();
  });
};

const handleOffline = (row: InsuranceProduct) => {
  ElMessageBox.confirm(`确认要下架「${row.productName}」吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('已模拟下架操作');
    getList();
  });
};

const handleDelete = (row: InsuranceProduct) => {
  ElMessageBox.confirm(`确认要删除「${row.productName}」吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('已模拟删除操作');
    getList();
  });
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

// 初始化
onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
.product-insurance-manage {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background-color: #f7f8fa;
  min-height: calc(100vh - 120px);
}

.search-form {
  background: #fff;
  padding: 20px 24px 10px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(31, 45, 61, 0.08);

  .el-form-item {
    min-width: 260px;
    margin-bottom: 12px;
  }

  .el-form-item:last-child {
    margin-left: 0;
    min-width: auto;
    flex-shrink: 0;
  }
}

.operation-bar {
  background: #fff;
  padding: 12px 16px;
  border-radius: 8px;
  align-items: center;
  box-shadow: 0 2px 8px rgba(31, 45, 61, 0.08);

  .el-button {
    width: 100%;
  }
}

.el-table {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(31, 45, 61, 0.08);
}

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

:deep(.el-table__body-wrapper) {
  .operation-buttons {
    .el-button + .el-button {
      margin-left: 0;
    }
  }
}

.pagination {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  background: #fff;
  border-radius: 8px;
  padding: 12px 16px;
  box-shadow: 0 2px 8px rgba(31, 45, 61, 0.08);
}
</style>
