<!--
  标题: procurement.vue
  功能: 供给需求
  说明: 该页面用于管理采购需求，包括搜索、新增、编辑、删除采购需求等操作。
  当前版本: 1.0
  开发信息: Created by 刘景彪 2025-11-4
-->
<template>
  <div class="procurement-management">
    <!-- 搜索栏 -->
    <el-form :model="queryParams" :label-width="80" inline class="search-bar">
      <el-form-item label="发布类型">
        <GoodsCategorySelect v-model="queryParams.supplyCategoryId" :emitPath="false" @categoryChange="handleCategoryChange" />
      </el-form-item>
      <el-form-item label="发布区域">
        <RegionSelect v-model="queryParams.region" @regionChange="handleAreaChange" style="width: 100%" />
      </el-form-item>
      <el-form-item class="search-bar-btns">
        <el-button v-throttle v-hasPermi="['grain:hnSupplierSupply:list']" type="primary" @click="getTableData">查询</el-button>
        <el-button v-throttle @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button v-throttle v-hasPermi="['grain:hnSupplierSupply:add']" type="primary" @click="handleAdd">发布</el-button>
      </el-col>
    </el-row>
    <!-- 表格 -->
    <el-table :data="tableData" border style="width: 100%" v-loading="loading">
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column prop="categoryName" label="发布类型" align="center" :show-overflow-tooltip="true" />
      <el-table-column prop="purchaseRegion" label="发布区域" align="center" :show-overflow-tooltip="true">
        <template #default="{ row }">
          {{ [row.province, row.city, row.district].filter(Boolean).join(' - ') || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="supplyDescription" label="发布说明" align="center" :show-overflow-tooltip="true" />
      <el-table-column label="操作" width="200" align="center">
        <template #default="scope">
          <el-button v-throttle v-hasPermi="['grain:hnSupplierSupply:query']" type="primary" text size="small" @click="handleDetail(scope.row)"
            >详情</el-button
          >
          <el-button v-throttle v-hasPermi="['grain:hnSupplierSupply:edit']" type="primary" text size="small" @click="handleEdit(scope.row)"
            >编辑</el-button
          >
          <el-button v-throttle v-hasPermi="['grain:hnSupplierSupply:remove']" type="primary" text size="small" @click="handleDelete(scope.row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <div class="pagination-wrapper">
      <pagination
        v-show="total > 0"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        :total="total"
        @pagination="getTableData"
      />
    </div>

    <!-- 发布/编辑/详情弹窗 -->
    <el-dialog
      v-model="quoteDialogVisible"
      width="80%"
      :title="dialogMode === 'detail' ? '供给需求详情' : dialogMode === 'edit' ? '编辑供给需求' : '发布供给需求'"
      :close-on-click-modal="false"
    >
      <el-form :model="quoteForm" :rules="quoteFormRules" ref="quoteFormRef" label-width="140px" :disabled="dialogMode === 'detail'">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="供给类型：" prop="supplyCategoryId">
              <GoodsCategorySelect
                :emitPath="false"
                v-model="quoteForm.supplyCategoryId"
                @categoryChange="handleCategoryForm"
                :disabled="dialogMode === 'edit'"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注：" prop="supplyDescription">
              <el-input v-model="quoteForm.supplyDescription" placeholder="请输入" autosize type="textarea" :disabled="dialogMode === 'edit'" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="配送范围：" prop="supplierSupplyDeliveryBos">
              <RegionSelect
                v-model="quoteForm.supplierSupplyDeliveryBos"
                :multiple="true"
                placeholder="请选择配送范围"
                :disabled="dialogMode === 'edit'"
                @regionChange="supplierSupplyDeliveryBosForm"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="库存：" prop="stock">
              <el-input v-model="quoteForm.stock" placeholder="请输入" :disabled="dialogMode === 'detail'" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="可交付周期/天：" prop="deliveryDays">
              <el-input v-model="quoteForm.deliveryDays" placeholder="请输入可交付时间" :disabled="dialogMode === 'edit'" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="报价/元" prop="supplyPrice">
              <el-input v-model="quoteForm.supplyPrice" placeholder="请输入报价/元" :disabled="dialogMode === 'detail'" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 操作按钮 -->
        <el-row type="flex" justify="center" :gutter="5" v-if="dialogMode !== 'detail'">
          <el-col :span="3"><el-button @click="quoteDialogVisible = false">取消</el-button></el-col>
          <el-col :span="3"><el-button type="primary" @click="submitQuote">提交发布</el-button></el-col>
        </el-row>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance } from 'vue';
import { ElMessage } from 'element-plus';
// 采购需求相关接口
import {
  hnSupplierSupplyList,
  hnSupplierSupplyId,
  hnSupplierSupplyPost,
  hnSupplierSupplyPut,
  hnSupplierSupplyDelete
} from '@/api/supplier/supplyManagement/supply';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

// 表格数据及分页
const tableData = ref([]); // 采购需求列表
const loading = ref(false); // 加载状态
const total = ref(0); // 总条数
// 配送范围地址列表
const addresList = ref([]);

// 搜索参数，采购类型和区域均为数组，支持多级选择
const queryParams = ref({
  supplyCategoryId: [] as any[], // 采购类型（多级选择，数组）
  region: [] as any[], // 采购区域（多级选择，数组）
  deliveryDistrictCode: '', // 区县编码
  deliveryCityCode: '', // 城市编码
  deliveryProvinceCode: '', // 省份编码
  deliveryProvince: '', // 省份名称
  pageNum: 1, // 当前页码
  pageSize: 10 // 每页条数
});

// 报价弹窗相关
const quoteDialogVisible = ref(false); // 弹窗显示状态
const quoteFormRef = ref();
const quoteForm = ref({
  id: '', // 需求ID
  name: '', // 客户名称
  supplyCategoryId: '' as any, // 供给类型
  supplyDescription: '', // 采购说明
  stock: '', // 采购数量
  deliveryDays: '', // 交付时间
  publishTime: '', // 发布时间
  region: [], // 区域数组
  supplyContact: '', // 联系人
  supplyPhone: '', // 联系电话
  supplyPrice: '', // 报价
  supplierSupplyDeliveryBos: [] as any[] // 配送范围
});
const dialogMode = ref<'add' | 'edit' | 'detail'>('add'); // 弹窗模式

// 报价表单校验规则
const quoteFormRules = {
  supplyDescription: [
    { required: true, message: '请输入备注', trigger: 'blur' },
    { max: 200, message: '超出输入限制，请简阐述', trigger: 'blur' }
  ],
  supplyCategoryId: [{ required: true, message: '请选择供给类型', trigger: 'blur' }],
  supplierSupplyDeliveryBos: [{ required: true, message: '请选择配送范围', trigger: 'blur' }],
  stock: [
    { required: true, message: '请输入库存', trigger: 'blur' },
    {
      validator: (_rule: any, value: any, callback: any) => {
        if (!value || isNaN(value)) {
          callback(new Error('请输入有效的库存'));
        } else if (!Number.isInteger(Number(value)) || Number(value) <= 0) {
          callback(new Error('库存需为大于0的整数'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ],
  deliveryDays: [
    { required: true, message: '请输入可交付周期/天', trigger: 'blur' },
    {
      validator: (_rule: any, value: any, callback: any) => {
        if (!value || isNaN(value)) {
          callback(new Error('请输入有效的可交付周期'));
        } else if (!Number.isInteger(Number(value)) || Number(value) <= 0) {
          callback(new Error('可交付周期需为大于0的整数'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ],
  supplyPrice: [
    { required: true, message: '请输入报价/元', trigger: 'blur' },
    {
      validator: (_rule: any, value: any, callback: any) => {
        if (!value || isNaN(value)) {
          callback(new Error('请输入有效的报价'));
        } else if (Number(value) <= 0) {
          callback(new Error('报价需大于0'));
        } else if (!/^\d+(\.\d{1,2})?$/.test(value)) {
          callback(new Error('报价最多支持两位小数'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
};

/**
 * 获取采购需求列表
 */
const getTableData = async () => {
  loading.value = true;
  try {
    // 只取最后一级分类和区域
    const arr = {
      ...queryParams.value,
      region: ''
    };
    const res = await hnSupplierSupplyList(arr);
    if (res.code === 200) {
      tableData.value = res.rows || [];
      total.value = res.total || 0;
    }
  } finally {
    loading.value = false;
  }
};

/**
 * 重置筛选条件
 */
const handleReset = () => {
  queryParams.value.supplyCategoryId = [];
  queryParams.value.region = [];
  queryParams.value.deliveryDistrictCode = '';
  queryParams.value.deliveryCityCode = '';
  queryParams.value.deliveryProvinceCode = '';
  getTableData();
};

/**
 * 新增供给需求
 */
const handleAdd = () => {
  dialogMode.value = 'add';
  quoteForm.value = {
    id: '',
    name: '',
    supplyCategoryId: '',
    supplyDescription: '',
    deliveryDays: '',
    publishTime: '',
    region: [],
    supplyContact: '',
    supplyPhone: '',
    supplyPrice: '',
    stock: '',
    supplierSupplyDeliveryBos: []
  };
  quoteDialogVisible.value = true;
};

/**
 * 编辑供给需求
 */
const handleEdit = async (row: any) => {
  dialogMode.value = 'edit';
  // 获取详情数据
  const res = await hnSupplierSupplyId(row.id);
  if (res.code === 200) {
    console.log('编辑数据:', res.data.supplierSupplyDeliveryVos);
    const arr = Array.isArray(res.data.supplierSupplyDeliveryVos)
      ? res.data.supplierSupplyDeliveryVos.map((item: any) => [
          item?.deliveryProvinceCode ?? '',
          item?.deliveryCityCode ?? '',
          item?.deliveryAreaCode ?? ''
        ])
      : [];
    quoteForm.value = {
      ...res.data,
      supplierSupplyDeliveryBos: JSON.parse(JSON.stringify(arr))
    };
    console.log('编辑数据:', arr);
    quoteDialogVisible.value = true;
  }
};

/**
 * 查看详情
 */
const handleDetail = async (row: any) => {
  dialogMode.value = 'detail';
  const res = await hnSupplierSupplyId(row.id);
  if (res.code === 200) {
    quoteForm.value = {
      ...res.data,
      supplierSupplyDeliveryBos: Array.isArray(res.data.supplierSupplyDeliveryBos)
        ? res.data.supplierSupplyDeliveryBos.map((item: any) => [item.deliveryProvinceCode, item.deliveryCityCode, item.deliveryAreaCode])
        : []
    };
    quoteDialogVisible.value = true;
  }
};

/**
 * 删除供给需求
 */
const handleDelete = async (row: any) => {
  await ElMessageBox.confirm('是否删除该供给需求吗？', '提示', { type: 'warning' });

  const res: any = await hnSupplierSupplyDelete(row.id);
  if (res?.code === 200) {
    ElMessage.success('删除成功');
    getTableData();
  }
};

/**
 * 提交发布/编辑
 */
const submitQuote = () => {
  quoteFormRef.value.validate(async (valid: boolean) => {
    if (!valid) return;
    let params;
    if (dialogMode.value === 'add') {
      params = {
        ...quoteForm.value,
        supplierSupplyDeliveryBos: addresList.value
      };
      await hnSupplierSupplyPost(params);
      ElMessage.success('发布成功');
    } else if (dialogMode.value === 'edit') {
      // 编辑时只允许修改库存和报价
      params = {
        id: quoteForm.value.id,
        stock: quoteForm.value.stock,
        supplyPrice: quoteForm.value.supplyPrice
      };
      await hnSupplierSupplyPut(params);
      ElMessage.success('修改成功');
    }
    quoteDialogVisible.value = false;
    getTableData();
  });
};

/**
 * 采购类型选择变化
 * @param value 选中的类型数组
 */
const handleCategoryChange = (value: any) => {
  queryParams.value.supplyCategoryId = value;
};

const handleCategoryForm = (value: any) => {
  quoteForm.value.supplyCategoryId = value;
};

/**
 * 采购区域选择变化
 * @param val 区域对象
 */
const handleAreaChange = (val: any) => {
  queryParams.value.region = Array.isArray(val.regionPath) ? val.regionPath : [val.regionPath];
  queryParams.value.deliveryProvinceCode = val.provinceCode;
  queryParams.value.deliveryCityCode = val.cityCode;
  queryParams.value.deliveryDistrictCode = val.regionCode;
};

// 配送范围
const supplierSupplyDeliveryBosForm = (val: any[], result: any[]) => {
  // 始终同步全部配送范围
  quoteForm.value.supplierSupplyDeliveryBos = val;
  addresList.value = result.map((item) => ({
    deliveryProvinceCode: item.provinceCode,
    deliveryProvince: item.province || '',
    deliveryCityCode: item.cityCode || '',
    deliveryCity: item.city || '',
    deliveryAreaCode: item.regionCode || '',
    deliveryArea: item.region || ''
  }));
  // console.log('配送范围变化:', val, result);
};

// 页面初始化
onMounted(() => {
  getTableData();
});
</script>

<style scoped lang="scss">
.procurement-management {
  padding: 24px;

  .search-bar {
    margin-bottom: 10px;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    .search-bar-btns {
      margin-left: auto;
      display: flex;
      gap: 8px;
    }
  }

  .pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }

  .quote-dialog-section {
    margin-bottom: 24px;
    padding-bottom: 8px;
    border-bottom: 1px solid #eee;
    &:last-child {
      border-bottom: none;
    }
  }
  .quote-title {
    font-weight: bold;
    margin-bottom: 10px;
  }
  .quote-row {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
  }
}

.detail-form {
  /* 隐藏 el-cascader 的下拉箭头 */
  ::deep .el-input__suffix {
    display: none;
  }
}

.detail-title {
  font-size: 18px;
  font-weight: bold;
}
</style>
