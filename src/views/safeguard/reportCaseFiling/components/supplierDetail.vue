<!--
  标题: EditDetails.vue
  功能: 企业/供应商详情页
  说明: 用于查看企业/供应商详细信息
  当前版本: 1.0
  开发信息: Created by 邓和杰 2025-11-24
-->
<template>
  <div class="supplier-edit-details">
    <!-- 基础信息 -->
    <el-form :model="formData" label-width="140px">
      <FormHeader :title="`${entityLabel}基础信息`" />
      <el-row :gutter="20" class="detail-form">
        <el-col :span="12">
          <el-form-item :label="`${entityLabel}编码`">
            <!-- <el-input v-model="formData.enterpriseNumber" readonly></el-input> -->
            <text class="report-description" selectable="false" space="false" decode="false">{{ formData.enterpriseNumber }}</text>
          </el-form-item>

          <el-form-item :label="`${entityLabel}名称`">
            <!-- <el-input v-model="formData.companyName" readonly></el-input> -->
            <text class="report-description" selectable="false" space="false" decode="false">{{ formData.companyName }}</text>
          </el-form-item>

          <el-form-item label="注册资本">
            <!-- <el-input v-model="formData.signUpCapital" readonly></el-input> -->
            <text class="report-description" selectable="false" space="false" decode="false">{{ formData.signUpCapital }}</text>
          </el-form-item>

          <el-form-item label="注册地址">
            <!-- <el-input v-model="areaCodes" readonly></el-input> -->
            <text class="report-description" selectable="false" space="false" decode="false">{{ areaCodes }}</text>
          </el-form-item>

          <el-form-item label="办公地址">
            <!-- <el-input v-model="formData.officeAddress" readonly></el-input> -->
            <text class="report-description" selectable="false" space="false" decode="false">{{ formData.officeAddress }}</text>
          </el-form-item>

          <el-form-item label="企业经营范围">
            <!-- <el-input v-model="formData.businessScope" autosize type="textarea" readonly></el-input> -->
            <text class="report-description" selectable="false" space="false" decode="false">{{ formData.businessScope }}</text>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="审核状态">
            <el-select v-model="formData.reviewStatus" placeholder="请选择审核状态" filterable clearable readonly>
              <el-option v-for="dict in review_status" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>

          <el-form-item label="社会统一信用代码">
            <!-- <el-input v-model="formData.licenseNumber" readonly></el-input> -->
            <text class="report-description" selectable="false" space="false" decode="false">{{ formData.licenseNumber }}</text>
          </el-form-item>

          <el-form-item label="注册日期">
            <!-- <el-input v-model="formData.signUpTime" readonly></el-input> -->
            <text class="report-description" selectable="false" space="false" decode="false">{{ formData.signUpTime }}</text>
          </el-form-item>

          <el-form-item label="营业执照">
            <div class="business-license">
              <el-image :src="urlImage" :preview-src-list="[urlImage]" show-progress alt="营业执照"> </el-image>
            </div>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 法人信息 -->
      <FormHeader title="法人信息" />
      <el-row :gutter="20" class="detail-form">
        <el-col :span="12">
          <el-form-item label="法人姓名" required>
            <!-- <el-input v-model="contactF.contactUserName" readonly></el-input> -->
            <text class="report-description" selectable="false" space="false" decode="false">{{ contactF.contactUserName }}</text>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="证件类型" required>
            <!-- <el-input v-model="idType" readonly></el-input> -->
            <text class="report-description" selectable="false" space="false" decode="false">{{ idType }}</text>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="证件号码" required>
            <!-- <el-input v-model="contactF.contactIdCard" readonly></el-input> -->
            <text class="report-description" selectable="false" space="false" decode="false">{{ contactF.contactIdCard }}</text>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="联系电话" required>
            <!-- <el-input v-model="contactF.contactPhone" readonly></el-input> -->
            <text class="report-description" selectable="false" space="false" decode="false">{{ contactF.contactPhone }}</text>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 联系人信息 -->
      <div v-if="formData.contacts.length > 0" class="detail-form">
        <FormHeader title="联系人" />
        <el-row :gutter="20" v-for="(contact, index) in formData.contacts" :key="index">
          <el-col :span="12">
            <el-form-item :label="'联系人' + (index + 1)" required>
              <!-- <el-input v-model="contact.contactUserName" readonly></el-input> -->
              <text class="report-description" selectable="false" space="false" decode="false">{{ contact.contactUserName }}</text>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" required>
              <!-- <el-input v-model="contact.contactPhone" readonly></el-input> -->
              <text class="report-description" selectable="false" space="false" decode="false">{{ contact.contactPhone }}</text>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 账户信息 -->
      <FormHeader title="账户信息" />
      <el-row :gutter="20" class="detail-form">
        <el-col :span="12">
          <el-form-item label="账户名" required>
            <!-- <el-input v-model="formData.loginUserName" readonly></el-input> -->
            <text class="report-description" selectable="false" space="false" decode="false">{{ formData.loginUserName }}</text>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="注册手机号" required>
            <!-- <el-input v-model="formData.phoneNumber" readonly></el-input> -->
            <text class="report-description" selectable="false" space="false" decode="false">{{ formData.phoneNumber }}</text>
          </el-form-item>
        </el-col>
      </el-row>

      <FormHeader :title="`${entityLabel}信息`" />
      <el-row :gutter="20" class="detail-form">
        <el-col :span="12">
          <el-form-item label="信用等级">
            <el-select v-model="formData.creditLevel" placeholder="请选择信用等级" filterable clearable readonly>
              <el-option v-for="dict in plat_credit_rating" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="信用积分">
            <!-- <el-input v-model="formData.sore" readonly></el-input> -->
            <text class="report-description" selectable="false" space="false" decode="false">{{ formData.sore }}</text>
          </el-form-item>
        </el-col>
      </el-row>

      <FormHeader title="资料清单" />
      <el-table :data="formData.folders" border>
        <el-table-column type="index" label="序号" width="55" align="center" />
        <el-table-column prop="name" label="附件名" align="center">
          <template #default="scope">
            {{ scope.row?.ossInfo?.originalName || '' }}
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" align="center"></el-table-column>
        <el-table-column label="操作" align="center">
          <template #default="scope">
            <el-button v-throttle text type="primary" @click="downloadAttachment(scope.row.ossInfo?.originalName, scope.row.ossInfo?.url)"
              >下载</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <div style="height: 20px"></div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { baseEnterpriseInfoId } from '@/api/platform/enterprise/index';
