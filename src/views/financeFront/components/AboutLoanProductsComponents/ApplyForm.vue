<!--
  文件: ApplyForm.vue
  功能: 信贷产品申请统一表单（支持采购商个人与供应商/企业两种主体）
  描述:
    1. 根据 userType 动态展示不同信息块（企业基础信息 + 法人信息 + 申请人 / 或 个人信息）
    2. 贷款信息区统一：金额/周期/还款方式/收款账户等
    3. 多处单文件上传（身份证/法人证件/银行卡/授权PDF）均抽象成通用上传器
    4. 使用字典筛选产品限定的贷款周期与还款方式
  维护:
    - 初始创建: 2025-10-15 刘景彪
    - 注释补充: 2025-11-24 Copilot
-->
<template>
  <div class="supplier-edit-details">
    <!-- 基础信息 -->
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="140px">
      <!-- 供应商/企业 -->
      <div v-if="userStore.userType === '2' || userStore.userType === '3'">
        <div class="detail-form-card">
          <div class="detail-form-card-header">
            <div class="card-title">企业基础信息</div>
            <div class="card-close" @click="handleShowDetails">产品详情</div>
          </div>
          <el-row :gutter="20" class="detail-form">
            <el-col :span="12">
              <el-form-item label="企业编码">
                <el-input v-model="supplierDetails.enterpriseNumber" disabled></el-input>
              </el-form-item>

              <el-form-item label="企业名称">
                <el-input v-model="supplierDetails.companyName" disabled></el-input>
              </el-form-item>

              <el-form-item label="注册资本">
                <el-input v-model="supplierDetails.signUpCapital" disabled></el-input>
              </el-form-item>

              <el-form-item label="注册地址">
                <el-input v-model="supplierDetails.signUpAddress" disabled></el-input>
              </el-form-item>

              <el-form-item label="办公地址">
                <el-input v-model="supplierDetails.officeAddress" disabled></el-input>
              </el-form-item>

              <el-form-item label="资质等级">
                <el-select v-model="supplierDetails.credentialLevel" placeholder="资质等级" filterable clearable disabled>
                  <el-option v-for="dict in plat_qualification_grade" :key="dict.value" :label="dict.label" :value="dict.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="信用等级">
                <el-select v-model="supplierDetails.creditLevel" placeholder="信用等级" filterable clearable disabled>
                  <el-option v-for="dict in plat_credit_rating" :key="dict.value" :label="dict.label" :value="dict.value" />
                </el-select>
              </el-form-item>
              <el-form-item label="审核状态">
                <el-select v-model="supplierDetails.reviewStatus" placeholder="审核状态" filterable clearable disabled>
                  <el-option v-for="dict in review_status" :key="dict.value" :label="dict.label" :value="dict.value" />
                </el-select>
              </el-form-item>

              <el-form-item label="社会统一信用代码">
                <el-input v-model="supplierDetails.licenseNumber" disabled></el-input>
              </el-form-item>

              <el-form-item label="注册日期">
                <el-input v-model="supplierDetails.signUpTime" disabled></el-input>
              </el-form-item>

              <el-form-item label="营业执照">
                <img :src="supplierDetails.url" height="80px" width="126px" alt="营业执照" />
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item label="企业经营范围">
                <el-input v-model="supplierDetails.businessScope" type="textarea" autosize disabled></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <div class="detail-form-card">
          <div class="detail-form-card-header">
            <div class="card-title">法人信息</div>
          </div>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="法人姓名" prop="legalPersonName">
                <el-input v-model="formData.legalPersonName"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="联系电话" prop="legalPersonContactPhone">
                <el-input v-model="formData.legalPersonContactPhone"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="证件类型" prop="legalPersonIdCardType">
                <el-select v-model="formData.legalPersonIdCardType" placeholder="证件类型" filterable clearable disabled>
                  <el-option v-for="dict in card_type" :key="dict.value" :label="dict.label" :value="dict.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="证件号码" prop="legalPersonIdCardNumber">
                <el-input v-model="formData.legalPersonIdCardNumber"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="法人证件正面" class="uploadcss" prop="idCardPhotoFront2">
                <el-upload
                  :file-list="uploaderLegalFront.files.value"
                  :limit="1"
                  list-type="picture-card"
                  action="#"
                  accept="image/*"
                  :on-preview="handlePictureCardPreview"
                  :before-upload="uploaderLegalFront.beforeUpload"
                  :http-request="uploaderLegalFront.uploadRequest"
                  :on-remove="uploaderLegalFront.handleRemove"
                  :on-exceed="uploaderLegalFront.handleExceed"
                >
                  <template #default>
                    <div v-if="uploaderLegalFront.files.value.length < 1" class="avatar-uploader">
                      <el-icon class="avatar-uploader-icon"><Plus /></el-icon>
                      <div class="avatar-uploader-text">上传正面</div>
                    </div>
                    <div v-else style="color: #999; font-size: 12px; width: 64px; text-align: center">已完成</div>
                  </template>
                </el-upload>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="法人证件反面" class="uploadcss" prop="idCardPhotoBack2">
                <el-upload
                  :file-list="uploaderLegalBack.files.value"
                  :limit="1"
                  list-type="picture-card"
                  action="#"
                  accept="image/*"
                  :on-preview="handlePictureCardPreview"
                  :before-upload="uploaderLegalBack.beforeUpload"
                  :http-request="uploaderLegalBack.uploadRequest"
                  :on-remove="uploaderLegalBack.handleRemove"
                  :on-exceed="uploaderLegalBack.handleExceed"
                >
                  <template #default>
                    <div v-if="uploaderLegalBack.files.value.length < 1" class="avatar-uploader">
                      <el-icon class="avatar-uploader-icon"><Plus /></el-icon>
                      <div class="avatar-uploader-text">上传反面</div>
                    </div>
                    <div v-else style="color: #999; font-size: 12px; width: 64px; text-align: center">已完成</div>
                  </template>
                </el-upload>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <div class="detail-form-card">
          <div class="detail-form-card-header">
            <div class="card-title">申请人</div>
          </div>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="申请人" prop="realName">
                <el-input v-model="formData.realName"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="联系电话" prop="contactPhone">
                <el-input v-model="formData.contactPhone"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="身份证正面" class="uploadcss" prop="idCardPhotoFront">
                <el-upload
                  :file-list="uploaderIdFront.files.value"
                  :limit="1"
                  list-type="picture-card"
                  action="#"
                  accept="image/*"
                  :on-preview="handlePictureCardPreview"
                  :before-upload="uploaderIdFront.beforeUpload"
                  :http-request="uploaderIdFront.uploadRequest"
                  :on-remove="uploaderIdFront.handleRemove"
                  :on-exceed="uploaderIdFront.handleExceed"
                >
                  <template #default>
                    <div v-if="uploaderIdFront.files.value.length < 1" class="avatar-uploader">
                      <el-icon class="avatar-uploader-icon"><Plus /></el-icon>
                      <div class="avatar-uploader-text">上传正面</div>
                    </div>
                    <div v-else style="color: #999; font-size: 12px; width: 64px; text-align: center">已完成</div>
                  </template>
                </el-upload>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="身份证反面" class="uploadcss" prop="idCardPhotoBack">
                <el-upload
                  :file-list="uploaderIdBack.files.value"
                  :limit="1"
                  list-type="picture-card"
                  action="#"
                  accept="image/*"
                  :on-preview="handlePictureCardPreview"
                  :before-upload="uploaderIdBack.beforeUpload"
                  :http-request="uploaderIdBack.uploadRequest"
                  :on-remove="uploaderIdBack.handleRemove"
                  :on-exceed="uploaderIdBack.handleExceed"
                >
                  <template #default>
                    <div v-if="uploaderIdBack.files.value.length < 1" class="avatar-uploader">
                      <el-icon class="avatar-uploader-icon"><Plus /></el-icon>
                      <div class="avatar-uploader-text">上传反面</div>
                    </div>
                    <div v-else style="color: #999; font-size: 12px; width: 64px; text-align: center">已完成</div>
                  </template>
                </el-upload>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="授权文件 (PDF)" prop="authorizationFile" class="uploadcss">
                <el-upload
                  :file-list="uploaderAuthorization.files.value"
                  :limit="1"
                  list-type="picture-card"
                  action="#"
                  accept=".pdf"
                  :before-upload="uploaderAuthorization.beforeUpload"
                  :http-request="uploaderAuthorization.uploadRequest"
                  :on-remove="uploaderAuthorization.handleRemove"
                  :on-exceed="uploaderAuthorization.handleExceed"
                >
                  <template #default>
                    <div v-if="uploaderAuthorization.files.value.length < 1" class="avatar-uploader">
                      <el-icon class="avatar-uploader-icon"><Plus /></el-icon>
                      <div class="avatar-uploader-text">上传PDF</div>
                    </div>
                    <div v-else style="color: #999; font-size: 12px; width: 64px; text-align: center">已上传</div>
                  </template>
                </el-upload>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </div>
      <!-- 采购商 -->
      <div v-else>
        <div class="detail-form-card">
          <div class="detail-form-card-header">
            <div class="card-title">个人信息</div>
          </div>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="姓名" prop="realName">
                <el-input v-model="formData.realName"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="出生年月" prop="idCardBirthday">
                <el-date-picker
                  v-model="formData.idCardBirthday"
                  value-format="YYYY-MM-DD"
                  type="date"
                  style="width: 100%"
                  :disabled-date="disableFutureDate"
                  placeholder="请选择出生年月"
                ></el-date-picker>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="证件号码" prop="idCardNumber">
                <el-input v-model="formData.idCardNumber"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="手机号" prop="contactPhone">
                <el-input v-model="formData.contactPhone"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="联系地址" prop="contactAddress">
                <el-input v-model="formData.contactAddress"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12"></el-col>
            <el-col :span="12">
              <el-form-item label="身份证正面" class="uploadcss" prop="idCardPhotoFront">
                <el-upload
                  :file-list="uploaderIdFront.files.value"
                  :limit="1"
                  list-type="picture-card"
                  action="#"
                  accept="image/*"
                  :on-preview="handlePictureCardPreview"
                  :before-upload="uploaderIdFront.beforeUpload"
                  :http-request="uploaderIdFront.uploadRequest"
                  :on-remove="uploaderIdFront.handleRemove"
                  :on-exceed="uploaderIdFront.handleExceed"
                >
                  <template #default>
                    <div v-if="uploaderIdFront.files.value.length < 1" class="avatar-uploader">
                      <el-icon class="avatar-uploader-icon"><Plus /></el-icon>
                      <div class="avatar-uploader-text">上传正面</div>
                    </div>
                    <div v-else style="color: #999; font-size: 12px; width: 64px; text-align: center">已完成</div>
                  </template>
                </el-upload>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="身份证反面" class="uploadcss" prop="idCardPhotoBack">
                <el-upload
                  :file-list="uploaderIdBack.files.value"
                  :limit="1"
                  list-type="picture-card"
                  action="#"
                  accept="image/*"
                  :on-preview="handlePictureCardPreview"
                  :before-upload="uploaderIdBack.beforeUpload"
                  :http-request="uploaderIdBack.uploadRequest"
                  :on-remove="uploaderIdBack.handleRemove"
                  :on-exceed="uploaderIdBack.handleExceed"
                >
                  <template #default>
                    <div v-if="uploaderIdBack.files.value.length < 1" class="avatar-uploader">
                      <el-icon class="avatar-uploader-icon"><Plus /></el-icon>
                      <div class="avatar-uploader-text">上传反面</div>
                    </div>
                    <div v-else style="color: #999; font-size: 12px; width: 64px; text-align: center">已完成</div>
                  </template>
                </el-upload>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </div>

      <div class="detail-form-card">
        <div class="detail-form-card-header">
          <div class="card-title">贷款信息</div>
        </div>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="贷款金额" prop="loanAmount">
              <el-input v-model="formData.loanAmount">
                <template #append>万元</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="贷款周期" prop="loanTerm">
              <el-select v-model="formData.loanTerm" placeholder="贷款周期" filterable clearable>
                <el-option v-for="dict in loanCycleOptions" :key="dict.value" :label="dict.label + '期'" :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="还款方式" prop="repaymentMethod">
              <el-select v-model="formData.repaymentMethod" placeholder="还款方式" filterable clearable>
                <el-option v-for="dict in repaymentMethodOptions" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="收款卡银行" prop="collectionBankCode">
              <el-select v-model="formData.collectionBankCode" placeholder="收款卡银行" filterable clearable>
                <el-option v-for="dict in bank_code" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="银行卡号" prop="bankAccountNumber">
              <el-input v-model="formData.bankAccountNumber"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12"></el-col>
          <el-col :span="12">
            <el-form-item label="银行卡正面" class="uploadcss" prop="bankCardPhotoFront">
              <el-upload
                :file-list="uploaderBankFront.files.value"
                :limit="1"
                list-type="picture-card"
                action="#"
                accept="image/*"
                :on-preview="handlePictureCardPreview"
                :before-upload="uploaderBankFront.beforeUpload"
                :http-request="uploaderBankFront.uploadRequest"
                :on-remove="uploaderBankFront.handleRemove"
                :on-exceed="uploaderBankFront.handleExceed"
              >
                <template #default>
                  <div v-if="uploaderBankFront.files.value.length < 1" class="avatar-uploader">
                    <el-icon class="avatar-uploader-icon"><Plus /></el-icon>
                    <div class="avatar-uploader-text">上传正面</div>
                  </div>
                  <div v-else style="color: #999; font-size: 12px; width: 64px; text-align: center">已完成</div>
                </template>
              </el-upload>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="银行卡反面" class="uploadcss" prop="bankCardPhotoBack">
              <el-upload
                :file-list="uploaderBankBack.files.value"
                :limit="1"
                list-type="picture-card"
                action="#"
                accept="image/*"
                :on-preview="handlePictureCardPreview"
                :before-upload="uploaderBankBack.beforeUpload"
                :http-request="uploaderBankBack.uploadRequest"
                :on-remove="uploaderBankBack.handleRemove"
                :on-exceed="uploaderBankBack.handleExceed"
              >
                <template #default>
                  <div v-if="uploaderBankBack.files.value.length < 1" class="avatar-uploader">
                    <el-icon class="avatar-uploader-icon"><Plus /></el-icon>
                    <div class="avatar-uploader-text">上传反面</div>
                  </div>
                  <div v-else style="color: #999; font-size: 12px; width: 64px; text-align: center">已完成</div>
                </template>
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 操作按钮 -->
      <el-row type="flex" justify="center" :gutter="5" style="margin-top: 30px">
        <el-col :span="3"><el-button v-throttle type="primary" @click="submitApply">提交申请</el-button></el-col>
        <el-col :span="3"><el-button v-throttle type="primary" @click="handleShowDetails" plain>返回</el-button></el-col>
      </el-row>

      <div style="height: 160px"></div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
