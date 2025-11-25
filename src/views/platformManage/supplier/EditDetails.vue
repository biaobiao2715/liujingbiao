<!--
  标题: EditDetails.vue
  功能: 供应商编辑详情页
  说明: 用于供应商编辑自己的详细信息
  当前版本: 1.0
  开发信息: Created by 李春雷 2025-10-15
-->
<template>
  <el-dialog
    :title="operateMode === 'edit' ? '供应商编辑' : operateMode === 'audit' ? '供应商审核' : '供应商详情'"
    v-model="dialogVisible"
    width="80%"
  >
    <div :class="['supplier-edit-details', 'detail-form']" v-loading="loading">
      <!-- 基础信息 -->
      <el-form :model="formData" label-width="140px" :disabled="true">
        <FormHeader title="供应商基础信息" />
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="供应商编号">
              <el-input v-model="formData.enterpriseNumber" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="审核状态">
              <span style="color: var(--el-disabled-text-color); padding-left: 11px">
                {{ formData.reviewStatus === '0' ? '待审核' : formData.reviewStatus === '1' ? '审核通过' : '审核拒绝' }}
              </span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="供应商名称">
              <el-input v-model="formData.companyName" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="统一社会信用代码">
              <el-input v-model="formData.licenseNumber" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="注册资本">
              <el-input v-model="formData.signUpCapital"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="注册日期">
              <el-input :value="formattedSignUpTime" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="注册地址">
              <el-input :value="formattedSignAddress" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="办公地址">
              <el-input v-model="formData.officeAddress"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="经营范围">
              <el-input v-model="formData.businessScope" type="textarea"></el-input>
            </el-form-item>
          </el-col>
          <!-- 营业执照 -->
          <el-col :span="12">
            <el-form-item label="营业执照">
              <!-- <img :src="formData.licenseImage" width="48" /> -->
              <el-image
                style="width: 100px; height: 100px"
                :src="formData.licenseImage"
                :preview-src-list="[formData.licenseImage]"
                show-progress
                fit="cover"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <!-- 法人信息 -->
        <FormHeader title="法人信息" />
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="法人姓名">
              <el-input v-model="contactF.contactUserName"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="证件类型">
              <el-input v-model="idType"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="证件号码">
              <el-input v-model="contactF.contactIdCard"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话">
              <el-input v-model="contactF.contactPhone"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <!-- 联系人信息 -->
        <FormHeader title="联系人信息" />
        <el-row :gutter="20" v-for="(contact, index) in contactZ || []" :key="index">
          <el-col :span="12">
            <el-form-item :label="'联系人' + (index + 1)">
              <el-input v-model="contact.contactUserName"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话">
              <el-input v-model="contact.contactPhone"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <!-- 账户信息 -->
        <FormHeader title="账户信息" />
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="账户名">
              <el-input v-model="formData.loginUserName"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="注册手机号">
              <el-input v-model="formData.phoneNumber"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <div :class="['supplier-edit-details', operateMode === 'view' ? 'detail-form' : '']">
      <!-- 供应商信息 -->
      <el-form :model="formData" label-width="140px" :disabled="operateMode === 'view'">
        <FormHeader title="供应商信息" />
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="资质等级">
              <el-select v-model="formData.credentialLevel" :placeholder="operateMode === 'view' ? '' : '请选择资质等级'" filterable clearable>
                <el-option v-for="dict in plat_qualification_grade" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="信用等级">
              <el-select v-model="formData.creditLevel" :placeholder="operateMode === 'view' ? '' : '请选择信用等级'" filterable clearable>
                <el-option v-for="dict in plat_credit_rating" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <!-- 资料清单 -->
      <el-form :model="formData" label-width="140px">
        <FormHeader title="资料清单" />
        <el-table :data="formData.folders" border>
          <el-table-column type="index" label="序号" width="100"></el-table-column>
          <el-table-column prop="originalName" label="附件名">
            <template #default="scope">
              {{ scope.row.ossInfo?.originalName }}
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注"></el-table-column>
          <el-table-column label="操作">
            <template #default="scope">
              <el-button type="primary" @click="downloadAttachment(scope.row.ossInfo?.originalName, scope.row.ossInfo?.url)">下载</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form>
      <!-- 供应商画像 -->
      <el-form :model="activityInfo" label-width="140px" v-if="formData.reviewStatus === '1'">
        <FormHeader title="供应商画像" />
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

          <el-table :data="activityInfo.transactionActivity.orders" border>
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
          <el-table :data="activityInfo.violationRecords" border>
            <el-table-column type="index" label="序号" width="100"></el-table-column>
            <el-table-column prop="closeCaseTime" label="违规时间"> </el-table-column>
            <el-table-column prop="dealResult" label="违规描述"></el-table-column>
          </el-table>
        </div>
      </el-form>
      <!-- 审核意见 -->
      <el-form :model="formData" label-width="140px" :disabled="operateMode === 'view'" v-if="operateMode !== 'edit'">
        <FormHeader title="审核意见" />
        <el-form-item label="审核意见">
          <el-input v-model="formData.reviewRemark" type="textarea" maxlength="200" :rows="3"></el-input>
        </el-form-item>
      </el-form>
      <!-- 操作按钮 -->
      <div style="margin-top: 20px; text-align: center" v-if="operateMode === 'audit'">
        <el-button type="danger" @click="handleAudit(99)">审核退回</el-button>
        <el-button type="success" @click="handleAudit(1)">审核通过</el-button>
      </div>
      <div style="margin-top: 20px; text-align: center" v-if="operateMode === 'edit'">
        <el-button type="primary" @click="handleSave">保存</el-button>
      </div>
    </div>
  </el-dialog>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import FormHeader from '@/components/FormHeader/index.vue';
