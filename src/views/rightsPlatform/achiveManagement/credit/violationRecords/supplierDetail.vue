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
      <FormHeader :title="baseInfoTitle" />
      <el-row :gutter="20" class="detail-form">
        <el-col :span="12">
          <el-form-item :label="baseEntityWord + '编码'">
            <el-input v-model="formData.enterpriseNumber" disabled></el-input>
          </el-form-item>

          <el-form-item :label="baseEntityWord + '名称'">
            <el-input v-model="formData.companyName" disabled></el-input>
          </el-form-item>

          <el-form-item label="注册资本">
            <el-input v-model="formData.signUpCapital" disabled></el-input>
          </el-form-item>

          <el-form-item label="注册地址">
            <el-input v-model="AddressText" disabled></el-input>
          </el-form-item>

          <el-form-item label="办公地址">
            <el-input v-model="formData.officeAddress" disabled></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="审核状态">
            <el-select v-model="formData.reviewStatus" filterable clearable disabled>
              <el-option v-for="dict in review_status" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>

          <el-form-item label="社会统一信用代码">
            <el-input v-model="formData.licenseNumber" disabled></el-input>
          </el-form-item>

          <el-form-item label="注册日期">
            <!-- <el-input v-model="formData.signUpTime" disabled></el-input> -->
            <div style="color: #a8abb2; padding-left: 12px">{{ proxy.parseTime(formData.signUpTime, '{y}-{m}-{d}') }}</div>
          </el-form-item>

          <el-form-item label="营业执照">
            <img v-if="urlImage" :src="urlImage" height="80px" width="126px" alt="营业执照" />
          </el-form-item>
        </el-col>

        <el-col :span="24">
          <el-form-item :label="baseEntityWord + '经营范围'">
            <el-input v-model="formData.businessScope" autosize type="textarea" disabled></el-input>
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
            <el-select v-model="contactF.contactUserType" filterable clearable disabled>
              <el-option v-for="dict in contact_user_type" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
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

      <FormHeader :title="baseEntityWord + '信息'" />
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
      <el-table :data="formData.folders">
        <el-table-column type="index" label="序号" width="55" />
        <el-table-column prop="name" label="附件名">
          <template #default="scope">
            {{ scope.row.ossInfo.originalName }}
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注"></el-table-column>
        <el-table-column label="操作">
          <template #default="scope">
            <el-button v-throttle type="primary" @click="downloadAttachment(scope.row.ossInfo?.originalName, scope.row.ossInfo?.url)">下载</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 企业画像 -->
      <el-form :model="activityInfo" label-width="140px" v-if="formData.reviewStatus === '1'">
        <FormHeader :title="baseEntityWord + '画像'" />
        <el-segmented v-model="enterpriseProfileType" :options="enterpriseProfileTypeOptions" class="mb-12" />

        <!-- 交易活动 -->
        <div v-show="enterpriseProfileType === '1'">
          <el-row>
            <el-col :span="12">
              <el-form-item label="近7日交易量">
                {{ activityInfo.transactionActivity?.transactionCount || '' }}
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="最近一笔交易时间">
                {{ activityInfo.transactionActivity?.lastTransactionTime || '' }}
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="最后系统登录时间">
                {{ activityInfo.transactionActivity?.loginDate || '' }}
              </el-form-item>
            </el-col>
          </el-row>

          <el-table :data="activityInfo.transactionActivity.orders">
            <el-table-column type="index" label="序号" width="100"></el-table-column>
            <el-table-column prop="createTime" label="交易时间"> </el-table-column>
            <el-table-column prop="orderSn" label="订单编号"></el-table-column>
            <el-table-column prop="orderStatus" label="订单状态">
              <template #default="scope">
                {{
                  scope.row.orderStatus === 1 ? '待发货' : scope.row.orderStatus === 2 ? '已发货' : scope.row.orderStatus === 3 ? '已完成' : '已取消'
                }}
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div v-show="enterpriseProfileType === '2'">
          <el-table :data="activityInfo.violationRecords">
            <el-table-column type="index" label="序号" width="100"></el-table-column>
            <el-table-column prop="closeCaseTime" label="违规时间"> </el-table-column>
            <el-table-column prop="dealResult" label="违规描述"></el-table-column>
          </el-table>
        </div>
      </el-form>

      <div v-if="operateMode !== 'edit'" :class="!disabledIf ? 'detail-form' : ''">
        <FormHeader title="审核意见" />
        <el-form-item label="审核意见">
          <el-input v-model="formData.reviewRemark" type="textarea" maxlength="200" :rows="3" :disabled="!disabledIf"></el-input>
        </el-form-item>
      </div>

      <!-- 操作按钮 -->
      <div style="margin-top: 20px; display: flex; justify-content: end; align-items: end" v-if="operateMode === 'audit'">
        <el-button v-throttle type="danger" @click="cancelAudit(99)">审核退回</el-button>
        <el-button v-throttle style="background: #108c58; color: #fff" @click="cancelAudit(1)">审核通过</el-button>
      </div>
      <div style="margin-top: 20px; display: flex; justify-content: end; align-items: end" v-if="operateMode === 'edit'">
        <el-button v-throttle style="background: #108c58; color: #fff" @click="handleSave">保存</el-button>
      </div>

      <div style="height: 20px"></div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  baseEnterpriseInfoId,
  enterpriseEdit,
  enterpriseReview,
  getTransactionInfo,
  getViolationInfo,
  updateCreditLevel
} from '@/api/platform/enterprise/index';
import { useUserStore } from '@/store/modules/user';
import FormHeader from '@/components/FormHeader/index.vue';