// ======================== 引入与初始化 ========================
import { ref, getCurrentInstance, toRefs, onMounted, computed, watch, type ComponentInternalInstance } from 'vue';
import { ElMessage, type UploadFile, type UploadRawFile, type UploadRequestOptions, type FormInstance, type FormRules } from 'element-plus';
import {
  getBaseEnterpriseInfo,
  getBasePurchaser,
  getCreditProductsVersionDetailNoTenant,
  applyPersonalLoan,
  applyEnterpriseLoan,
  getLoanApplicationsId,
  ossUploadImage
} from '@/api/financeFront/LoanProducts/index';
import { useUserStore } from '@/store/modules/user';
import { eventBus } from '@/utils/eventBus';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
// 统一加载需要的字典（审核状态/资质等级/信用等级/证件类型/贷款周期/还款方式/银行代码）
const { review_status, plat_qualification_grade, plat_credit_rating, card_type, loan_cycle, repayment_method, bank_code } = toRefs<any>(
  proxy?.useDict('review_status', 'plat_qualification_grade', 'plat_credit_rating', 'card_type', 'loan_cycle', 'repayment_method', 'bank_code')
);

// ======================== 组件属性 ========================
// productId: 信贷产品ID  id: 编辑时贷款申请ID（回显）
const props = defineProps({
  productId: {
    type: String || Number,
    required: null
  },
  id: {
    type: String || Number,
    required: null
  }
});
const userStore = useUserStore();
// 产品详情信息（包含限制条件：最大额度/可选周期/可选还款方式等）
const productDetails = ref<any>({});
// 企业/供应商详情信息（仅在 userType 为 2 / 3 时使用）
const supplierDetails = ref<any>({});
const formRef = ref<FormInstance>();
// ======================== 表单数据（核心申请字段 + 上传对应的 ossId） ========================
const formData = ref<any>({
  // 法人信息
  legalPersonName: '',
  legalPersonContactPhone: '',
  legalPersonIdCardNumber: '',
  // 申请人 & 个人信息
  realName: '',
  contactPhone: '',
  authorizationFile: '',
  // 贷款信息
  loanAmount: '',
  loanTerm: '',
  repaymentMethod: '',
  collectionBankCode: '',
  bankAccountNumber: '',
  // 后端字段：法人身份证正反面
  idCardPhotoFront2: '',
  idCardPhotoBack2: '',
  // 通用身份证（申请人或个人，二选一场景）
  idCardPhotoFront: '',
  idCardPhotoBack: '',
  // 银行卡正反面
  bankCardPhotoFront: '',
  bankCardPhotoBack: ''
});

