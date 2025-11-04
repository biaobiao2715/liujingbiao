<!--
  标题: procurement.vue
  功能: 采购需求
  说明: 该页面用于管理采购需求，包括搜索、新增、编辑、删除采购需求等操作。
  当前版本: 1.0
  开发信息: Created by 刘景彪 2025-11-4
-->
<template>
  <div class="procurement-management">
    <!-- 搜索栏 -->
    <el-form :model="queryParams" :label-width="80" inline class="search-bar">
      <el-form-item label="采购类型">
        <GoodsCategorySelect v-model="queryParams.purchaseType" />
      </el-form-item>
      <el-form-item label="采购区域">
        <RegionSelect v-model="queryParams.purchaseRegion" style="width: 100%" />
      </el-form-item>
      <el-form-item class="search-bar-btns">
        <el-button v-throttle type="primary" @click="getTableData">查询</el-button>
        <el-button v-throttle @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>
    <!-- 表格 -->
    <el-table :data="tableData" border style="width: 100%" v-loading="loading">
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column prop="name" label="客户名称" width="120" />
      <el-table-column prop="categoryName" label="采购类型" width="180" />
      <el-table-column prop="quantity" label="采购数量" width="100">
        <template #default="{ row }"> {{ row.quantity }} {{ row.unit || '' }} </template>
      </el-table-column>
      <el-table-column prop="deliveryDay" label="交付时间/天" width="100" />
      <el-table-column prop="purchaseRegion" label="采购区域" width="180">
        <template #default="{ row }">
          {{ [row.deliveryProvince, row.deliveryCity, row.deliveryDistrict].filter(Boolean).join(' - ') || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="demandDescription" label="采购说明" min-width="180" />
      <el-table-column prop="publishTime" label="发布时间" width="160">
        <template #default="{ row }">
          {{ proxy.parseTime(row.publishTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120">
        <template #default="scope">
          <el-button v-throttle type="primary" size="small" @click="handleQuote(scope.row)">立即报价</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <div class="pagination-wrapper">
      <pagination
        v-show="queryParams.total > 0"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        :total="queryParams.total"
        @pagination="handlePageChange"
      />
    </div>

    <!-- 立即报价弹窗 -->
    <el-dialog v-model="quoteDialogVisible" width="80%" title="立即报价" :close-on-click-modal="false">
      <el-form :model="quoteForm" :rules="quoteFormRules" ref="quoteFormRef" label-width="120px">
        <el-divider content-position="left"> <span class="detail-title">采购信息</span> </el-divider>
        <el-row :gutter="20" class="detail-form">
          <el-col :span="12">
            <el-form-item label="客户名称：" prop="name">
              <el-input v-model="quoteForm.name" placeholder="请输入" maxlength="100" show-word-limit disabled />
            </el-form-item>
            <el-form-item label="采购类型：" prop="demandCategoryId">
              <GoodsCategorySelect v-model="quoteForm.demandCategoryId" :disabled="true" />
            </el-form-item>
            <el-form-item label="采购区域：" prop="region">
              <RegionSelect v-model="quoteForm.region" :disabled="true" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="发布时间：" prop="publishTime">
              <el-date-picker
                v-model="quoteForm.publishTime"
                value-format="YYYY-MM-DD HH:mm:ss"
                type="datetime"
                placeholder="请选择日期时间"
                disabled
                style="width: 100%"
              />
            </el-form-item>
            <el-form-item label="交付时间/天：" prop="deliveryDay">
              <el-input v-model="quoteForm.deliveryDay" placeholder="请输入" maxlength="100" show-word-limit disabled />
            </el-form-item>
            <el-form-item label="采购数量：" prop="quantity">
              <el-input v-model="quoteForm.quantity" placeholder="请输入" maxlength="100" show-word-limit disabled />
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="采购说明：" prop="demandDescription">
              <el-input v-model="quoteForm.demandDescription" placeholder="请输入" maxlength="100" show-word-limit disabled />
            </el-form-item>
          </el-col>
        </el-row>
        <el-divider content-position="left"> <span class="detail-title">供给信息</span></el-divider>

        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="报价说明" prop="supplyDescription">
              <el-input v-model="quoteForm.supplyDescription" type="textarea" placeholder="请输入报价说明" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系人" prop="supplyContact">
              <el-input v-model="quoteForm.supplyContact" placeholder="请输入联系人" /> </el-form-item
          ></el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="supplyPhone">
              <el-input v-model="quoteForm.supplyPhone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="报价/元" prop="supplyPrice">
              <el-input v-model="quoteForm.supplyPrice" placeholder="请输入报价/元" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 操作按钮 -->
        <el-row type="flex" justify="center" :gutter="5">
          <el-col :span="3"><el-button @click="quoteDialogVisible = false">取消</el-button></el-col>
          <el-col :span="3"><el-button type="primary" @click="submitQuote">提交</el-button></el-col>
        </el-row>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
// ...请替换为采购需求相关接口...
import { hnPurchaseDemandPurchaseList, hnPurchaseQuotePost } from '@/api/supplier/supplyManagement/procurement';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const tableData = ref([]);
const loading = ref(false);

const queryParams = ref({
  purchaseType: '' as any,
  purchaseRegion: '' as any,
  pageNum: 1,
  pageSize: 10,
  total: 0
});

const quoteDialogVisible = ref(false);
const quoteFormRef = ref();
const quoteForm = ref({
  id: '',
  name: '',
  demandCategoryId: '' as any,
  demandDescription: '',
  quantity: '',
  deliveryDay: '',
  deliveryProvinceCode: '',
  deliveryProvince: '',
  deliveryCityCode: '',
  deliveryCity: '',
  deliveryDistrictCode: '',
  deliveryDistrict: '',
  publishTime: '',
  region: [],
  supplyDescription: '',
  supplyContact: '',
  supplyPhone: '',
  supplyPrice: ''
});
const quoteFormRules = {
  supplyDescription: [
    { required: true, message: '请输入报价说明', trigger: 'blur' },
    { max: 200, message: '超出输入限制，请简阐述', trigger: 'blur' }
  ],
  supplyContact: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { max: 50, message: '联系人最多50字符', trigger: 'blur' }
  ],
  supplyPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入正确的手机号（11位数字，首位为1，第二位为3-9）',
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

const getTableData = async () => {
  loading.value = true;
  try {
    const res = await hnPurchaseDemandPurchaseList({
      ...queryParams.value
    });
    if (res.code === 200) {
      tableData.value = res.rows || [];
      queryParams.value.total = res.total || 0;
    }
  } finally {
    loading.value = false;
  }
};

// 重置按钮事件
const handleReset = () => {
  queryParams.value.purchaseType = '';
  queryParams.value.purchaseRegion = '';
  getTableData();
};

// 分页切换事件
const handlePageChange = async (pageInfo: { page: number; limit: number }) => {
  queryParams.value.pageNum = pageInfo.page;
  queryParams.value.pageSize = pageInfo.limit;
  getTableData();
};

const handleQuote = (row: any) => {
  quoteForm.value = {
    ...row,
    supplyDescription: '',
    supplyContact: '',
    supplyPhone: '',
    supplyPrice: '',
    region: [row.deliveryProvinceCode || '', row.deliveryCityCode || '', row.deliveryDistrictCode || '']
  };

  quoteDialogVisible.value = true;
};

const submitQuote = () => {
  quoteFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      // 提交报价逻辑
      const arr = {
        demandId: quoteForm.value.id,
        quoteRemarks: quoteForm.value.supplyDescription,
        contactPerson: quoteForm.value.supplyContact,
        contactPhone: quoteForm.value.supplyPhone,
        unitPrice: Number(quoteForm.value.supplyPrice)
      };

      await hnPurchaseQuotePost(arr);
      ElMessage.success('报价提交成功');
      quoteDialogVisible.value = false;
    }
  });
};

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