import FormHeader from '@/components/FormHeader/index.vue';

import { FormData } from '@/api/platform/enterprise/types'; //ts类型
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { review_status, plat_qualification_grade, plat_credit_rating } = toRefs<any>(
  proxy?.useDict('review_status', 'plat_qualification_grade', 'plat_credit_rating')
);

// 通过 props 接收父组件传参
const props = defineProps<{
  id: string | number;
}>();
// 子组件对外事件
const emit = defineEmits<{
  (e: 'refresh'): void;
  (e: 'cancel'): void;
}>();
const formData = ref<FormData>({
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
  legalPerson: '',
  companyIntro: '',
  companyDomain: '',
  loginUserName: '',
  phoneNumber: '',
  smsCode: '',
  password: '',
  confirmPassword: '',
  areaCodes: '',
  districtCode: '',
  cityCode: '',
  provinceCode: '',
  district: '',
  city: '',
  province: '',
  credentialLevel: '',
  creditLevel: '',
  userId: undefined,
  remark: '',
  reviewStatus: '',
  reviewRemark: '',
  reviewTime: '',
  auditPerson: undefined,
  accountName: '',
  contacts: [],
  folders: []
});
const entityLabel = computed(() => {
  const type = String(formData.value?.enterpriseType ?? '');
  if (type === '0') return '供应商';
  if (type === '1') return '企业';
  return '企业/供应商';
});
const idType = ref('身份认证');
const areaCodes = ref('');
const contactZ = ref([]); // 自然人
const contactF = ref({
  // 法人联系人信息
  contactUserType: '',
  contactUserName: '',
  contactIdCard: '',
  contactPhone: ''
});
const showPreview = ref(false);

const urlImage = ref(); // 营业执照

// id获取详情信息（使用 props.id）
baseEnterpriseInfoId(String(props.id))
  .then((res) => {
    formData.value = res.data;
    areaCodes.value = formData.value.province + formData.value.city + formData.value.district;
    if (res.data?.contacts?.length > 0) {
      res.data.contacts.forEach((element) => {
        if (element.contactUserType == 1) {
          contactF.value = element;
        } else {
          contactZ.value.push(element);
        }
      });
    }

    if (res.data?.folders?.length > 0) {
      res.data.folders.forEach((element) => {
        if (element.fileType == 1) {
          urlImage.value = element.ossInfo?.url || '';
        }
      });
    }
  })
  .catch((error) => {
    console.error('获取企业基本信息失败:', error);
  });

const downloadAttachment = async (fileName: string, url: string) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName; // 设置文件名
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href); // 释放 URL 对象
  } catch (error) {
    console.error('下载失败', error);
  }
};
</script>

<style scoped lang="scss">
.supplier-edit-details {
  padding: 0 24px;
}

// 去掉表单的默认样式
:deep(.el-input__wrapper) {
  box-shadow: none !important;
  background-color: transparent !important;
  cursor: default !important;
  resize: none !important;
}

:deep(.el-input__inner) {
  cursor: default !important;
}

// 去除 el-date-picker 的样式
:deep(.el-date-editor) {
  border: none;
  background-color: transparent;
  pointer-events: none;
  color: #333;
}

.textarea-item {
  :deep(.el-textarea__inner) {
    box-shadow: none !important;
    background-color: transparent !important;
    cursor: default !important;
    resize: none !important;
  }
}
.report-description {
  width: 100%;
  min-height: 42px;
  line-height: 18px;
  padding-right: 20px;
  padding-left: 11px;
  padding-top: 12px;
  box-sizing: border-box;
  text-wrap: wrap;
}
.business-license {
  width: 120px;
  height: 68px;
  box-shadow: 0 0 0 1px #dcdfe6;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 12px;
  margin-left: 11px;
}
</style>