// 预览对话框（多上传区域共用）
const dialogImageUrl = ref('');
const dialogVisible = ref(false);

// 出生年月不可选择未来时间
const disableFutureDate = (time: Date) => {
  return time.getTime() > Date.now();
};

// ======================== 表单校验规则 ========================
// 覆盖基础必填/手机号格式/身份证格式/贷款金额合法性/上传完成性等场景
function parseIdCardBirthday(id: string): string | null {
  if (!id) return null;
  const clean = id.trim();
  if (clean.length === 18) {
    const part = clean.slice(6, 14); // YYYYMMDD
    if (/^\d{8}$/.test(part)) return part;
  } else if (/^\d{15}$/.test(clean)) {
    const part = clean.slice(6, 12); // YYMMDD
    if (/^\d{6}$/.test(part)) return '19' + part; // 15位默认 19xx 年
  }
  return null;
}
function normalizeBirthdayInput(v: string): string {
  return (v || '').trim().replace(/-/g, '').replace(/\//g, '');
}
const rules: FormRules = {
  legalPersonName: [{ required: true, message: '请输入法人姓名', trigger: 'blur' }],
  legalPersonContactPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    {
      validator: (_: any, value: any, cb: any) => {
        if (!value) return cb(new Error('请输入联系电话'));
        if (!/^1[3-9]\d{9}$/.test(String(value))) return cb(new Error('手机号格式不正确'));
        cb();
      },
      trigger: 'blur'
    }
  ],
  legalPersonIdCardNumber: [
    { required: true, message: '请输入证件号码', trigger: 'blur' },
    {
      validator: (_: any, value: any, cb: any) => {
        if (!value) return cb(new Error('请输入证件号码'));
        const reg = /^\d{6}(18|19|20)?\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[0-9Xx]$/;
        if (!reg.test(String(value))) return cb(new Error('身份证号码格式不正确'));
        cb();
      },
      trigger: 'blur'
    }
  ],
  realName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  contactPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    {
      validator: (_: any, value: any, cb: any) => {
        if (!value) return cb(new Error('请输入联系电话'));
        if (!/^1[3-9]\d{9}$/.test(String(value))) return cb(new Error('手机号格式不正确'));
        cb();
      },
      trigger: 'blur'
    }
  ],
  loanAmount: [
    { required: true, message: '请输入贷款金额', trigger: 'blur' },
    {
      // 自定义校验函数：贷款金额(单位: 万元)允许最多2位小数，>0 且不超过产品最大额度
      // 使用 any 规避泛型下 Arrayable 推断的下标类型问题
      validator: (rule: any, value: any, callback: any) => {
        if (value === '' || value === undefined || value === null) {
          return callback(new Error('请输入贷款金额'));
        }
        const str = String(value).trim();
        // 匹配 正数，允许整数或 1-2 位小数；允许 0.x 但不允许 0 或 0.00
        const reg = /^(0?\.\d{1,2}|[1-9]\d*(\.\d{1,2})?)$/;
        if (!reg.test(str)) {
          return callback(new Error('贷款金额需为正数且最多2位小数'));
        }
        const num = Number(str);
        if (num <= 0) {
          return callback(new Error('贷款金额必须大于0'));
        }
        const maxRaw = productDetails.value?.maxLoanAmount;
        const max = maxRaw !== undefined && maxRaw !== null && maxRaw !== '' ? Number(maxRaw) : undefined;
        if (max !== undefined && !isNaN(max) && num > max) {
          return callback(new Error(`贷款金额不能超过最大额度${max}`));
        }
        callback();
      },
      trigger: 'blur'
    }
  ],
  loanTerm: [{ required: true, message: '请选择贷款周期', trigger: 'change' }],
  repaymentMethod: [{ required: true, message: '请选择还款方式', trigger: 'change' }],
  collectionBankCode: [{ required: true, message: '请选择收款卡银行', trigger: 'change' }],
  bankAccountNumber: [{ required: true, message: '请输入银行卡号', trigger: 'blur' }],
  legalPersonIdCardType: [{ required: true, message: '请选择证件类型', trigger: 'change' }],
  contactAddress: [{ required: true, message: '请输入联系地址', trigger: 'blur' }],
  idCardNumber: [
    { required: true, message: '请输入证件号码', trigger: 'blur' },
    {
      validator: (_: any, value: any, cb: any) => {
        const val = String(value || '').trim();
        if (!val) return cb(new Error('请输入证件号码'));
        const reg = /^\d{6}(18|19|20)?\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[0-9Xx]$/;
        if (!reg.test(val)) return cb(new Error('身份证号码格式不正确'));
        const birthdayFromId = parseIdCardBirthday(val);
        if (formData.value.idCardBirthday) {
          const inputBirthday = normalizeBirthdayInput(formData.value.idCardBirthday);
          if (birthdayFromId && inputBirthday && !birthdayFromId.startsWith(inputBirthday)) {
            return cb(new Error('证件号码中的出生年月与填写的不一致'));
          }
        }
        cb();
      },
      trigger: 'blur'
    }
  ],
  idCardBirthday: [
    { required: true, message: '请输入出生年月', trigger: 'blur' },
    {
      validator: (_: any, value: any, cb: any) => {
        const v = String(value || '').trim();
        if (!v) return cb(new Error('请输入出生年月'));
        // 不允许未来日期
        const dateObj = new Date(v.replace(/-/g, '/') + ' 00:00:00');
        const today = new Date();
        // 将今日置零点方便比较
        today.setHours(0, 0, 0, 0);
        if (isNaN(dateObj.getTime())) {
          return cb(new Error('出生年月格式不正确'));
        }
        if (dateObj.getTime() > today.getTime()) {
          return cb(new Error('出生年月不能晚于今天'));
        }
        const idVal = String(formData.value.idCardNumber || '').trim();
        if (!idVal) return cb();
        const birthdayFromId = parseIdCardBirthday(idVal);
        if (birthdayFromId) {
          const inputBirthday = normalizeBirthdayInput(v);
          if (inputBirthday && !birthdayFromId.startsWith(inputBirthday)) {
            return cb(new Error('出生年月与证件号码信息不匹配'));
          }
        }
        cb();
      },
      trigger: 'change'
    }
  ],
  // 上传图片校验（均需两张）
  // 新校验：根据单张正反面 ossId 字段
  idCardPhotoFront2: [{ required: true, message: '请上传法人证件正面', trigger: 'change' }],
  idCardPhotoBack2: [{ required: true, message: '请上传法人证件反面', trigger: 'change' }],
  idCardPhotoFront: [{ required: true, message: '请上传身份证正面', trigger: 'change' }],
  idCardPhotoBack: [{ required: true, message: '请上传身份证反面', trigger: 'change' }],
  bankCardPhotoFront: [{ required: true, message: '请上传银行卡正面', trigger: 'change' }],
  bankCardPhotoBack: [{ required: true, message: '请上传银行卡反面', trigger: 'change' }],
  authorizationFile: [{ required: true, message: '请上传授权文件PDF', trigger: 'change' }]
};

