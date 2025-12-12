<template>
  <!--
    标题：			Supplier.vue
    功能：			供应商/企业注册-填写信息
    说明:
    当前版本：	1.0
    开发信息：	Created by 刘景彪  
 -->
  <div>
    <el-form ref="dataFormRef" :model="form" :rules="rules" label-position="left" label-width="140px">
      <div class="title-text">基础信息</div>
      <div class="pading16">
        <el-row :gutter="50">
          <el-col :span="12">
            <el-form-item label="营业执照" prop="businessLicense">
              <div class="upload-businessLicense">
                <el-upload
                  class="upload-box"
                  accept=".jpg,.jpeg,.png"
                  action="#"
                  drag
                  :auto-upload="false"
                  :show-file-list="false"
                  :on-change="handleDiplomaChange"
                >
                  <div class="upload-content">
                    <div v-if="diplomaUrl.url == null" class="upload-placeholder">
                      <img src="@/assets/images/register3.svg" class="step-icon" />
                      <div class="upload-text">点击或将文件拖拽到这里上传</div>
                      <div class="upload-tip">单个文件最大10M 支持扩展名：jpg、jpeg、png</div>
                    </div>
                    <img v-else :src="diplomaUrl.url" :alt="diplomaUrl.name" class="upload-image" />
                  </div>
                </el-upload>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12"></el-col>

          <el-col :span="12">
            <el-form-item :label="selectedIdentity == 'supplier' ? '供应商名称' : '企业名称'" prop="companyName">
              <el-input v-model="form.companyName" placeholder="OCR识别,可修改" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="注册资本" prop="signUpCapital">
              <el-input v-model="form.signUpCapital" placeholder="OCR识别,可修改" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="统一社会信用代码" prop="licenseNumber">
              <el-input v-model="form.licenseNumber" :disabled="false" placeholder="OCR识别" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="注册地址" prop="areaCodes">
              <RegionSelect style="width: 100%" v-model="form.areaCodes" @regionChange="handleAreaChange" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="注册日期" prop="signUpTime">
              <el-date-picker
                v-model="form.signUpTime"
                value-format="YYYY-MM-DD"
                type="date"
                style="width: 100%"
                placeholder="OCR识别,可修改"
              ></el-date-picker>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="详细地址" prop="signUpAddress">
              <el-input v-model="form.signUpAddress" placeholder="OCR识别,可修改" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="法定代表人" prop="legalPerson">
              <el-input v-model="form.legalPerson" placeholder="OCR识别,可修改" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="经营范围" prop="businessScope">
              <el-input v-model="form.businessScope" placeholder="OCR识别,可修改" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="办公地址" prop="officeAddress">
              <el-input v-model="form.officeAddress" placeholder="请输入办公地址" />
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <div class="h20"></div>

      <div class="title-text">{{ selectedIdentity == 'supplier' ? '供应商联系人' : '企业联系人' }}</div>
      <div class="pading16">
        <el-table :data="tableList" stripe>
          <el-table-column type="index" width="100" label="序号" />
          <el-table-column prop="contactUserType" label="联系人类型">
            <template #default="scope">
              <el-select v-model="scope.row.contactUserType" :disabled="scope.row.contactUserType == 1" placeholder="请选择" filterable clearable>
                <el-option
                  :disabled="item.dictValue == 1"
                  v-for="(item, index) in contact_user_type"
                  :key="index"
                  :label="item.dictLabel"
                  :value="item.dictValue"
                ></el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column prop="contactUserName" label="姓名">
            <template #header>
              <span class="required">姓名</span>
            </template>
            <template #default="scope">
              <el-input
                v-model="scope.row.contactUserName"
                placeholder="请输入姓名"
                :class="{ 'is-error': scope.row.errors && scope.row.errors.contactUserName }"
              ></el-input>
              <div class="validation-errors" v-if="scope.row.errors && scope.row.errors.contactUserName">
                {{ scope.row.errors.contactUserName }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="contactIdCard" label="身份证号码">
            <template #default="scope">
              <el-input
                v-model="scope.row.contactIdCard"
                placeholder="请输入身份证号码"
                maxlength="18"
                :class="{ 'is-error': scope.row.errors && scope.row.errors.contactIdCard }"
              ></el-input>
              <div class="validation-errors" v-if="scope.row.errors && scope.row.errors.contactIdCard">
                {{ scope.row.errors.contactIdCard }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="contactPhone" label="联系电话">
            <template #header>
              <span class="required">联系电话</span>
            </template>
            <template #default="scope">
              <el-input
                v-model="scope.row.contactPhone"
                placeholder="请输入联系电话"
                :class="{ 'is-error': scope.row.errors && scope.row.errors.contactPhone }"
              ></el-input>
              <div class="validation-errors" v-if="scope.row.errors && scope.row.errors.contactPhone">
                {{ scope.row.errors.contactPhone }}
              </div>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="250" align="center">
            <template #default="scope">
              <el-button
                v-throttle
                v-if="scope.row.contactUserType !== '1'"
                text
                @click="removeTableCell(scope.$index, scope.row)"
                style="color: #ff3131; border-color: #ff3131"
              >
                <img src="@/assets/images/register4.svg" class="el-icon-view" />
                <span style="height: 16px; line-height: 16px"> 删除</span>
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="flex-center-center">
          <el-button v-throttle @click="addTableCell" icon="Plus" color="#108C58" plain style="margin-top: 10px">新增</el-button>
        </div>
      </div>

      <div class="h20"></div>

      <div class="title-text">资料清单</div>
      <div class="pading16">
        <el-upload
          action="#"
          :auto-upload="false"
          accept=".jpg,.jpeg,.png"
          :show-file-list="false"
          :on-change="handleChange"
          :before-upload="beforeUpload"
        >
          <div class="upload-btn">
            <el-button v-throttle plain style="color: #108c58; border-color: #108c58">
              <img src="@/assets/images/register5.svg" class="el-icon-view" />附件上传</el-button
            >
          </div>
        </el-upload>

        <div class="h20"></div>

        <el-table :data="fileListtable" stripe>
          <el-table-column type="index" label="序号" width="55" align="center" />
          <el-table-column prop="name" label="附件名" align="center" />
          <el-table-column prop="remark" label="备注" align="center">
            <template #default="scope">
              <el-input v-model="scope.row.remark" :maxlength="150" show-word-limit placeholder="请输入"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="250" align="center">
            <template #default="scope">
              <el-button v-throttle link @click="previewFile(scope.row)" style="color: #108c58; margin-right: 10px">
                <img src="@/assets/images/register1.svg" class="el-icon-view" />
                <span style="height: 16px; line-height: 16px">下载</span>
              </el-button>

              <el-button v-throttle link v-if="scope.row.fileType !== '1'" @click="removeFile(scope.row)" style="color: #ff3131">
                <img src="@/assets/images/register4.svg" class="el-icon-view" />
                <span style="height: 16px; line-height: 16px">删除</span>
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="h20"></div>

      <div class="title-text">账号信息</div>
      <div class="pading16">
        <el-row :gutter="50">
          <el-col :span="12">
            <el-form-item label="姓名" prop="loginUserName" required>
              <el-input v-model="form.loginUserName" placeholder="注册人姓名，填写身份证上的真实姓名，不要填写昵称" />
            </el-form-item>
          </el-col>

          <el-col :span="12"></el-col>
          <el-col :span="12">
            <el-form-item label="手机号" prop="phoneNumber" required>
              <el-input v-model="form.phoneNumber" placeholder="请输入手机号" />
            </el-form-item>
          </el-col>
          <el-col :span="12"></el-col>

          <el-col :span="12">
            <el-form-item label="短信验证码" prop="smsCode" required>
              <el-input v-model="form.smsCode" maxlength="6" placeholder="六位短信验证码" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-button v-throttle type="primary" class="sms-code-btn" :disabled="isSendingSms" @click="sendSmsCode">
              {{ smsButtonText }}
            </el-button></el-col
          >

          <el-col :span="12">
            <el-form-item label="设置密码" prop="password" required>
              <el-input v-model="form.password" type="password" placeholder="长度8-16位，且至少包含大小写字母、数字中的2种" show-password />
            </el-form-item>
          </el-col>
          <el-col :span="12"></el-col>

          <el-col :span="12">
            <el-form-item label="确认密码" prop="confirmPassword" required>
              <el-input v-model="form.confirmPassword" type="password" placeholder="请再次输入密码" show-password /> </el-form-item
          ></el-col>
        </el-row>
      </div>

      <div class="next-step-container">
        <el-button v-throttle type="primary" class="next-step-button" @click="submitForm">提交</el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch, computed } from 'vue';
import { ElMessage, FormRules } from 'element-plus';
import { FormData, Contact } from '@/api/register/supplier/types'; //ts类型
import { uploadImage, ocrUploadImage } from '@/api/register'; //图片上传接口
import { parseAddressToRegionCodes } from '@/utils/addressRegion';
import { getPurchaserTypeDict } from '@/api/register/supplier'; //获取字典接口
import { checkPhoneUnique } from '@/api/register/purchaser'; //手机号唯一接口
import { sendSmsCode as sendSmsCodeApi } from '@/api/register/accountRegiser'; //验证码接口
import { supplierRegister } from '@/api/register/supplier'; //注册接口
import { isAccountExist } from '@/api/login'; //账号获取详情信息
// 定义props来接收selectedIdentity
const props = defineProps({
  selectedIdentity: {
    type: String,
    required: false
  }
});

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const emit = defineEmits(['nextStep']); // 定义事件

const idType = ref(null); // 这四个参数  系统用户id：sysUserId【目前直接传null】,qyId【企业或者供应商id】,jszjId【技术专家id】,fwzjId【法务专家id】  如果响应的二次入驻的页面有对应的id存在，就传对应的id就行
enum idTypeEnum {
  sysUserId = null,
  supplier = 'qyId',
  enterprise = 'qyId',
  expert = 'jszjId',
  legal = 'fwzjId'
}
const initFormData: FormData = {
  companyName: '',
  signUpCapital: '',
  licenseNumber: '',
  signUpAddress: '',
  signUpTime: '',
  businessScope: '',
  legalPerson: '',
  officeAddress: '',
  loginUserName: '',
  phoneNumber: '',
  smsCode: '',
  password: '',
  confirmPassword: '',
  areaCodes: [],
  districtCode: '',
  cityCode: '',
  provinceCode: '',
  district: '',
  city: '',
  province: ''
};
// 更新表单验证规则
const FormRulesarr: FormRules = {
  businessLicense: [
    {
      required: true,
      validator: (rule: any, value: any, callback: any) => {
        const hasBusinessLicense = fileListtable.value.some((file) => file.fileType === '1' && file.ossId);
        if (!hasBusinessLicense) {
          callback(new Error('请上传营业执照'));
          return;
        }
        callback();
      },
      trigger: 'change'
    }
  ],
  companyName: [
    { required: true, message: props.selectedIdentity == 'supplier' ? '供应商名称不能为空' : '企业名称不能为空', trigger: 'blur' },
    {
      validator: (rule: any, value: any, callback: any) => {
        if (!value || value.trim() === '') {
          callback(new Error(props.selectedIdentity == 'supplier' ? '供应商名称不能为空' : '企业名称不能为空'));
          return;
        }

        // 最大长度：50个字
        if (value.length > 50) {
          callback(new Error('输入字符超过限制'));
          return;
        }

        // 验证特殊字符
        const specialChars = /[^a-zA-Z\u4e00-\u9fa50-9~!@#$%^&*()_+=<>?\/\-.,;:'"\\|`{}[\] ]/;
        if (specialChars.test(value)) {
          callback(
            new Error(
              props.selectedIdentity == 'supplier' ? '供应商名称只能包含汉字、字母、数字和常规符号。' : '企业名称只能包含汉字、字母、数字和常规符号。'
            )
          );
          return;
        }

        callback();
      },
      trigger: 'blur'
    }
  ],
  signUpCapital: [
    { required: true, message: '注册资本不能为空', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (!value || value.trim() === '') {
          callback(new Error('注册资本不能为空'));
          return;
        }
        // 支持中文、数字、金额单位（如万元、人民币等）
        const capitalRegex = /^[\u4e00-\u9fa5a-zA-Z0-9（）()万元人民币. ]+$/;
        if (!capitalRegex.test(value)) {
          callback(new Error('注册资本格式不正确，可填写中文或数字及金额单位'));
          return;
        }
        callback();
      },
      trigger: 'blur'
    }
  ],
  licenseNumber: [
    { required: true, message: '统一社会信用代码不能为空', trigger: 'blur' },
    {
      validator: (rule: any, value: any, callback: any) => {
        if (!value || value.trim() === '') {
          callback(new Error('统一社会信用代码不能为空'));
          return;
        }
        // 使用统一社会信用代码严格校验正则（排除 I/O 等字母）
        const usccRegex = /^[123456789A-HJ-NP-RT-UW-Y][0-9A-HJ-NP-RT-UW-Y]\d{6}[0-9A-HJ-NP-RT-UW-Y]{9}[0-9A-HJ-NP-RT-UW-Y]$/;
        const upperVal = value.toUpperCase();
        if (!usccRegex.test(upperVal)) {
          callback(new Error('统一社会信用代码格式不正确'));
          return;
        }

        callback();
      },
      trigger: 'blur'
    }
  ],
  signUpAddress: [
    { required: true, message: '详情地址不能为空', trigger: 'blur' },
    {
      validator: (rule: any, value: any, callback: any) => {
        if (!value || value.trim() === '') {
          callback(new Error('详情地址不能为空'));
          return;
        }

        // 验证长度（200个字）
        if (value.length > 200) {
          callback(new Error('注册地址最长不超过200个字。'));
          return;
        }

        callback();
      },
      trigger: 'blur'
    }
  ],
  areaCodes: { required: true, message: '注册地址不能为空', trigger: 'blur' },
  signUpTime: [
    { required: true, message: '注册日期不能为空', trigger: 'blur' },
    {
      validator: (rule: any, value: any, callback: any) => {
        if (!value || value.trim() === '') {
          callback(new Error('注册日期不能为空'));
          return;
        }

        // 验证格式
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(value)) {
          callback(new Error('请输入有效的日期，格式为YYYY-MM-DD。'));
          return;
        }

        // // 如果有签发日期，校验不可早于签发日期（严格防御空值/非法值）
        // const issueStr = licenseIssueDate.value as string | null;
        // // 统一按“日期”比较，忽略具体时分秒，允许同一天
        // const normalize = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
        // if (issueStr && typeof issueStr === 'string') {
        //   const issue = normalize(new Date(issueStr));
        //   const inputDate = normalize(new Date(value));
        //   // 仅在输入日期早于签发日期时提示错误；同一天允许
        //   if (!isNaN(issue.getTime()) && !isNaN(inputDate.getTime()) && inputDate < issue) {
        //     callback(new Error('请输入有效的日期，格式为YYYY-MM-DD，且不能早于营业执照签发日期。'));
        //     return;
        //   }
        // } else {
        //   const today = normalize(new Date());
        //   const inputDate = normalize(new Date(value));
        //   // 无签发日期时，要求不晚于今天；同一天允许
        //   if (!isNaN(today.getTime()) && !isNaN(inputDate.getTime()) && inputDate > today) {
        //     callback(new Error('请输入有效的日期，格式为YYYY-MM-DD，且不能晚于当前日期。'));
        //     return;
        //   }
        // }

        callback();
      },
      trigger: 'blur'
    }
  ],
  businessScope: [
    { required: true, message: '经营范围不能为空', trigger: 'blur' },
    {
      validator: (rule: any, value: any, callback: any) => {
        if (!value || value.trim() === '') {
          callback(new Error('经营范围不能为空'));
          return;
        }

        // 验证长度（200字）
        if (value.length > 200) {
          callback(new Error('经营范围最长不超过200个字。'));
          return;
        }

        callback();
      },
      trigger: 'blur'
    }
  ],
  legalPerson: [
    { required: true, message: '法定代表人不能为空', trigger: 'blur' },
    {
      validator: (rule: any, value: any, callback: any) => {
        if (!value || value.trim() === '') {
          callback(new Error('法定代表人不能为空'));
          return;
        }

        // 验证长度（50个字）
        if (value.length > 50) {
          callback(new Error('法定代表人姓名只能包含汉字或字母，最长不超过50个字。'));
          return;
        }

        // 验证格式（只能包含汉字和字母）
        const nameRegex = /^[\u4e00-\u9fa5a-zA-Z]+$/;
        if (!nameRegex.test(value)) {
          callback(new Error('法定代表人姓名只能包含汉字或字母，最长不超过50个字。'));
          return;
        }

        callback();
      },
      trigger: 'blur'
    }
  ],
  officeAddress: [
    { required: true, message: '办公地址不能为空', trigger: 'blur' },
    {
      validator: (rule: any, value: any, callback: any) => {
        if (!value || value.trim() === '') {
          callback(new Error('办公地址不能为空'));
          return;
        }

        // 验证长度（200个字）
        if (value.length > 200) {
          callback(new Error('办公地址最长不超过200个字。'));
          return;
        }

        callback();
      },
      trigger: 'blur'
    }
  ],
  loginUserName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phoneNumber: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        checkPhoneUnique(value, { [idTypeEnum[idType.value]]: form.value?.id })
          .then((res) => {
            if (res.code === 200) {
              callback();
            } else {
              callback(new Error('该手机号已被注册，请更换手机号。'));
            }
          })
          .catch(() => {
            callback(new Error('该手机号已被注册，请更换手机号。'));
          });
      },
      trigger: 'blur'
    }
  ],
  smsCode: [{ required: true, message: '请输入短信验证码', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 8, max: 16, message: '密码长度为8-16位', trigger: 'blur' },
    {
      validator: (rule, value) => {
        const v = String(value || '');
        if (v.length < 8 || v.length > 16) return new Error('密码长度为8-16位');
        let cnt = 0;
        if (/[A-Z]/.test(v)) cnt++;
        if (/[a-z]/.test(v)) cnt++;
        if (/\d/.test(v)) cnt++;
        if (cnt < 2) {
          return new Error('密码需为8-16位，且至少包含大小写字母、数字中的2种');
        }
        return true;
      },
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (rule, value) => {
        if (value !== form.value.password) {
          return new Error('两次输入的密码不一致');
        }
        return true;
      },
      trigger: 'blur'
    }
  ]
};

