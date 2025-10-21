<!--
  标题: EditDetails.vue
  功能: 企业编辑详情页
  说明: 用于企业编辑自己的详细信息
  当前版本: 1.0
  开发信息: Created by 刘景彪 2025-10-15
-->
<template>
  <div class="supplier-edit-details">
    <!-- 基础信息 -->
    <el-form :model="formData" label-width="140px">
      <FormHeader title="商品详情" />
      <el-row :gutter="20" class="detail-form">
        <el-col :span="8">
          <el-form-item label="商品名称">
            <el-input v-model="formData.enterpriseNumber" disabled></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="商品编码">
            <el-input v-model="formData.enterpriseNumber" disabled></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="产品保障">
            <el-input v-model="formData.companyName" disabled></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="商品品牌">
            <el-input v-model="formData.licenseNumber" disabled></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="创建时间">
            <el-input v-model="formData.signUpCapital" disabled></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="商品主图">
            <img :src="urlImage" width="200" alt="商品主图" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="商品状态">
            <el-input v-model="formData.signUpAddress" disabled></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="上架时间">
            <el-input v-model="formData.signUpTime" disabled></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 商品信息 -->
      <FormHeader title="商品信息" />
      <el-table :data="tableList" border style="width: 100%">
        <el-table-column prop="sellingPrice" label="商品名称" align="center"> </el-table-column>
        <el-table-column prop="sellingPrice" label="商品编码" align="center"> </el-table-column>
        <el-table-column prop="sellingPrice" label="销售价" align="center"> </el-table-column>
        <el-table-column prop="unit" label="商品规格" align="center"> </el-table-column>
        <el-table-column prop="availableInventory" label="可用库存" align="center"> </el-table-column>
      </el-table>

      <div style="height: 20px"></div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { baseEnterpriseInfoId, enterpriseEdit, enterpriseReview } from '@/api/platform/enterprise/index';
import FormHeader from '@/components/FormHeader/index.vue';
import { useRoute } from 'vue-router';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { review_status, plat_qualification_grade, plat_credit_rating } = toRefs<any>(
  proxy?.useDict('review_status', 'plat_qualification_grade', 'plat_credit_rating')
);

// 获取router路由参数
const route = useRoute();
const { id } = route.query;

// 定义接口返回数据的类型
interface SupplierDetails {
  id?: number;
  enterpriseNumber?: string;
  enterpriseType?: string;
  companyName?: string;
  licenseNumber?: string;
  signUpTime?: string;
  legalPerson?: string;
  officeAddress?: string;
  signUpAddress?: string;
  signUpCapital?: string;
  businessScope?: string;
  companyIntro?: string;
  companyDomain?: string;
  loginUserName?: string;
  phoneNumber?: string;
  password?: string;
  credentialLevel?: string;
  creditLevel?: string;
  userId?: number;
  remark?: string;
  reviewStatus?: string;
  reviewRemark?: string;
  reviewTime?: string;
  reviewBy?: number;
  accountName?: string;
  contacts: Array<{
    contactUserType?: string;
    contactUserName?: string;
    contactPhone?: string;
    contactIdCard?: string;
  }>;
  folders?: Array<{
    id?: number;
    name?: string;
    fileType?: string;
    ossId?: number;
    remark?: string;
    ossInfo?: {
      ossId?: number;
      fileName?: string;
      originalName?: string;
      url?: string;
    };
  }>;
}

const formData = ref<SupplierDetails>({
  id: undefined,
  enterpriseNumber: '',
  enterpriseType: '',
  companyName: '',
  licenseNumber: '',
  signUpTime: '',
  officeAddress: '',
  signUpAddress: '',
  signUpCapital: '',
  businessScope: '',
  companyIntro: '',
  companyDomain: '',
  loginUserName: '',
  phoneNumber: '',
  password: '',
  credentialLevel: '',
  creditLevel: '',
  userId: undefined,
  remark: '',
  reviewStatus: '',
  reviewRemark: '',
  reviewTime: '',
  reviewBy: undefined,
  accountName: '',
  contacts: [],
  folders: []
});
const tableList = ref([]); // 商品信息

const urlImage = ref(); // 营业执照

// id获取详情信息
baseEnterpriseInfoId(id as string)
  .then((res) => {
    formData.value = res.data;
  })
  .catch((error) => {
    console.error('获取企业基本信息失败:', error);
  });
</script>

<style scoped lang="scss">
.supplier-edit-details {
  padding: 0 24px;
}

// 去掉表单的默认样式
::v-deep .el-input__wrapper {
  box-shadow: none !important;
  background-color: transparent !important;
  cursor: default !important;
  resize: none !important;
}

::v-deep .el-input__inner {
  cursor: default !important;
}

// 去除 el-date-picker 的样式
::v-deep .el-date-editor {
  border: none;
  background-color: transparent;
  pointer-events: none;
  color: #333;
}

.textarea-item {
  ::v-deep .el-textarea__inner {
    box-shadow: none !important;
    background-color: transparent !important;
    cursor: default !important;
    resize: none !important;
  }
}
</style>
