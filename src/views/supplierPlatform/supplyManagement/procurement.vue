<!--
  标题: procurement.vue
  功能: 采购需求池
  说明: 该页面用于管理采购需求，包括搜索、新增、编辑、删除采购需求等操作。
  当前版本: 1.0
  开发信息: Created by 刘景彪 2025-11-4
-->
<template>
  <div class="procurement-management">
    <!-- 搜索栏 -->
    <el-form :model="queryParams" label-position="left" inline>
      <el-form-item label="采购类型" label-width="auto">
        <!-- 优化为数组类型，支持多级选择 -->
        <GoodsCategorySelect v-model="queryParams.demandCategoryId" @categoryChange="handleCategoryChange" />
      </el-form-item>
      <el-form-item label="采购区域" label-width="auto">
        <!-- 优化为数组类型，支持多级选择 -->
        <RegionSelect v-model="queryParams.region" @regionChange="handleAreaChange" style="width: 100%" />
      </el-form-item>
      <el-form-item>
        <el-button v-throttle icon="Search" v-hasPermi="['grain:HnPurchaseDemand:purchaseList']" type="primary" @click="getTableData">查询</el-button>
        <el-button v-throttle icon="Refresh" @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>
    <!-- 表格 -->
    <el-table :data="tableData" style="width: 100%" v-loading="loading">
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column prop="name" label="客户名称" :show-overflow-tooltip="true" />
      <el-table-column prop="categoryName" label="采购类型" :show-overflow-tooltip="true" />
      <el-table-column prop="quantity" label="采购数量">
        <template #default="{ row }"> {{ row.quantity }} {{ row.unit || '' }} </template>
      </el-table-column>
      <el-table-column prop="deliveryDay" label="交付时间/天" />
      <el-table-column prop="purchaseRegion" label="采购区域" :show-overflow-tooltip="true">
        <template #default="{ row }">
          {{ [row.deliveryProvince, row.deliveryCity, row.deliveryDistrict].filter(Boolean).join(' - ') || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="demandDescription" label="采购说明" :show-overflow-tooltip="true" />
      <el-table-column prop="publishTime" label="发布时间" width="160">
        <template #default="{ row }">
          {{ proxy.parseTime(row.publishTime) }}
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="120">
        <template #default="scope">
          <el-button
            v-if="scope.row.hasQuote == '0'"
            v-throttle
            v-hasPermi="['grain:hnPurchaseQuote:add']"
            link
            type="primary"
            @click="handleQuote(scope.row.id)"
            >立即报价</el-button
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

    <!-- 立即报价弹窗 -->
    <el-dialog v-model="quoteDialogVisible" width="50%" title="立即报价" :close-on-click-modal="false">
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
            <el-form-item label="报价说明" prop="quoteRemarks">
              <el-input v-model="quoteForm.quoteRemarks" type="textarea" placeholder="请输入报价说明" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系人" prop="contactPerson">
              <el-input v-model="quoteForm.contactPerson" placeholder="请输入联系人" /> </el-form-item
          ></el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="contactPhone">
              <el-input v-model="quoteForm.contactPhone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="报价/元" prop="unitPrice">
              <el-input v-model="quoteForm.unitPrice" placeholder="请输入报价/元" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 操作按钮 -->
        <div class="flex-center-end">
          <el-button @click="quoteDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitQuote">提交</el-button>
        </div>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance, watch } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';

import { hnPurchaseDemandPurchaseList, hnPurchaseQuotePost, hnPurchaseDemandId } from '@/api/supplier/supplyManagement/procurement';
const { proxy } = getCurrentInstance() as any;
const route = useRoute();

// 表格数据及分页
const tableData = ref([]); // 采购需求列表
const loading = ref(false); // 加载状态
const total = ref(0); // 总条数

// 搜索参数，采购类型和区域均为数组，支持多级选择
const queryParams = ref({
  demandCategoryId: [] as any[], // 采购类型（多级选择，数组）
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
const quoteFormRef = ref(); // 表单ref
const quoteForm = ref({
  id: '', // 需求ID
  name: '', // 客户名称
  demandCategoryId: '' as any, // 采购类型
  demandDescription: '', // 采购说明
  quantity: '', // 采购数量
  deliveryDay: '', // 交付时间
  deliveryProvinceCode: '', // 省份编码
  deliveryProvince: '', // 省份名称
  deliveryCityCode: '', // 城市编码
  deliveryCity: '', // 城市名称
  deliveryDistrictCode: '', // 区县编码
  deliveryDistrict: '', // 区县名称
  publishTime: '', // 发布时间
  region: [], // 区域数组
  quoteRemarks: '', // 报价说明
  contactPerson: '', // 联系人
  contactPhone: '', // 联系电话
  unitPrice: '' // 报价
});

// 报价表单校验规则
const quoteFormRules = {
  quoteRemarks: [
    { required: true, message: '请输入报价说明', trigger: 'blur' },
    { max: 200, message: '超出输入限制，请简阐述', trigger: 'blur' }
  ],
  contactPerson: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { max: 50, message: '联系人最多50字符', trigger: 'blur' }
  ],
  contactPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入正确的手机号（11位数字，首位为1，第二位为3-9）',
      trigger: 'blur'
    }
  ],
  unitPrice: [
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
      demandCategoryId: queryParams.value.demandCategoryId?.length
        ? queryParams.value.demandCategoryId[queryParams.value.demandCategoryId.length - 1]
        : '',
      region: ''
    };
    const res = await hnPurchaseDemandPurchaseList(arr);
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
  queryParams.value.demandCategoryId = [];
  queryParams.value.region = [];
  queryParams.value.deliveryDistrictCode = '';
  queryParams.value.deliveryCityCode = '';
  queryParams.value.deliveryProvinceCode = '';
  getTableData();
};