// 表单数据
const data = reactive({
  form: { ...initFormData },
  rules: FormRulesarr
});

const { form, rules } = toRefs(data);
const dataFormRef = ref<ElFormInstance>();

// 直接使用异步调用结果赋值
const contact_user_type = ref([]);

getPurchaserTypeDict('contact_user_type').then((res) => {
  if (res.code === 200) {
    contact_user_type.value = res.data || [];
  }
});

// 供应商联系人
const tableList = ref<Contact[]>([
  {
    contactUserType: '1',
    contactUserName: '',
    contactIdCard: '',
    contactPhone: ''
  }
]);

// 姓名联动：legalPerson、loginUserName 与 第一个联系人姓名保持一致
const setUnifiedName = (name: string) => {
  const newName = name ?? '';
  // 更新表单中的两个字段
  if (form.value.legalPerson !== newName) form.value.legalPerson = newName;
  if (form.value.loginUserName !== newName) form.value.loginUserName = newName;
  // 更新联系人首行
  if (tableList.value.length > 0 && tableList.value[0].contactUserName !== newName) {
    tableList.value[0].contactUserName = newName;
  }
};

// 手机号联动：account `phoneNumber` 与首个联系人 `contactPhone` 保持一致
const setUnifiedPhone = (phone: string) => {
  const newPhone = phone ?? '';
  // 更新账号手机号
  if (form.value.phoneNumber !== newPhone) form.value.phoneNumber = newPhone;
  // 更新联系人首行手机号
  if (tableList.value.length > 0 && tableList.value[0].contactPhone !== newPhone) {
    tableList.value[0].contactPhone = newPhone;
  }
};

