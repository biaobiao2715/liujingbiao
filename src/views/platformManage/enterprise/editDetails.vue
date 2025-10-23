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
            <el-select v-model="formData.reviewStatus" placeholder="请选择审核状态" filterable clearable disabled>
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
            <el-select v-model="formData.credentialLevel" placeholder="请选择资质等级" filterable clearable :disabled="!disabledIf">
              <el-option v-for="dict in plat_qualification_grade" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="信用等级">
            <el-select v-model="formData.creditLevel" placeholder="请选择信用等级" filterable clearable :disabled="!disabledIf">
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
            <el-button v-throttle type="primary" @click="previewAttachment(scope.row)">预览</el-button>
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
        <el-button v-throttle type="danger" @click="cancelAudit(99)">审核退回</el-button>
        <el-button v-throttle type="success" @click="cancelAudit(1)">审核通过</el-button>
      </div>
      <div style="margin-top: 20px; text-align: center" v-if="operateMode === 'edit'">
        <el-button v-throttle type="primary" @click="handleSave">保存</el-button>
      </div>

      <div style="height: 20px"></div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { baseEnterpriseInfoId, enterpriseEdit, enterpriseReview } from '@/api/platform/enterprise/index';
import FormHeader from '@/components/FormHeader/index.vue';
import { useRoute } from 'vue-router';
import router from '@/router';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { review_status, plat_qualification_grade, plat_credit_rating } = toRefs<any>(
  proxy?.useDict('review_status', 'plat_qualification_grade', 'plat_credit_rating')
);

// 获取router路由参数
const route = useRoute();
const { id, type } = route.query;
const operateMode = ref(type);
// 编辑/详情模式
const disabledIf = ref(true);
// type = 'view' | 'edit' | 'audit'; 详情模式 编辑模式 审核模式
disabledIf.value = type !== 'view';

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
baseEnterpriseInfoId(id as string)
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

// 审核
const cancelAudit = async (type: number) => {
  try {
    proxy?.$modal.loading('正在审核，请稍候...');
    await enterpriseReview({
      enterpriseInfo: {
        ...formData.value,
        contacts: undefined,
        folders: undefined,
        reviewStatus: type
      },
      contacts: formData.value.contacts,
      folder: formData.value.folders
    }).then(() => {
      ElMessage.success('审核成功');
      router.push({
        query: {
          ...route.query,
          type: 'view'
        }
      });
      operateMode.value = 'view';
      disabledIf.value = operateMode.value !== 'view';
    });
  } catch (error) {
    ElMessage.error('审核失败');
  } finally {
    proxy?.$modal.closeLoading();
  }
};
// 编辑保存
// 保存按钮事件 和详情接口返回的的数据结构略有区别
const handleSave = async () => {
  try {
    proxy?.$modal.loading('正在保存，请稍候...');
    await enterpriseEdit({
      enterpriseInfo: {
        ...formData.value,
        contacts: undefined,
        folders: undefined
      },
      contacts: formData.value.contacts,
      folder: formData.value.folders
    }).then(() => {
      ElMessage.success('保存成功');
      router.push({
        query: {
          ...route.query,
          type: 'view'
        }
      });
      operateMode.value = 'view';
      disabledIf.value = operateMode.value !== 'view';
    });
  } catch (error) {
    console.error('保存失败', error);
  } finally {
    proxy?.$modal.closeLoading();
  }
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