import { useRoute } from 'vue-router';
import { enterpriseEdit, enterpriseReview, baseEnterpriseInfoId, getTransactionInfo, getViolationInfo } from '@/api/platform/enterprise';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { review_status, plat_qualification_grade, plat_credit_rating } = toRefs<any>(
  proxy?.useDict('review_status', 'plat_qualification_grade', 'plat_credit_rating')
);
const emit = defineEmits(['saveSuccess']);
// 定义接口返回数据的类型
interface SupplierDetails {
  id?: string;
  enterpriseNumber?: string;
  enterpriseType?: string;
  companyName?: string;
  licenseNumber?: string;
  signUpTime?: string;
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
  auditPerson?: number;
  accountName?: string;
  licenseImage?: string;
  province?: string;
  city?: string;
  district?: string;
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
  legalPerson?: {
    contactUserType?: string;
    contactUserName?: string;
    contactPhone?: string;
    contactIdCard?: string;
  };
}
const route = useRoute();

const { id, type } = route.query;

const operateMode = ref(type);

const loading = ref(false);

const dialogVisible = ref(false);

const activityInfo = ref({
  transactionActivity: {
    orders: [],
    transactionCount: 0,
    loginDate: '',
    lastTransactionTime: ''
  },
  violationRecords: []
});

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
  auditPerson: undefined,
  accountName: '',
  contacts: [],
  folders: [],
  legalPerson: {
    contactUserType: '',
    contactUserName: '',
    contactPhone: '',
    contactIdCard: ''
  }
});

const enterpriseProfileType = ref('1'); // 供应商画像类型 1：交易活跃度 2：违规记录

const enterpriseProfileTypeOptions = ref([
  { label: '交易活跃度', value: '1' },
  { label: '违规记录', value: '2' }
]);

const contactZ = ref([]); // 自然人

const contactF = ref({
  // 法人联系人信息
  contactUserType: '',
  contactUserName: '',
  contactIdCard: '',
  contactPhone: ''
});
const idType = ref('身份认证');

const formattedSignUpTime = computed(() => formData.value.signUpTime?.substring(0, 10) || '');

const formattedSignAddress = computed(() => {
  return formData.value.province + formData.value.city + formData.value.district + formData.value.signUpAddress || '';
});

const getSupplierDetails = async () => {
  if (formData.value.id) {
    loading.value = true;
    try {
      const response = await baseEnterpriseInfoId(formData.value.id);
      formData.value = response.data;
      // 法人信息 只用来回显
      formData.value.legalPerson = { ...response.data.contacts.find((contact) => contact.contactUserType === '1') };
      formData.value.legalPerson.contactUserType = '身份证';
      // 防止为null的报错
      formData.value.credentialLevel = formData.value.credentialLevel || '';
      formData.value.creditLevel = formData.value.creditLevel || '';
      //  营业执照
      formData.value.licenseImage = formData.value.folders?.find((folder) => folder.fileType === '1')?.ossInfo?.url || '';
      formData.value.enterpriseType = '供应商'; //固定死
      contactZ.value = [];
      if (response.data?.contacts?.length > 0) {
        response.data.contacts.forEach((element) => {
          if (element.contactUserType == 1) {
            contactF.value = element;
          } else {
            contactZ.value.push(element);
          }
        });
      }
    } catch (error) {
      console.error('获取供应商详情失败', error);
    } finally {
      loading.value = false;
    }
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

// 保存按钮事件 和详情接口返回的的数据结构略有区别
const handleSave = async () => {
  try {
    loading.value = true;
    const response = await enterpriseEdit({
      enterpriseInfo: {
        ...formData.value,
        contacts: undefined,
        folders: undefined,
        legalPerson: formData.value.legalPerson?.contactUserName || ''
      },
      contacts: formData.value.contacts,
      folder: formData.value.folders
    });
    if (response.code === 200) {
      ElMessage.success('保存成功');
      emit('saveSuccess');
      dialogVisible.value = false;
    }
  } catch (error) {
    console.error('保存失败', error);
  } finally {
    loading.value = false;
  }
};
// 审核按钮事件
const handleAudit = async (status: number) => {
  try {
    // 判断资质等级和信用等级是否选择
    if (!formData.value.credentialLevel) {
      ElMessage.error('请选择资质等级');
      return;
    }
    if (!formData.value.creditLevel) {
      ElMessage.error('请选择信用等级');
      return;
    }
    // 审核不通过 必须填写审核备注
    if (status === 99 && !formData.value.reviewRemark) {
      ElMessage.error('请填写审核意见');
      return;
    }
    loading.value = true;
    const res = await enterpriseReview({
      enterpriseInfo: {
        ...formData.value,
        contacts: undefined,
        folders: undefined,
        reviewStatus: status,
        legalPerson: formData.value.legalPerson?.contactUserName || ''
      },
      contacts: formData.value.contacts,
      folder: formData.value.folders
    });
    if (res.code === 200) {
      ElMessage.success('审核成功');
      operateMode.value = 'view';
      emit('saveSuccess');
      dialogVisible.value = false;
    }
  } catch (error) {
    ElMessage.error('审核失败');
  } finally {
    loading.value = false;
  }
};
// 下载附件
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
// 打开弹窗
const handleOpenDialog = async (id: string, type: 'view' | 'edit' | 'audit') => {
  operateMode.value = type;
  formData.value.id = id;
  dialogVisible.value = true;
  await getSupplierDetails();
  if (formData.value.reviewStatus === '1') {
    getTransactionInfoDetail();
    getViolationInfoDetail();
  }
};

defineExpose({
  handleOpenDialog
});
</script>
<style scoped lang="scss"></style>