// 监听任意一个字段的变化，统一到同一个值，避免循环：使用比对后再写入
watch(
  () => form.value.legalPerson,
  (val) => {
    if (val !== undefined) setUnifiedName(val as string);
  }
);

watch(
  () => form.value.loginUserName,
  (val) => {
    if (val !== undefined) setUnifiedName(val as string);
  }
);

watch(
  () => (tableList.value.length > 0 ? tableList.value[0].contactUserName : ''),
  (val) => {
    if (val !== undefined) setUnifiedName(val as string);
  }
);

// 监听账号手机号变化，联动到首个联系人手机号
watch(
  () => form.value.phoneNumber,
  (val) => {
    if (val !== undefined) setUnifiedPhone(val as string);
  }
);

// 监听首个联系人手机号变化，联动到账号手机号
watch(
  () => (tableList.value.length > 0 ? tableList.value[0].contactPhone : ''),
  (val) => {
    if (val !== undefined) setUnifiedPhone(val as string);
  }
);

// 文件列表
const fileListtable = ref<any[]>([]);
// 原来：const diplomaUrl = ref<any>(null);
const diplomaUrl = ref<any>({ url: null, name: '', fileType: '1', remark: '', ossId: undefined, ossInfo: {} });

// 短信验证码相关
const isSendingSms = ref(false);
const smsCountdown = ref(0);
const smsButtonText = ref('获取验证码');

