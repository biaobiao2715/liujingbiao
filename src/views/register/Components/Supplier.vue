<template>
  <!--
    标题：			Supplier.vue
    功能：			供应商注册-填写信息
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
                  accept=".jpg,.jpeg,.gif,.png,.pdf"
                  action="#"
                  drag
                  :auto-upload="false"
                  :show-file-list="false"
                  :on-change="handleDiplomaChange"
                >
                  <div class="upload-content">
                    <img src="@/assets/images/register3.svg" class="step-icon" />
                    <!-- <img v-else :src="diplomaUrl" class="preview-image" /> -->
                    <div class="upload-text">
                      {{ diplomaUrl?.fileName ? diplomaUrl.fileName : '点击或将文件拖拽到这里上传' }}
                    </div>
                    <div class="upload-tip">单个文件最大10M 支持扩展名：jpg.jpeg.gif.png.pdf</div>
                  </div>
                </el-upload>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12"></el-col>

          <el-col :span="12">
            <el-form-item label="供应商名称" prop="companyName">
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
              <el-input v-model="form.licenseNumber" :disabled="true" placeholder="OCR识别" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="注册地址" prop="signUpAddress">
              <el-input v-model="form.signUpAddress" placeholder="OCR识别,可修改" />
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
            <el-form-item label="经营范围" prop="businessScope">
              <el-input v-model="form.businessScope" placeholder="OCR识别,可修改" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="法定代表人" prop="legalPerson">
              <el-input v-model="form.legalPerson" placeholder="OCR识别,可修改" />
            </el-form-item>
          </el-col>

          <el-col :span="12"></el-col>

          <el-col :span="12">
            <el-form-item label="办公地址" prop="officeAddress">
              <el-input v-model="form.officeAddress" placeholder="请输入详细地址" />
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <div class="h20"></div>

      <div class="title-text">供应商联系人</div>
      <div class="pading16">
        <el-table :data="tableList" stripe>
          <el-table-column type="index" width="100" label="序号" />
          <el-table-column prop="contactUserType" label="联系人类型">
            <template #default="scope">
              <el-select v-model="scope.row.contactUserType" placeholder="请选择" filterable clearable>
                <el-option v-for="(item, index) in contact_user_type" :key="index" :label="item.dictLabel" :value="item.dictValue"></el-option>
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
          <el-button @click="addTableCell" icon="Plus" color="#108C58" plain style="margin-top: 10px">新增</el-button>
        </div>
      </div>

      <div class="h20"></div>

      <div class="title-text">资料清单</div>
      <div class="pading16">
        <el-upload
          action="#"
          :auto-upload="false"
          accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx"
          :show-file-list="false"
          :on-change="handleChange"
          :before-upload="beforeUpload"
        >
          <div class="upload-btn">
            <el-button plain style="color: #108c58; border-color: #108c58">
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
              <el-input v-model="scope.row.remark" placeholder="请输入"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="250" align="center">
            <template #default="scope">
              <el-button text @click="previewFile(scope.row)" style="color: #108c58; border-color: #108c58; margin-right: 10px">
                <img src="@/assets/images/register1.svg" class="el-icon-view" />
                <span style="height: 16px; line-height: 16px">预览</span>
              </el-button>

              <el-button text v-if="scope.row.fileType !== '1'" @click="removeFile(scope.row)" style="color: #ff3131; border-color: #ff3131">
                <img src="@/assets/images/register4.svg" class="el-icon-view" />
                <span style="height: 16px; line-height: 16px">删除</span>
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="next-step-container">
        <el-button type="primary" class="next-step-button" @click="submitForm">下一步</el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { defineComponent, reactive, ref } from 'vue';
import { uploadImage, ocrUploadImage } from '@/api/register';
import { getPurchaserTypeDict, supplierRegister } from '@/api/register/Supplier';
import { FormData, Contact } from '@/api/register/Supplier/types';
import { useRegisterDataStore } from '@/store/modules/registerData';
import { ElMessage, FormRules } from 'element-plus';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { setRegisterData } = useRegisterDataStore();
const emit = defineEmits(['nextStep']); // 定义事件