// ======================== 构建提交载荷 ========================
function buildPayload() {
  // 说明: 根据产品详情与当前用户类型整合后端所需字段；未在表单里直接暴露的字段（productVersion / lenderType 等）一起塞入
  const base: any = {
    productId: productDetails.value.productId || '',
    productVersion: productDetails.value.productVersion || '',
    lenderType: userStore.userType,
    lenderId: userStore.userId,

    applyStatus: '1',
    idCardType: '0',
    idCardNumber: formData.value.legalPersonIdCardNumber || '',
    collectionAccountName: formData.value.realName || '',

    ...formData.value
  };
  return base;
}

// 提交申请
const submitApply = async () => {
  // ======================== 提交申请主流程 ========================
  // 1. 先整体校验
  // 2. 根据主体类型选择不同接口（个人 / 企业）
  // 3. 成功后提示
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) {
    ElMessage.error('表单校验未通过，请完善必填项');
    return;
  }
  const payload = buildPayload();
  try {
    const apiFn = userStore.userType === '1' ? applyPersonalLoan : applyEnterpriseLoan;
    const res = await apiFn(payload);
    if (res.code === 200) {
      ElMessage.success('提交成功');
      setTimeout(() => {
        eventBus.emit('showComponentByCommand', {
          type: 'LoanProductsComponentApplyForm',
          productId: props.id
        });
      }, 3000);
    }
  } catch (e: any) {
  } finally {
  }
};
// 查看产品详情
const handleShowDetails = () => {
  eventBus.emit('showComponentByCommand', { type: 'LoanProductsComponentDetails', id: props.productId });
};