let smsTimer: NodeJS.Timeout | null = null;

// 发送短信验证码
const sendSmsCode = async () => {
  if (isSendingSms.value) return;

  // 验证手机号
  try {
    await dataFormRef.value?.validateField('phoneNumber');
    // 发送验证码逻辑
    isSendingSms.value = true;
    smsCountdown.value = 60;
    // 倒计时
    smsTimer = setInterval(() => {
      smsCountdown.value--;
      smsButtonText.value = `${smsCountdown.value}秒后重新获取`;
      if (smsCountdown.value <= 0) {
        clearInterval(smsTimer);
        isSendingSms.value = false;
        smsButtonText.value = '获取验证码';
      }
    }, 1000);
    const res = await sendSmsCodeApi(form.value.phoneNumber);
    if (res.code === 200) {
      ElMessage.success('短信验证码发送成功');
    }
  } catch (error) {
    // 手机号验证失败
    console.error('手机号验证失败', error);
  }
};

// 地址选择变化
const handleAreaChange = (val) => {
  // 更新编码和名称
  form.value.areaCodes = val.regionPath;
  form.value.provinceCode = val.provinceCode;
  form.value.cityCode = val.cityCode;
  form.value.districtCode = val.regionCode;
  form.value.province = val.province;
  form.value.city = val.city;
  form.value.district = val.region;
};