import { FormData } from '@/api/platform/enterprise/types'; //ts类型
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { review_status, plat_qualification_grade, plat_credit_rating, contact_user_type } = toRefs<any>(
  proxy?.useDict('review_status', 'plat_qualification_grade', 'plat_credit_rating', 'contact_user_type')
);

// 通过 props 接收父组件传参，并设定默认值（type 默认为 'view'）
const props = withDefaults(
  defineProps<{
    id: string | number;
    type?: 'view' | 'edit' | 'audit';
  }>(),
  {
    type: 'view'
  }
);
// 子组件对外事件
const emit = defineEmits<{
  (e: 'refresh'): void;
  (e: 'cancel'): void;
}>();

// userType 计算：只取一次 store 引用，避免多次调用 useUserStore()
const userStore = useUserStore();
const userType = computed(() => userStore.userType);
// 企业基础信息标题：userType 为 2 显示供应商基础信息，其余（含默认 3）显示企业基础信息
const baseInfoTitle = computed(() => (userType.value === 2 ? '供应商基础信息' : '企业基础信息'));
const baseEntityWord = computed(() => (userType.value === 2 ? '供应商' : '企业'));
const loading = ref(false);

// 操作模式来源于 props
const operateMode = ref(props.type);
// 编辑/详情模式
const disabledIf = ref(true);
disabledIf.value = props.type !== 'view';

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

const areaCodes = ref('');

const contactZ = ref([]); // 自然人

const enterpriseProfileType = ref('1'); // 企业画像类型 1：交易活跃度 2：违规记录

const enterpriseProfileTypeOptions = ref([
  { label: '交易活跃度', value: '1' },
  { label: '违规记录', value: '2' }
]);

const contactF = ref({
  // 法人联系人信息
  contactUserType: '',
  contactUserName: '',
  contactIdCard: '',
  contactPhone: ''
});

// 企业画像相关
const activityInfo = ref({
  transactionActivity: {
    orders: [],
    transactionCount: 0,
    loginDate: '',
    lastTransactionTime: ''
  },
  violationRecords: []
});

const urlImage = ref(); // 营业执照

onMounted(async () => {
  await getSupplierDetails();
  if (formData.value.reviewStatus === '1') {
    getTransactionInfoDetail();
    getViolationInfoDetail();
  }
});

// 获取企业详情
const getSupplierDetails = async () => {
  loading.value = true;
  try {
    const res = await baseEnterpriseInfoId(String(props.id));
    formData.value = res.data;
    areaCodes.value = formData.value.province + formData.value.city + formData.value.district;
    if (res.data?.contacts?.length > 0) {
      res.data.contacts.forEach((element) => {
        // console.log('33', element);
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
  } catch (error) {
    console.error('获取企业基本信息失败:', error);
  } finally {
    loading.value = false;
  }
};

const AddressText = computed(() => {
  return formData.value.province + formData.value.city + formData.value.district + formData.value.signUpAddress;
});

/**
 * 审核前置校验
 * @param status 审核状态，示例：1=通过，99=不通过（与现有后端约定保持一致）
 * @returns 是否通过校验
 */
const validateAudit = (status: number): boolean => {
  // 审核退回：审核意见必填
  if (status === 99 && !formData.value.reviewRemark?.trim()) {
    ElMessage.error('请填写审核意见');
    return false;
  }

  // 审核通过：统一校验必填字段，便于后续扩展
  if (status === 1) {
    const requiredForPass: Array<{ key: keyof FormData; msg: string }> = [
      { key: 'credentialLevel', msg: '请选择资质等级' },
      { key: 'creditLevel', msg: '请选择信用等级' }
    ];
    for (const { key, msg } of requiredForPass) {
      if (!formData.value[key]) {
        ElMessage.error(msg);
        return false;
      }
    }
  }

  return true;
};

// 审核
const cancelAudit = async (type: number) => {
  if (!validateAudit(type)) return;
  try {
    proxy?.$modal.loading('正在审核，请稍候...');
    if (!validateAudit(type)) return;
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
      emit('refresh');
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
    await updateCreditLevel({
      id: formData.value.id,
      creditLevel: formData.value.creditLevel,
      credentialLevel: formData.value.credentialLevel
    }).then(() => {
      ElMessage.success('保存成功');
      emit('refresh');
    });
  } catch (error) {
    console.error('保存失败', error);
  } finally {
    proxy?.$modal.closeLoading();
  }
};

//  交易活跃度
const getTransactionInfoDetail = async () => {
  if (formData.value.id) {
    loading.value = true;
    try {
      const response = await getTransactionInfo({
        id: formData.value.id
      });
      console.log(response);
      activityInfo.value.transactionActivity = response.data;
      // formData.value = response.data;
    } catch (error) {
      console.error('获取交易活跃度详情失败', error);
    } finally {
      loading.value = false;
    }
  }
};

// 违规记录
const getViolationInfoDetail = async () => {
  if (formData.value.id) {
    loading.value = true;
    try {
      const response = await getViolationInfo({
        id: formData.value.id
      });
      console.log(response);
      activityInfo.value.violationRecords = response.data || [];
      // formData.value = response.data;
    } catch (error) {
      console.error('获取违规记录详情失败', error);
    } finally {
      loading.value = false;
    }
  }
};

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