interface SingleUploader {
  files: ReturnType<typeof ref<UploadFile[]>>;
  beforeUpload: (raw: UploadRawFile) => boolean;
  uploadRequest: (opt: UploadRequestOptions) => Promise<void>;
  handleRemove: (file: UploadFile) => void;
  handleExceed: () => void;
}
function createSingleUploader(targetField: keyof typeof formData.value, exceedMsg: string): SingleUploader {
  // ======================== 图片单文件上传器工厂 ========================
  // targetField: 绑定 formData 中对应的 ossId 字段
  // exceedMsg: 已存在文件时的提示语
  const files = ref<UploadFile[]>([]);
  const beforeUpload = (raw: UploadRawFile) => {
    if (!raw.type.startsWith('image/')) {
      ElMessage.error('只能上传图片');
      return false;
    }
    if (files.value.length >= 1) {
      ElMessage.warning(exceedMsg);
      return false;
    }
    return true;
  };
  const uploadRequest = async (opt: UploadRequestOptions) => {
    try {
      const res = await ossUploadImage({ file: opt.file as File });
      if (res.code === 200) {
        // 保存文件信息
        const f: UploadFile = {
          name: res.data?.fileName || '',
          status: 'success',
          url: res.data?.url || '',
          uid: (opt.file as any).uid
        } as UploadFile;
        files.value = [f];
        // 写入 ossId
        formData.value[targetField] = res.data?.ossId || '';
      } else {
        ElMessage.error(res.msg || '上传失败');
      }
    } catch (e: any) {
      ElMessage.error(e?.message || '上传失败');
    }
  };
  const handleRemove = (file: UploadFile) => {
    files.value = [];
    formData.value[targetField] = '';
  };
  const handleExceed = () => ElMessage.warning(exceedMsg);
  return { files, beforeUpload, uploadRequest, handleRemove, handleExceed };
}