// 添加新行-供应商联系人
const addTableCell = () => {
  tableList.value.push({
    contactUserType: '',
    contactUserName: '',
    contactIdCard: '',
    contactPhone: ''
  });
};

// 删除行 -供应商联系人
const removeTableCell = (index: number, row: Contact) => {
  if (tableList.value.length === 1) {
    ElMessage.error('至少保留一个联系人');
    return;
  }
  tableList.value.splice(index, 1);
};

/**
 * 验证供应商联系人信息
 * @param contact - 包含联系人信息的对象，包含姓名、身份证号和电话等字段
 * @returns 包含验证错误信息的对象，如果没有错误则返回空对象
 */
const validateContact = (contact: Contact) => {
  const errorsValue: { contactUserName?: string; contactIdCard?: string; contactPhone?: string } = {};

  // 验证姓名（必填）
  if (!contact.contactUserName || contact.contactUserName.trim() === '') {
    errorsValue.contactUserName = '请输入姓名';
  } else {
    // 验证长度（50个字）
    if (contact.contactUserName.length > 50) {
      errorsValue.contactUserName = '姓名最多可输入50个字';
    }

    // 验证格式（只能包含汉字、字母和部分符号）
    const nameRegex = /^[\u4e00-\u9fa5a-zA-Z\-\'\s]+$/;
    if (!nameRegex.test(contact.contactUserName)) {
      errorsValue.contactUserName = '姓名只能包含汉字、字母，且最长不超过50个字。';
    }
  }

  // 验证身份证号码（格式验证）
  if (contact.contactIdCard && contact.contactIdCard.trim() !== '') {
    const idCardPattern = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
    if (!idCardPattern.test(contact.contactIdCard)) {
      errorsValue.contactIdCard = '身份证号码格式不正确，请重新检查';
    }
  }

  // 验证联系电话（必填且格式验证）
  if (!contact.contactPhone || contact.contactPhone.trim() === '') {
    errorsValue.contactPhone = '联系电话不能为空';
  } else {
    // 验证手机号格式
    const mobileRegex = /^1[3-9]\d{9}$/;
    if (mobileRegex.test(contact.contactPhone)) {
      // 是手机号，无需进一步验证
    } else {
      // 验证座机号格式
      const landlineRegex = /^(\d{1,4})-(\d{7,8})$/;
      if (!landlineRegex.test(contact.contactPhone)) {
        errorsValue.contactPhone = '请输入有效的手机号码或座机号码';
      }
    }
  }

  return errorsValue;
};

/**
 * 验证所有联系人信息
 * 遍历所有联系人进行验证，如果全部验证通过则显示成功消息，否则提示存在错误需要修正
 */
const validateAndSubmit = () => {
  let isValid = true;

  // 验证所有联系人
  tableList.value.forEach((contact) => {
    const errors = validateContact(contact);
    contact.errors = errors;

    if (Object.keys(errors).length > 0) {
      isValid = false;
    }
  });

  if (isValid) {
    return true;
  } else {
    proxy?.$modal.msgError(props.selectedIdentity == 'supplier' ? '请填写供应商联系人信息' : '请填写企业联系人信息');

    return false;
  }
};

/** 提交按钮 */
const submitForm = () => {
  dataFormRef.value.validate((valid: boolean) => {
    if (valid) {
      const arr = validateAndSubmit();
      if (!arr) return;

      const params = {
        code: form.value.smsCode,
        enterpriseInfo: {
          ...form.value,
          enterpriseType: props.selectedIdentity == 'supplier' ? '0' : '1', //enterpriseType : 1企业 0 供应商
          reviewStatus: '0' //状态
        },
        contacts: tableList.value,
        folder: fileListtable.value
      };

      // 供应商
      supplierRegister(params).then((res) => {
        proxy?.$modal.msgSuccess('操作成功');
        emit('nextStep', { username: form.value.loginUserName, account: form.value.phoneNumber });
      });
    } else {
      ElMessage.error('信息尚未填写完整，请检查并完成所有必填内容后再次提交。');
    }
  });
};
/** 文件上传成功处理 */
const handleDiplomaChange = (file: UploadFile) => {
  proxy?.$modal.loading('正在上传营业执照，请稍候...');

  uploadImage({ file: file.raw })
    .then((res) => {
      if (res.data?.ossId) {
        const newFile = {
          name: res.data.fileName || '营业执照',
          remark: '营业执照',
          url: res.data.url,
          fileType: '1',
          ossId: res.data.ossId,
          ossInfo: {}
        };

        // 查找是否已有 fileType === '1' 的营业执照文件
        const existingIndex = fileListtable.value.findIndex((f) => f.fileType == '1');

        // 记录旧值，便于 OCR 失败时回滚
        const previousFile = existingIndex !== -1 ? { ...fileListtable.value[existingIndex] } : null;

        if (existingIndex !== -1) {
          // 已存在 => 替换
          fileListtable.value.splice(existingIndex, 1, newFile);
        } else {
          // 不存在 => 新增
          fileListtable.value.push(newFile);
        }

        // 同步预览对象（保持为对象，模板使用 diplomaUrl.url）
        diplomaUrl.value = newFile;

        const arr = res.data.url;

        // 继续调用 OCR
        return ocrUploadImage({ image_url_list: [arr] })
          .then((ocrRes) => {
            console.log('OCR 识别结果：', ocrRes, ocrRes[0]);
            const brr = ocrRes.data[0];
            if (!brr) {
              proxy?.$modal.msgError('营业执照识别失败，请上传正确的营业执照');
              return;
            }
            Object.keys(ocrRes).forEach((key) => {
              if (key in form.value) {
                form.value[key] = brr[key];
              }
            });
            form.value.companyName = brr.companyName; // 企业名称
            form.value.licenseNumber = brr.unifiedSocialCreditCode; // 统一社会信用代码
            form.value.signUpTime = proxy.parseTime(brr.establishmentDate, '{y}-{m}-{d}'); // 注册日期
            form.value.signUpCapital = brr.registeredCapital; // 注册资本
            form.value.signUpAddress = brr.address; // 注册地址
            // 根据营业执照地址尝试解析省市区编码自动回填
            const regionCodes = parseAddressToRegionCodes(brr.address);
            if (regionCodes) {
              form.value.areaCodes = regionCodes.regionPath;
              form.value.provinceCode = regionCodes.provinceCode;
              form.value.cityCode = regionCodes.cityCode;
              form.value.districtCode = regionCodes.districtCode;
              form.value.province = regionCodes.province;
              form.value.city = regionCodes.city;
              form.value.district = regionCodes.region;
              // console.log('自动解析地址为省市区：', regionCodes);
            }
            form.value.officeAddress = brr.address; // 办公地址
            form.value.businessScope = brr.businessScope; // 经营范围
            form.value.legalPerson = brr.legalRepresentative; // 法人

            // tableList.value[0].contactUserName = brr.legalRepresentative;
            // OCR 回填后保持三个字段联动一致
            setUnifiedName(brr.legalRepresentative || '');
            // 同步手机号（若 OCR 返回了可用的电话信息，可按需回填，这里仅保持已有值一致）
            setUnifiedPhone(form.value.phoneNumber || (tableList.value[0]?.contactPhone ?? ''));
          })
          .catch((error) => {
            // OCR 失败回滚
            if (existingIndex !== -1) {
              // 恢复旧的营业执照文件
              if (previousFile) {
                fileListtable.value.splice(existingIndex, 1, previousFile);
                diplomaUrl.value = previousFile;
              }
            } else {
              // 删除刚新增的记录
              const idx = fileListtable.value.findIndex((f) => f.ossId === newFile.ossId);
              if (idx !== -1) fileListtable.value.splice(idx, 1);
              // 保持为对象结构，避免模板空指针
              diplomaUrl.value = { url: null, name: '', fileType: '1', remark: '', ossId: undefined, ossInfo: {} };
            }

            ElMessage.error('OCR识别失败,请重试');
            console.error('上传失败：', error);
            throw error; // 抛出以便外层 catch 处理 loading 等
          });
      } else {
        ElMessage.error('营业执照上传失败，请重试');
        throw new Error('营业执照上传失败');
      }
    })
    .catch((error) => {
      console.error('上传过程出错：', error);
      ElMessage.error('上传失败，请重试');
    })
    .finally(() => {
      proxy?.$modal.closeLoading();
    });
};
// 处理文件选择
const handleChange = (file: any) => {
  proxy?.$modal.loading('正在上传附件，请稍候...');
  uploadImage({ file: file.raw })
    .then((res) => {
      if (res.code === 200 && res.data?.ossId) {
        fileListtable.value.push({
          name: res.data.fileName,
          remark: '附件上传',
          url: res.data.url,
          fileType: '99',
          ossId: res.data.ossId
        });
      } else {
        ElMessage.error('上传失败，请重试');
      }
      proxy?.$modal.closeLoading();
    })
    .catch((error) => {
      console.error('上传失败:', error);
      ElMessage.error('上传失败，请重试');
      proxy?.$modal.closeLoading();
    });
};

// 文件上传前校验
const beforeUpload = (file: any) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    ElMessage.error('文件大小不能超过10MB');
    return false;
  }

  const allowedTypes = ['image/jpg', 'image/jpeg', 'image/png'];
  if (!allowedTypes.includes(file.type)) {
    ElMessage.error('仅支持JPG/JPEG/PNG格式');
    return false;
  }

  return true;
};

