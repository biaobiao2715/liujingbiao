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
      <FormHeader title="企业基础信息" />
      <el-row :gutter="20" class="detail-form">
        <el-col :span="12">
          <el-form-item label="企业编码">
            <el-input v-model="formData.enterpriseNumber" disabled></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="审核状态">
            <el-select v-model="formData.reviewStatus" placeholder="请选择审核状态" clearable disabled>
              <el-option v-for="dict in review_status" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="企业名称">
            <el-input v-model="formData.companyName" disabled></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="社会统一信用代码">
            <el-input v-model="formData.licenseNumber" disabled></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="注册资本">
            <el-input v-model="formData.signUpCapital" disabled></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="注册日期">
            <el-input v-model="formData.signUpTime" disabled></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="注册地址">
            <el-input v-model="formData.signUpAddress" disabled></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="营业执照">
            <img :src="urlImage" width="200" alt="营业执照" />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="办公地址">
            <el-input v-model="formData.officeAddress" disabled></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="企业经营范围">
            <el-input v-model="formData.businessScope" type="textarea" disabled></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 法人信息 -->
      <FormHeader title="法人信息" />
      <el-row :gutter="20" class="detail-form">
        <el-col :span="12">
          <el-form-item label="法人姓名">
            <el-input v-model="contactF.contactUserName" disabled></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="证件号码">
            <el-input v-model="contactF.contactIdCard" disabled></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="证件类型">
            <el-input v-model="idType" disabled></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="联系电话">
            <el-input v-model="contactF.contactPhone" disabled></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 联系人信息 -->
      <div v-if="contactZ.length > 0" class="detail-form">
        <FormHeader title="联系人信息" />
        <el-row :gutter="20" v-for="(contact, index) in contactZ" :key="index">
          <el-col :span="12">
            <el-form-item :label="'联系人' + (index + 1)">
              <el-input v-model="contact.contactUserName" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话">
              <el-input v-model="contact.contactPhone" disabled></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 账户信息 -->
      <FormHeader title="账户信息" />
      <el-row :gutter="20" class="detail-form">
        <el-col :span="12">
          <el-form-item label="账户名">
            <el-input v-model="formData.loginUserName" disabled></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="注册手机号">
            <el-input v-model="formData.phoneNumber" disabled></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <FormHeader title="企业信息" />
      <el-row :gutter="20" :class="!disabledIf ? 'detail-form' : ''">
        <el-col :span="12">
          <el-form-item label="资质等级">
            <el-select v-model="formData.credentialLevel" placeholder="请选择资质等级" clearable :disabled="!disabledIf">
              <el-option v-for="dict in plat_qualification_grade" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="信用等级">
            <el-select v-model="formData.reviewStatus" placeholder="请选择信用等级" clearable :disabled="!disabledIf">
              <el-option v-for="dict in plat_credit_rating" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <FormHeader title="资料清单" />
      <el-table :data="formData.folders" border>
        <el-table-column type="index" label="序号" width="55" align="center" />
        <el-table-column prop="name" label="附件名" align="center">
          <template #default="scope">
            {{ scope.row.ossInfo.fileName }}
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" align="center"></el-table-column>
        <el-table-column label="操作" align="center">
          <template #default="scope">
            <el-button type="primary" @click="previewAttachment(scope.row)">预览</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="operateMode !== 'edit'" :class="!disabledIf ? 'detail-form' : ''">
        <FormHeader title="审核意见" />
        <el-form-item label="审核意见">
          <el-input v-model="formData.reviewRemark" type="textarea" maxlength="200" :rows="3" :disabled="!disabledIf"></el-input>
        </el-form-item>
      </div>

      <!-- 操作按钮 -->
      <div style="margin-top: 20px; text-align: center" v-if="operateMode === 'audit'">
        <el-button type="danger" @click="cancelAuditNo">审核退回</el-button>
        <el-button type="success" @click="cancelAudit">审核通过</el-button>
      </div>
      <div style="margin-top: 20px; text-align: center" v-if="operateMode === 'edit'">
        <el-button type="primary" @click="enterEditMode">保存</el-button>
      </div>

      <div style="height: 20px"></div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { baseEnterpriseInfoId, enterpriseEdit, enterpriseReview } from '@/api/platform/enterprise/index';
import FormHeader from '@/components/FormHeader/index.vue';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { review_status, plat_qualification_grade, plat_credit_rating } = toRefs<any>(
  proxy?.useDict('review_status', 'plat_qualification_grade', 'plat_credit_rating')
);

// 获取router路由参数
import { useRoute } from 'vue-router';
const route = useRoute();
const { id, type } = route.query;
const operateMode = ref(type);
// 编辑/详情模式
const disabledIf = ref(true);
// type = 'view' | 'edit' | 'audit'; 详情模式 编辑模式 审核模式
disabledIf.value = type !== 'view';

const formData = ref({
  enterpriseNumber: '',
  enterpriseType: '',
  companyName: '',
  licenseNumber: '',
  signUpTime: '',
  legalPerson: '',
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
  remark: '',
  reviewStatus: '',
  reviewRemark: '',
  reviewTime: '',
  reviewBy: 0,
  folders: []
});
const idType = ref('身份认证');
const contactZ = ref([]); // 自然人
const contactF = ref({
  // 法人联系人信息
  contactUserType: '',
  contactUserName: '',
  contactIdCard: '',
  contactPhone: ''
});
const urlImage = ref(); // 营业执照

// id获取详情信息
baseEnterpriseInfoId(id)
  .then((res) => {
    formData.value = res.data;
    if (res.data?.contacts?.length > 0) {
      res.data.contacts.forEach((element) => {
        console.log('33', element);
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
          urlImage.value = element.ossInfo.url;
        }
      });
    }
  })
  .catch((error) => {
    console.error('获取企业基本信息失败:', error);
  });

// 审核成功
const cancelAudit = () => {
  enterpriseReview(formData.value).then((res) => {
    console.log('审核成功:', res);
  });
  console.log('取消编辑');
};
// 审核退回
const cancelAuditNo = () => {
  enterpriseReview(formData.value).then((res) => {
    console.log('审核退回:', res);
  });
};
// 编辑保存
const enterEditMode = () => {
  console.log('进入编辑模式');
  enterpriseEdit(formData.value)
    .then((res) => {
      console.log('修改成功:', res);
    })
    .catch((error) => {
      console.error('修改失败:', error);
    });
};

const previewAttachment = (attachment) => {
  console.log('预览附件', attachment);
};
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