// PDF 上传（授权文件）
function createPdfUploader(targetField: keyof typeof formData.value, exceedMsg: string) {
  // ======================== PDF 授权文件上传器工厂 ========================
  // 校验 MIME 与后缀，复用与图片类似的流程
  const files = ref<UploadFile[]>([]);
  const beforeUpload = (raw: UploadRawFile) => {
    if (raw.type !== 'application/pdf' && !/\.pdf$/i.test(raw.name)) {
      ElMessage.error('只能上传 PDF 文件');
      return false;
    }
    if (files.value.length >= 1) {
      ElMessage.warning(exceedMsg);
      return false;
    }
    return true;
  };
  const uploadRequest = async (opt: UploadRequestOptions) => {
    try {
      const res = await ossUploadImage({ file: opt.file as File });
      if (res.code === 200) {
        const f: UploadFile = {
          name: res.data?.fileName || opt.file.name,
          status: 'success',
          url: res.data?.url || '',
          uid: (opt.file as any).uid
        } as UploadFile;
        files.value = [f];
        formData.value[targetField] = res.data?.ossId || '';
      } else {
        ElMessage.error(res.msg || '上传失败');
      }
    } catch (e: any) {
      ElMessage.error(e?.message || '上传失败');
    }
  };
  const handleRemove = (file: UploadFile) => {
    files.value = [];
    formData.value[targetField] = '';
  };
  const handleExceed = () => ElMessage.warning(exceedMsg);
  return { files, beforeUpload, uploadRequest, handleRemove, handleExceed };
}