// 预览文件
const previewFile = async (file: any) => {
  try {
    const response = await fetch(file.url);
    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = file.name; // 设置文件名
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href); // 释放 URL 对象
  } catch (error) {
    console.error('下载失败', error);
  }
};

// 删除文件
const removeFile = (file: any) => {
  // 优先使用稳定唯一的 ossId 进行匹配，避免 uid 为 undefined 时总命中第一个项
  const index = fileListtable.value.findIndex((f) => {
    if (file.ossId && f.ossId) return f.ossId === file.ossId;
    // 兜底：如果无 ossId，则按 url 或 name 匹配
    if (file.url && f.url) return f.url === file.url;
    if (file.name && f.name) return f.name === file.name;
    return false;
  });
  if (index !== -1) {
    // 修正删除位置，直接删除命中的索引
    fileListtable.value.splice(index, 1);
  } else {
    console.warn('未找到要删除的文件：', file);
  }
};

// 生命周期钩子
onMounted(async () => {
  // 获取router路由参数
  const route = useRoute();
  const { phoneNumber, type } = route.query;
  idType.value = type;
  if (phoneNumber) {
    const phone = Array.isArray(phoneNumber) ? phoneNumber[0] : phoneNumber;
    const arr: any = await isAccountExist(phone);
    form.value = {
      ...arr.data,
      areaCodes: [arr.data.provinceCode, arr.data.cityCode, arr.data.districtCode],
      confirmPassword: arr.data.password,
      signUpTime: proxy.parseTime(arr.data.signUpTime, '{y}-{m}-{d}')
    };
    tableList.value = arr.data.contacts;

    // // 如果已有数据，按优先级联动一次：优先使用法定代表人，否则使用登录姓名，否则使用首个联系人姓名
    // const initName = arr.data.legalPerson || arr.data.loginUserName || (arr.data.contacts && arr.data.contacts[0]?.contactUserName) || '';
    // setUnifiedName(initName);

    if (arr.data && arr.data.folders && arr.data.folders.length > 0) {
      arr.data.folders.forEach((element: any) => {
        fileListtable.value.push({
          name: element.ossInfo.originalName,
          remark: element.remark,
          url: element.ossInfo.url,
          fileType: element.fileType,
          ossId: element.ossId
        });
        if (element.fileType == '1') {
          diplomaUrl.value = {
            name: element.ossInfo.originalName,
            remark: element.remark,
            url: element.ossInfo.url,
            fileType: element.fileType,
            ossId: element.ossId
          };
        }
      });
    }
  }
});
</script>