const initFormData: FormData = {
  companyName: '武汉中兴悦达财务有限公司',
  signUpCapital: '1111',
  licenseNumber: '91420105066800342M',
  signUpAddress: '南京市浦口区星火路地铁站',
  signUpTime: '',
  businessScope: '会计咨询：代理记账：企业事务代理：文化艺术交流活动组织、策\n划：企业管理咨询：教育咨询',
  legalPerson: '刘义刀',
  officeAddress: '南京市浦口区星火路地铁站动漫大厦'
};
// 更新表单验证规则
const FormRulesarr: FormRules = {
  companyName: [
    { required: true, message: '供应商名称不能为空', trigger: 'blur' },
    {
      validator: (rule: any, value: any, callback: any) => {
        if (!value || value.trim() === '') {
          callback(new Error('供应商名称不能为空'));
          return;
        }

        // 验证长度（100字节）
        if (new Blob([value]).size > 100) {
          callback(new Error('输入字符超过限制，最多可输入100字节'));
          return;
        }

        // 验证特殊字符
        const specialChars = /[^a-zA-Z\u4e00-\u9fa50-9~!@#$%^&*()_+=<>?\/\-.,;:'"\\|`{}[\] ]/;
        if (specialChars.test(value)) {
          callback(new Error('供应商名称只能包含汉字、字母、数字和常规符号'));
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
      validator: (rule: any, value: any, callback: any) => {
        if (!value || value.trim() === '') {
          callback(new Error('注册资本不能为空'));
          return;
        }

        // 验证是否为有效数字
        const numRegex = /^\d+(\.\d{1,2})?$/;
        if (!numRegex.test(value)) {
          callback(new Error('请输入有效的数字，支持最多两位小数'));
          return;
        }

        // 验证数值范围
        const numValue = parseFloat(value);
        if (numValue <= 0) {
          callback(new Error('注册资本必须大于0'));
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

        // 验证长度
        if (value.length !== 18) {
          callback(new Error('统一社会信用代码必须是18位的字母和数字组合'));
          return;
        }

        // 验证格式（仅允许数字和大写字母）
        const codeRegex = /^[0-9A-Z]+$/;
        if (!codeRegex.test(value)) {
          callback(new Error('统一社会信用代码必须是18位的字母和数字组合'));
          return;
        }

        callback();
      },
      trigger: 'blur'
    }
  ],
  signUpAddress: [
    { required: true, message: '注册地址不能为空', trigger: 'blur' },
    {
      validator: (rule: any, value: any, callback: any) => {
        if (!value || value.trim() === '') {
          callback(new Error('注册地址不能为空'));
          return;
        }

        // 验证长度（200字节）
        if (new Blob([value]).size > 200) {
          callback(new Error('注册地址最长不超过200字节'));
          return;
        }

        callback();
      },
      trigger: 'blur'
    }
  ],
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
          callback(new Error('请输入有效的日期，格式为YYYY-MM-DD'));
          return;
        }

        // 验证日期范围（这里假设营业执照签发日期为当前日期，实际应用中需要获取真实签发日期）
        const currentDate = new Date();
        const inputDate = new Date(value);
        if (inputDate > currentDate) {
          callback(new Error('注册日期不能晚于当前日期'));
          return;
        }

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

        // 验证长度（500字节）
        if (new Blob([value]).size > 500) {
          callback(new Error('经营范围最长不超过500字节'));
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

        // 验证长度（50字节）
        if (new Blob([value]).size > 50) {
          callback(new Error('法定代表人姓名最长不超过50字节'));
          return;
        }

        // 验证格式（只能包含汉字和字母）
        const nameRegex = /^[\u4e00-\u9fa5a-zA-Z]+$/;
        if (!nameRegex.test(value)) {
          callback(new Error('法定代表人姓名只能包含汉字或字母'));
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

        // 验证长度（200字节）
        if (new Blob([value]).size > 200) {
          callback(new Error('办公地址最长不超过200字节'));
          return;
        }

        callback();
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
    contactUserName: '刘义刀',
    contactIdCard: '',
    contactPhone: '17839305536'
  },
  {
    contactUserType: '0',
    contactUserName: '刘义手',
    contactIdCard: '',
    contactPhone: '17839305536'
  }
]);

// 文件列表
const fileListtable = ref<any[]>([]);
const diplomaUrl = ref<{ fileName?: string; url?: string; ossId: string } | null>(null);

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
    // 验证长度（50字节）
    if (new Blob([contact.contactUserName]).size > 50) {
      errorsValue.contactUserName = '姓名最长不超过50字节';
    }

    // 验证格式（只能包含汉字、字母和部分符号）
    const nameRegex = /^[\u4e00-\u9fa5a-zA-Z\-\'\s]+$/;
    if (!nameRegex.test(contact.contactUserName)) {
      errorsValue.contactUserName = '姓名只能包含汉字、字母，且最长不超过50字节';
    }
  }

  // 验证身份证号码（格式验证）
  if (contact.contactIdCard && contact.contactIdCard.trim() !== '') {
    const idCardPattern = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
    if (!idCardPattern.test(contact.contactIdCard)) {
      errorsValue.contactIdCard = '身份证号码格式不正确';
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
    proxy?.$modal.msgError('请检查并修正供应商联系人中的错误');
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
        enterpriseInfo: form,
        contacts: tableList.value,
        folder: fileListtable.value
      };
      setRegisterData?.(params);
      proxy?.$modal.msgSuccess('操作成功');
      emit('nextStep');
    } else {
      ElMessage.error('请完善基础信息必填信息');
    }
  });
};
/** 文件上传成功处理 */
const handleDiplomaChange = (file: UploadFile) => {
  proxy?.$modal.loading('正在上传营业执照，请稍候...');
  // 文件上传
  uploadImage({ file: file.raw })
    .then((res) => {
      if (res.data?.ossId) {
        const newFile = {
          name: file.name || '营业执照',
          remark: '营业执照',
          url: res.data.url,
          fileType: '1',
          ossId: res.data.ossId
        };
        fileListtable.value.push(newFile);

        return ocrUploadImage({ file: file.raw })
          .then((res) => {
            // console.log('上传成功：', res);
            Object.keys(res).forEach((key) => {
              if (key in form.value) {
                form.value[key] = res[key];
              }
            });
          })
          .catch((error) => {
            // 如果OCR识别失败，则移除之前添加的文件
            fileListtable.value.pop();
            ElMessage.error('OCR识别失败,请重试');
            console.error('上传失败：', error);
            throw error; // 继续抛出错误以便在最后统一处理
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
      // 关闭加载状态
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
          name: file.name,
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
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    ElMessage.error('文件大小不能超过5MB');
    return false;
  }

  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  if (!allowedTypes.includes(file.type)) {
    ElMessage.error('不支持的文件类型');
    return false;
  }

  return true;
};

// 预览文件
const previewFile = (file: any) => {
  console.log('预览文件:', file);
  if (!file.url) {
    ElMessage.warning('无法预览该文件');
    return;
  }

  // 根据文件类型进行不同方式的预览
  const fileExtension = file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase();

  // 图片文件预览
  if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
    const img = new Image();
    img.src = file.url;
    const imageWindow = window.open('');
    if (imageWindow) {
      imageWindow.document.write(`
        <html>
          <head>
            <title>图片预览</title>
            <style>
              body {
                margin: 0;
                padding: 20px;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                background: #f5f5f5;
              }
              img { max-width: 95vw; max-height: 95vh; }
            </style>
          </head>
          <body>
            <img src="${file.url}" alt="${file.name}" />
          </body>
        </html>
      `);
      imageWindow.document.close();
    } else {
      ElMessage.error('弹窗被阻止，请允许弹窗后重试');
    }
    return;
  }

  // PDF文件预览
  if (fileExtension === 'pdf') {
    window.open(file.url, '_blank');
    return;
  }

  // 文档文件预览（使用浏览器内置功能或提示下载）
  if (['doc', 'docx', 'xls', 'xlsx'].includes(fileExtension)) {
    const newWindow = window.open(file.url, '_blank');
    if (!newWindow) {
      ElMessage.error('弹窗被阻止，请允许弹窗或直接下载文件');
    }
    return;
  }

  // 其他文件类型提供下载
  const link = document.createElement('a');
  link.href = file.url;
  link.download = file.name;
  link.click();
  ElMessage.info('不支持在线预览，已尝试下载文件');
};

// 删除文件
const removeFile = (file: any) => {
  const index = fileListtable.value.findIndex((f) => f.uid === file.uid);
  if (index !== -1) {
    fileListtable.value.splice(index, 1);
  }
};
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
  margin-top: 130px;
  margin-bottom: 20px;
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