// 单文件上传实例（正/反面分离）
const uploaderLegalFront = createSingleUploader('idCardPhotoFront2', '法人证件正面已上传');
const uploaderLegalBack = createSingleUploader('idCardPhotoBack2', '法人证件反面已上传');
// 申请人/个人身份证共用字段：idCardPhotoFront / idCardPhotoBack
const uploaderIdFront = createSingleUploader('idCardPhotoFront', '身份证正面已上传');
const uploaderIdBack = createSingleUploader('idCardPhotoBack', '身份证反面已上传');
const uploaderAuthorization = createPdfUploader('authorizationFile', '授权文件已上传');
// 银行卡
const uploaderBankFront = createSingleUploader('bankCardPhotoFront', '银行卡正面已上传');
const uploaderBankBack = createSingleUploader('bankCardPhotoBack', '银行卡反面已上传');

// 统一预览方法
const handlePictureCardPreview = (file: UploadFile) => {
  // 统一图片预览弹窗控制
  dialogImageUrl.value = file.url || '';
  dialogVisible.value = true;
};

// ========== 上传区域与表单字段联动，便于触发布局校验 ==========
// 不再需要旧的数组联动逻辑；保留校验可选：根据 ossId 字段触发
watch(
  [
    () => formData.value.idCardPhotoFront2,
    () => formData.value.idCardPhotoBack2,
    () => formData.value.idCardPhotoFront,
    () => formData.value.idCardPhotoBack,
    () => formData.value.bankCardPhotoFront,
    () => formData.value.bankCardPhotoBack,
    () => formData.value.authorizationFile
  ],
  () => {
    // 可在此执行局部校验
    // formRef.value?.validateField('idCardPhotoFront'); 等
  }
);