<style scoped lang="scss">
.pading16 {
  height: 100%;
  padding: 16px;
}

.h20 {
  height: 20px;
  background: #f7f8fb;
}

.title-text {
  height: 54px;
  font-family: PingFang SC;
  font-weight: bold;
  font-size: 16px;
  color: #000000;
  text-align: left;
  font-style: normal;
  text-transform: none;
  padding: 16px;
  position: relative;
  border-bottom: 1px solid #e5e6eb;

  ::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 14px;
    background: #108c58;
    border-radius: 2px 2px 2px 2px;
  }
}
/* 优化上传区域样式 */
.upload-businessLicense {
  width: 100%;
  .upload-box {
    width: 100%;
    .upload-content {
      width: 100%;
      text-align: center;
      background: #fafdfc;
      border-radius: 4px 4px 4px 4px;
      border: 1px solid #108c58;
      padding: 29px 0;

      .el-icon {
        font-size: 32px;
        margin-bottom: 16px;
      }

      .upload-text {
        height: 20px;
        font-family:
          PingFang SC,
          PingFang SC;
        font-weight: bold;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.9);
        font-style: normal;
        text-transform: none;
        margin-bottom: 8px;

        .upload-tip {
          height: 17px;
          font-family:
            PingFang SC,
            PingFang SC;
          font-weight: 500;
          font-size: 12px;
          color: #999999;
          text-align: left;
          font-style: normal;
          text-transform: none;
        }
      }
    }
    .upload-image {
      width: 100%;
      height: 150px;
    }
  }
}

// 使用深度选择器确保样式能够穿透到Element UI组件内部
.upload-businessLicense ::v-deep(.el-upload-dragger) {
  width: 100%;
  height: 100%;
  padding: 0;
  border-width: 0;
  border-radius: 0;
}

.upload-btn {
  padding: 10px;
}

.validation-errors {
  color: #f56c6c;
  font-size: 12px;
  line-height: 1.5;
  margin-top: 4px;
  min-height: 18px;
  text-align: left;
}

.next-step-container {
  display: flex;
  justify-content: center;
  background: #f7f8fb;
  padding: 20px 0 100px 0;
  .next-step-button {
    width: 180px;
    height: 40px;
    font-size: 16px;
    border-radius: 10px;
  }
}

.el-icon-view {
  width: 16px;
  height: 16px;
  margin-right: 8px;
}

.required::before {
  content: '*';
  color: #f56c6c;
  margin-right: 4px;
}
</style>