/**
 * 打开报价弹窗并初始化表单
 * @param row 当前行数据
 */
const handleQuote = async (id: any) => {
  const res: any = await hnPurchaseDemandId(id);
  const row = res?.data || (Array.isArray(res?.rows) ? res.rows[0] : undefined);
  if (!row) return;

  quoteForm.value = {
    ...row,
    quoteRemarks: '',
    contactPerson: '',
    contactPhone: '',
    unitPrice: '',
    region: [row.deliveryProvinceCode || '', row.deliveryCityCode || '', row.deliveryDistrictCode || '']
  };
  quoteDialogVisible.value = true;
  quoteFormRef.value.clearValidate(); // 清除校验状态
};

/**
 * 提交报价
 */
const submitQuote = () => {
  quoteFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      // 构造提交参数
      const arr = {
        demandId: quoteForm.value.id,
        quoteRemarks: quoteForm.value.quoteRemarks,
        contactPerson: quoteForm.value.contactPerson,
        contactPhone: quoteForm.value.contactPhone,
        unitPrice: Number(quoteForm.value.unitPrice)
      };
      await hnPurchaseQuotePost(arr);
      ElMessage.success('报价提交成功');
      getTableData();
      quoteDialogVisible.value = false;
    }
  });
};

/**
 * 采购类型选择变化
 * @param value 选中的类型数组
 */
const handleCategoryChange = (value: any) => {
  queryParams.value.demandCategoryId = Array.isArray(value) ? value : [value];
};

/**
 * 采购区域选择变化
 * @param val 区域对象
 */
const handleAreaChange = (val: any) => {
  queryParams.value.region = Array.isArray(val.regionPath) ? val.regionPath : [val.regionPath];
  queryParams.value.deliveryProvinceCode = val.provinceCode;
  // queryParams.value.deliveryProvince = val.province;
  queryParams.value.deliveryCityCode = val.cityCode;
  // queryParams.value.deliveryCity = val.city;
  queryParams.value.deliveryDistrictCode = val.regionCode;
  // queryParams.value.deliveryDistrict = val.region;
};

// 进入页面后尝试根据路由 id 打开
onMounted(() => {
  const id = route.query?.id;
  if (id !== undefined) {
    handleQuote(id);
  }
  getTableData();
});

// 监听路由变化，如果 id 改变则尝试打开
watch(
  () => route.query?.id,
  (id, oldId) => {
    if (id !== undefined && id !== oldId) {
      handleQuote(id);
    }
  }
);
</script>

<style scoped lang="scss">
.procurement-management {
  height: calc(100vh - 120px);
  padding: 24px;

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