// ========== 字典筛选（根据产品详情限制可选项） ==========
// 贷款周期可选项（由产品详情的 loanCycle 决定）
const loanCycleOptions = computed(() => {
  // 根据产品配置的 loanCycle 字符串过滤可选周期字典项
  const cycleStr = productDetails.value?.loanCycle ?? '';
  if (!cycleStr) return [];
  const allowed = cycleStr.split(',');
  return (loan_cycle.value || []).filter((item: any) => allowed.includes(item.value));
});
// 还款方式可选项（由产品详情的 repaymentMethod 决定）
const repaymentMethodOptions = computed(() => {
  // 根据产品配置的 repaymentMethod 字符串过滤可选还款方式字典项
  const repayStr = productDetails.value?.repaymentMethod ?? '';
  if (!repayStr) return [];
  const allowed = repayStr.split(',');
  return (repayment_method.value || []).filter((item: any) => allowed.includes(item.value));
});

onMounted(async () => {
  // ======================== 生命周期: 初始化加载 ========================
  // 1. 拉取产品详情
  // 2. 根据 userType 拉取采购商或企业基本信息并填充表单
  // 3. 若存在 props.id 则回显已有申请信息
  getCreditProductsVersionDetailNoTenant(props.productId).then((res) => {
    if (res.code === 200) {
      productDetails.value = res.data || {};
    }
  });
  // 采购商
  if (userStore.userType == '1') {
    const res = await getBasePurchaser();
    if (res.code === 200) {
      formData.value.realName = res.data.name ?? '';
      formData.value.contactPhone = res.data.phoneNumber ?? '';
    }
  }
  // 供应商/企业
  if (userStore.userType == '2' || userStore.userType == '3') {
    const res = await getBaseEnterpriseInfo();
    if (res.code === 200) {
      supplierDetails.value = res.data || {};
      formData.value = {
        ...formData.value,
        // 法人信息
        legalPersonName: res.data.legalPerson ?? '',
        legalPersonContactPhone: res.data.phoneNumber ?? '',
        legalPersonIdCardType: '0'
      };
    }
  }
  if (props.id) {
    getLoanApplicationsId(props.id).then((v) => {
      if (v.code === 200) {
        formData.value = {
          ...formData.value,
          ...(v.data || {})
        };
      }
    });
  }
});
</script>
<style scoped lang="scss">
.detail-form-card {
  width: 100%;
  padding: 10px 20px 20px 20px;
  background: #ffffff;
  border-radius: 8px 8px 8px 8px;
  margin-bottom: 20px;
}

.detail-form-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  padding-bottom: 9px;
  border-bottom: 1px dashed #d8d8d8;
  margin-bottom: 20px;
}

.card-title {
  height: 30px;
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  font-weight: 500;
  font-size: 14px;
  color: #108c58;
  line-height: 30px;
}
.card-title::before {
  content: '';
  display: inline-block;
  margin-right: 4px;
  width: 2px;
  height: 10px;
  background: #108c58;
  border-radius: 4px 4px 4px 4px;
}

.card-close {
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  font-weight: 400;
  font-size: 14px;
  color: #ffffff;

  width: 86px;
  height: 30px;
  line-height: 30px;
  text-align: center;
  background: #108c58;
  border-radius: 4px 4px 4px 4px;
}

.uploadcss {
  ::v-deep .el-form-item__content {
    white-space: nowrap;
    display: block;
  }
  ::v-deep .el-upload-list--picture-card {
    display: block;
  }
  .avatar-uploader {
    width: 64px;
    height: 64px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .avatar-uploader-icon {
    width: 12px;
    height: 12px;
    color: #c2c2c2;
  }
  .avatar-uploader-text {
    height: 16px;
    font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
    font-weight: 400;
    font-size: 12px;
    color: #c2c2c2;
    line-height: 16px;
    text-align: left;
    font-style: normal;
    text-transform: none;
    margin-top: 5px;
  }
}
::v-deep .el-upload-list--picture-card .el-upload-list__item {
  width: 101px;
  height: 64px;
  margin-right: 10px;
}
::v-deep .el-upload--picture-card {
  width: 64px;
  height: 64px;
  line-height: 64px;
  margin-right: 10px;
  float: left;
}
</style>
