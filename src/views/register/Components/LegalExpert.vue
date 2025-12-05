<!-- 
标题: LegalExpert.vue
功能: 法务专家注册
说明: 
开发信息: Create by 李刘超 2025-10-14 09:21:00
当前版本: 1.0
-->

<template>
  <div class="wrapper">
    <el-form :model="formData" :rules="rules" ref="formRef" label-width="200px" label-position="left" class="expert-form">
      <div class="content">
        <div class="title">
          <div class="block"></div>
          <span class="text">基础信息</span>
        </div>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="律师证书:" prop="diploma" required>
              <div class="upload-container">
                <el-upload
                  class="upload-box"
                  action="#"
                  :before-upload="beforeUpload"
                  drag
                  :auto-upload="false"
                  :show-file-list="false"
                  :on-change="handleDiplomaChange"
                  accept=".jpg,.jpeg,.png"
                >
                  <div class="upload-content">
                    <div v-if="!diplomaUrl">
                      <img src="@/assets/images/register3.svg" class="step-icon" />
                      <div class="upload-text">
                        <span>点击或将文件拖拽到这里上传</span>
                        <p class="upload-tip">单个文件最大10M 支持扩展名：jpg.jpeg.png</p>
                      </div>
                    </div>
                    <div v-if="diplomaUrl" class="image-with-delete">
                      <img :src="diplomaUrl" :alt="diplomaUrl" class="upload-image" />
                      <el-button class="delete-btn" circle size="small" type="danger" @click.stop="removeDiploma">
                        <el-icon><Close /></el-icon>
                      </el-button>
                    </div>
                  </div>
                </el-upload>
              </div>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="照片:" prop="photo" required>
              <div class="upload-container">
                <el-upload
                  class="upload-box"
                  action="#"
                  :auto-upload="false"
                  style="width: 150px"
                  :show-file-list="false"
                  :on-change="handlePhotoChange"
                  accept=".jpg,.jpeg,.png"
                  :before-upload="beforeUpload"
                  drag
                >
                  <div class="upload-content">
                    <div v-if="!photoUrl">
                      <img src="@/assets/images/register3.svg" class="step-icon" />
                      <div class="upload-text">
                        <p>上传照片</p>
                      </div>
                    </div>
                    <div v-if="photoUrl" class="image-with-delete">
                      <img :src="photoUrl" :alt="photoUrl" class="upload-image" />
                      <el-button class="delete-btn" circle size="small" type="danger" @click.stop="removePhoto">
                        <el-icon><Close /></el-icon>
                      </el-button>
                    </div>
                  </div>
                </el-upload>
                <span class="upload-tip">单个文件最大10M 支持扩展名：jpg.jpeg.png</span>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="专家姓名:" prop="expertName" required>
              <el-input v-model="formData.expertName" placeholder="OCR识别，可编辑" /> </el-form-item
          ></el-col>
          <el-col :span="12">
            <el-form-item label="性别:" prop="sex" required>
              <el-select v-model="formData.sex" placeholder="OCR识别，可编辑" filterable style="width: 100%">
                <el-option label="男" value="0" />
                <el-option label="女" value="1" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="执业机构:" prop="practiceInstitution" required>
              <el-input v-model="formData.practiceInstitution" placeholder="OCR识别，可编辑" /> </el-form-item
          ></el-col>
          <el-col :span="12">
            <el-form-item label="执业证类型:" prop="practiceCertificateType" required>
              <el-input v-model="formData.practiceCertificateType" placeholder="OCR识别，可编辑" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="执业证号:" prop="practiceCertificateNumber" required>
              <el-input v-model="formData.practiceCertificateNumber" placeholder="OCR识别，可编辑" /> </el-form-item
          ></el-col>
          <el-col :span="12">
            <el-form-item label="法律执业资格或律师资格证号:" prop="legalPracticeQualification" style="white-space: nowrap" required>
              <el-input v-model="formData.legalPracticeQualification" placeholder="OCR识别，可编辑" /> </el-form-item
          ></el-col>
          <el-col :span="12">
            <el-form-item label="发证机关:" prop="issuingAuthority" required>
              <el-input v-model="formData.issuingAuthority" placeholder="OCR识别，可编辑" /> </el-form-item
          ></el-col>
          <el-col :span="12">
            <el-form-item label="发证日期:" prop="issueDate" required>
              <el-date-picker
                v-model="formData.issueDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="OCR识别，可编辑"
                style="width: 100%"
              /> </el-form-item
          ></el-col>
          <el-col :span="12">
            <el-form-item label="身份证号:" prop="idCard" required>
              <el-input v-model="formData.idCard" placeholder="OCR识别，可编辑" /> </el-form-item
          ></el-col>
          <el-col :span="12">
            <el-form-item label="联系电话:" prop="phoneNumber" required>
              <el-input v-model="formData.phoneNumber" placeholder="请输入联系电话" /> </el-form-item
          ></el-col>
          <el-col :span="12">
            <el-form-item label="专业技术资格名称:" prop="technicalQualification" style="white-space: nowrap">
              <el-input v-model="formData.technicalQualification" placeholder="请输入专业技术资格名称" /> </el-form-item
          ></el-col>
          <el-col :span="12"></el-col>
          <el-col :span="12">
            <el-form-item label="专家简介:" prop="professionalSummary">
              <el-input
                v-model="formData.professionalSummary"
                type="textarea"
                :maxlength="150"
                show-word-limit
                input-style="height: 188px"
                placeholder="请输入专家简介"
              /> </el-form-item
          ></el-col>
        </el-row>
      </div>
      <div class="content" style="margin-top: 20px">
        <div class="title">
          <div class="block"></div>
          <span class="text"> <span class="bold">资料清单</span></span>
        </div>
        <div class="qualification-list">
          <div class="qualification-header">
            <el-upload :on-change="addQualification" action="#" :auto-upload="false" :show-file-list="false">
              <div class="upload-btn">
                <el-button v-throttle plain style="color: #108c58; border-color: #108c58">
                  <img src="@/assets/images/register5.svg" class="el-icon-view" />附件上传</el-button
                >
              </div>
            </el-upload>
          </div>
          <el-table :data="qualificationList" :cell-style="{ textAlign: 'center' }" :header-cell-style="{ textAlign: 'center' }" border>
            <el-table-column prop="index" label="序号" width="80" />
            <el-table-column prop="name" label="附件名" />
            <el-table-column prop="remark" label="备注">
              <template #default="scope">
                <el-input v-model="scope.row.remark" placeholder="请输入"></el-input>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="scope">
                <el-button v-throttle type="primary" link @click="previewQualification(scope.row)">下载</el-button>
                <el-button v-throttle type="primary" v-if="scope.row.fileType === '99'" link @click="deleteQualification(scope.$index)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <div class="content" style="margin-top: 20px">
        <div class="title">
          <div class="block"></div>
          <span class="text"> <span class="bold">账号信息</span></span>
        </div>
        <div class="qualification-list">
          <el-row :gutter="50">
            <el-col :span="12">
              <el-form-item label="姓名" prop="expertName" required>
                <el-input v-model="formData.expertName" placeholder="注册人姓名，填写身份证上的真实姓名，不要填写昵称" />
              </el-form-item>
            </el-col>
            <el-col :span="12"></el-col>

            <el-col :span="12">
              <el-form-item label="手机号" prop="phoneNumber" required>
                <el-input v-model="formData.phoneNumber" placeholder="请输入手机号" />
              </el-form-item>
            </el-col>
            <el-col :span="12"></el-col>

            <el-col :span="12">
              <el-form-item label="短信验证码" prop="smsCode" required>
                <el-input v-model="formData.smsCode" maxlength="6" placeholder="六位短信验证码" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-button v-throttle type="primary" class="sms-code-btn" :disabled="isSendingSms" @click="sendSmsCode">
                {{ smsButtonText }}
              </el-button></el-col
            >

            <el-col :span="12">
              <el-form-item label="设置密码" prop="password" required>
                <el-input v-model="formData.password" type="password" placeholder="长度8-16位，且至少包含大小写字母、数字中的2种" show-password />
              </el-form-item>
            </el-col>
            <el-col :span="12"></el-col>

            <el-col :span="12">
              <el-form-item label="确认密码" prop="confirmPassword" required>
                <el-input v-model="formData.confirmPassword" type="password" placeholder="请再次输入密码" show-password /> </el-form-item
            ></el-col>
          </el-row>
        </div>
      </div>
      <div class="next-step-container">
        <el-button v-throttle type="primary" class="next-step-button" @click="handleNextStep">提交</el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { Close } from '@element-plus/icons-vue';
import { isIdCard } from '@/utils/validate';
import { ocrUploadImage, uploadImage } from '@/api/register';
import { LegalExpert } from '@/api/register/legalExpert/types';
import { FileType } from '@/api/register/types';
import { FormRules } from 'element-plus';

import { checkPhoneUnique } from '@/api/register/purchaser'; //手机号唯一接口
import { sendSmsCode as sendSmsCodeApi } from '@/api/register/accountRegiser'; //验证码接口
import { legalExpertInfoRegister } from '@/api/register/legalExpert'; //注册接口
import { isAccountExist } from '@/api/login'; //账号获取详情信息
const emit = defineEmits(['nextStep']); // 定义事件
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const idType = ref(null); // 这四个参数  系统用户id：sysUserId【目前直接传null】,qyId【企业或者供应商id】,jszjId【技术专家id】,fwzjId【法务专家id】  如果响应的二次入驻的页面有对应的id存在，就传对应的id就行
enum idTypeEnum {
  sysUserId = null,
  supplier = 'qyId',
  expert = 'jszjId',
  legal = 'fwzjId'
}

const ocrMap = {
  lawyerName: 'expertName',
  holderName: 'expertName',
  lawFirm: 'practiceInstitution',
  practiceType: 'practiceCertificateType',
  certificateType: 'practiceCertificateType',
  barNumber: 'legalPracticeQualification',
  certificateNumber: 'practiceCertificateNumber',
  issuingAuthority: 'issuingAuthority',
  issueDate: 'issueDate',
  qualificationDate: 'issueDate',
  specialization: 'technicalQualification'
};
// 表单数据
// 可选 字段
const form: LegalExpert = {
  // 专家名称
  expertName: '',
  // 性别
  sex: '',
  // 执业机构
  practiceInstitution: '',
  // 执业证号
  practiceCertificateNumber: '',
  // 发证日期
  issueDate: '',
  // 法律执业资格或律师资格证号
  legalPracticeQualification: '',
  // 技术资格证号
  technicalQualification: '',
  // 联系电话
  contactPhone: '',
  // 身份证号
  idCard: '',
  // 专家简介
  professionalSummary: '',
  // 执业证类型
  practiceCertificateType: '',
  // 发证机关
  issuingAuthority: ''
} as LegalExpert;

// 表单验证规则
const FormRulesarr: FormRules<LegalExpert & { photo: string; diploma: string }> = {
  // 专家姓名
  expertName: [
    {
      required: true,
      trigger: 'blur',
      validator: (rule: any, value: any, callback: any) => {
        if (!value) {
          callback(new Error('请输入姓名'));
        } else if (value.length > 20 || !/^[一-龥A-Za-z]+$/.test(value)) {
          callback(new Error('姓名只能包含汉字或字母，最长不超过50字节。'));
        } else {
          callback();
        }
      }
    }
  ],
  // 性别
  sex: [{ required: true, message: '请选择性别', trigger: 'change' }],
  // 专家简介
  professionalSummary: [
    {
      required: true,
      message: '请输入专家简介',
      trigger: 'blur',
      validator: (rule: any, value: any, callback: any) => {
        if (!value) {
          callback(new Error('请输入专家简介'));
        } else if (value.length > 150 || !/^[一-龥A-Za-z0-9\s]+$/.test(value)) {
          callback(new Error('简介只能包含汉字、字母、数字和空格，最长不超过150字节。'));
        } else {
          callback();
        }
      }
    }
  ],
  // 照片
  photo: [
    {
      required: true,
      validator: (rule: any, value: any, callback: any) => {
        if (!photoUrl.value) {
          callback(new Error('请上传照片'));
        } else {
          callback();
        }
      },
      trigger: 'change'
    }
  ],
  // 身份证号
  idCard: [
    {
      trigger: 'blur',
      required: false,
      validator: (rule: any, value: any, callback: any) => {
        if (!value) {
          callback();
        } else if (!isIdCard(value)) {
          callback(new Error('请输入正确的身份证号'));
        } else {
          callback();
        }
      }
    }
  ],
  // 执业资格类型
  practiceCertificateType: [
    {
      required: true,
      trigger: 'change',
      validator: (rule: any, value: any, callback: any) => {
        if (!value) {
          callback(new Error('请输入执业证类型'));
        } else {
          callback();
        }
      }
    }
  ],
  // 法律执业资格或律师资格证号
  legalPracticeQualification: [{ required: true, message: '请输入法律执业资格或律师资格证号', trigger: 'blur' }],
  // 发证日期
  issueDate: [{ required: true, message: '请选择发证日期', trigger: 'change' }],
  // 技术资格证号
  technicalQualification: [{ required: true, message: '请输专业技术资格名称', trigger: 'blur' }],
  // 联系电话
  contactPhone: [
    {
      required: true,
      message: '请输入联系电话',
      trigger: 'blur',
      validator: (rule: any, value: any, callback: any) => {
        if (!value) {
          callback(new Error('请输入联系电话'));
        } else if (!/^1[3456789]\d{9}$/.test(value)) {
          callback(new Error('请输入正确的联系电话'));
        } else {
          callback();
        }
      }
    }
  ],
  // 执业机构
  practiceInstitution: [{ required: true, message: '请输入执业机构', trigger: 'blur' }],
  // 执业证号
  practiceCertificateNumber: [{ required: true, message: '请输入执业证号', trigger: 'blur' }],
  // 发证机关
  issuingAuthority: [
    {
      required: true,
      message: '请输入发证机关',
      trigger: 'blur',
      validator: (rule: any, value: any, callback: any) => {
        if (!value) {
          callback(new Error('请输入发证机关'));
        } else if (value.length > 100 || !/^[一-龥A-Za-z0-9\s]+$/.test(value)) {
          callback(new Error('发证机关名称最长不超过100字节，且仅支持汉字、字母、数字和常见符号。'));
        } else {
          callback();
        }
      }
    }
  ],
  // 律师证书
  diploma: [
    {
      required: true,
      validator: (rule: any, value: any, callback: any) => {
        if (!diplomaUrl.value) {
          callback(new Error('请上传律师证'));
        } else {
          callback();
        }
      },
      trigger: 'change'
    }
  ],
  phoneNumber: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        checkPhoneUnique(value, { [idTypeEnum[idType.value]]: String(formData.value?.id) })
          .then((res) => {
            if (res.code === 200) {
              callback();
            } else {
              callback(new Error('手机号已被注册'));
            }
          })
          .catch(() => {
            callback(new Error('手机号码已存在'));
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
        if (value !== formData.value.password) {
          return new Error('两次输入的密码不一致');
        }
        return true;
      },
      trigger: 'blur'
    }
  ]
};
const data = reactive({
  form: { ...form },
  rules: FormRulesarr
});

const { form: formData, rules } = toRefs(data);

// 上传图片相关
const diplomaUrl = ref('');
const photoUrl = ref('');
// 资质清单相关
const qualificationList = ref<
  {
    index: number;
    name: string;
    remark: string;
    url: string;
    fileType: FileType;
    ossId: string;
  }[]
>([]);
// 文件上传前校验
const beforeUpload = (file: any) => {
  //   const maxSize = 5 * 1024 * 1024; // 5MB
  //   if (file.size > maxSize) {
  //     ElMessage.error('文件大小不能超过5MB');
  //     return false;
  //   }

  const allowedTypes = [
    'image/jpeg',
    'image/png',
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
    await formRef.value?.validateField('phoneNumber');
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
    const res = await sendSmsCodeApi(formData.value.phoneNumber);
    if (res.code === 200) {
      ElMessage.success('短信验证码发送成功');
    }
  } catch (error) {
    // 手机号验证失败
    console.error('手机号验证失败', error);
  }
};
// 删除文件
const deleteQualification = (index: number) => {
  qualificationList.value.splice(index, 1);
  qualificationList.value.forEach((item, i) => {
    item.index = i + 1;
  });
};
const removeDiploma = () => {
  diplomaUrl.value = '';
  const idx = qualificationList.value.findIndex((item) => item.fileType === '2');
  if (idx !== -1) {
    qualificationList.value.splice(idx, 1);
    qualificationList.value.forEach((item, i) => (item.index = i + 1));
  }
  formRef.value?.validateField('diploma');
};
const removePhoto = () => {
  photoUrl.value = '';
  const idx = qualificationList.value.findIndex((item) => item.fileType === '0');
  if (idx !== -1) {
    qualificationList.value.splice(idx, 1);
    qualificationList.value.forEach((item, i) => (item.index = i + 1));
  }
  formRef.value?.validateField('photo');
};

// 上传律师证
const handleDiplomaChange = (file: any) => {
  proxy?.$modal.loading('正在上传律师证，请稍候...');
  uploadImage({
    file: file.raw
  })
    .then(async (res) => {
      diplomaUrl.value = res.data.url;
      const findDiploma = qualificationList.value.find((item) => item.fileType === '2');
      if (findDiploma) {
        findDiploma.name = res?.data?.fileName;
        findDiploma.url = res.data.url;
        findDiploma.ossId = res.data.ossId;
      } else {
        qualificationList.value.push({
          index: qualificationList.value.length + 1,
          name: res?.data?.fileName,
          remark: '律师证',
          url: res.data.url,
          fileType: '2',
          ossId: res.data.ossId
        });
      }
      try {
        const res_1 = await ocrUploadImage({ image_url_list: [res.data.url] });
        const data = res_1.data?.[0];
        console.log(data);
        const rawText = data?.rawText || '';
        if (rawText) {
          // 正则提取身份证号字符串开头的后边18位数字
          const m = rawText.match(/([0-9]{17}[0-9Xx])/);
          const id = m?.[1] || null;
          if (id) {
            formData.value.idCard = id;
          }
          //   只提取男女
          const sexMatch = rawText.match(/(男|女)/);
          const sex = sexMatch?.[1] || null;
          if (sex) {
            formData.value.sex = sex === '男' ? '0' : '1';
          }
        }
        Object.keys(data).forEach((key) => {
          const mappedKey = ocrMap[key] || key;
          if (data[key] && mappedKey !== 'sex') {
            formData.value[mappedKey] = data[key];
          } else if (mappedKey === 'sex' && data[key]) {
            formData.value[mappedKey] = data[key] === '男' ? '0' : '1';
          }
        });
      } catch (error) {
        // 如果OCR识别失败，则移除之前添加的文件
        qualificationList.value.pop();
        ElMessage.error('OCR识别失败，请重试');
        console.error('上传失败：', error);
        throw error; // 继续抛出错误以便在最后统一处理
      }
    })
    .finally(() => {
      proxy?.$modal.closeLoading();
    });
};

// 上传照片
const handlePhotoChange = (file: any) => {
  uploadImage({ file: file.raw }).then((res) => {
    if (res.code === 200 && res.data?.ossId) {
      photoUrl.value = res.data.url;
      const findImage = qualificationList.value.find((item) => item.fileType === '0');
      if (findImage) {
        findImage.name = res?.data?.fileName;
        findImage.url = res.data.url;
        findImage.ossId = res.data.ossId;
      } else {
        qualificationList.value.push({
          index: qualificationList.value.length + 1,
          name: res?.data?.fileName,
          remark: '照片',
          url: res.data.url,
          fileType: '0',
          ossId: res.data.ossId
        });
      }
    }
  });
};
// 上传其他附件
const addQualification = (file: any) => {
  uploadImage({ file: file.raw }).then((res) => {
    if (res.code === 200 && res.data?.ossId) {
      qualificationList.value.push({
        index: qualificationList.value.length + 1,
        name: file.name,
        remark: '附件上传',
        url: res.data.url,
        fileType: '99',
        ossId: res.data.ossId
      });
    }
  });
};

// 表单引用
const formRef = ref();

// 下载文件
const previewQualification = async (file: any) => {
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
  console.log('下载文件:', file);
};

// 下一步按钮处理函数
const handleNextStep = () => {
  console.log(formData.value);

  formRef.value?.validate((valid: boolean) => {
    if (valid) {
      const list = qualificationList.value.map((item) => ({
        fileType: item.fileType,
        ossId: item.ossId,
        remark: item.remark
      }));
      const temp = {
        ...formData.value,
        folder: list
      };
      legalExpertInfoRegister(temp).then((res) => {
        if (res.code === 200) {
          proxy?.$modal.msgSuccess('操作成功');
          emit('nextStep', { username: formData.value.expertName, account: formData.value.phoneNumber });
        }
      });
    } else {
      return false;
    }
  });
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
    formData.value = {
      ...arr.data,
      confirmPassword: arr.data.password
      // signUpTime: proxy.parseTime(arr.data.signUpTime, '{y}-{m}-{d}')
    };
    if (arr.data && arr.data.hnBaseRegisterFolderVoList && arr.data.hnBaseRegisterFolderVoList.length > 0) {
      arr.data.hnBaseRegisterFolderVoList.forEach((element: any, key: number) => {
        if (element && element.ossInfo) {
          qualificationList.value.push({
            index: key + 1,
            name: element.ossInfo.originalName,
            remark: element.remark,
            url: element.ossInfo.url,
            fileType: element.fileType,
            ossId: element.ossId
          });
          if (element.fileType == '2') {
            diplomaUrl.value = element.ossInfo.url;
          }
          if (element.fileType == '0') {
            photoUrl.value = element.ossInfo.url;
          }
        }
      });
    }
  }
});
</script>

<style scoped lang="scss">
.wrapper {
  background-color: #f7f8fb;
  .content {
    background-color: #fff;
    .title {
      border-bottom: 1px solid #e5e6eb;
      height: 54px;
      display: flex;
      align-items: center;
      gap: 5px;
      margin-bottom: 20px;
      .block {
        width: 3px;
        height: 14px;
        background-color: var(--el-color-primary);
      }
      .text {
        font-weight: bold;
        font-size: 16px;
        color: #000;
      }
    }
    .expert-form {
      padding: 16px;
    }
    .upload-container {
      width: 100%;
      .upload-box {
        --bg-color: #fafdfc;
        width: 100%;
        --el-fill-color-blank: var(--bg-color);
        --el-border-color: #108c58;
        border: 1px dashed var(--el-border-color);
        border-radius: 6px;
        .upload-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          border-radius: 6px;
          background-color: var(--bg-color);
          padding: 29px 0px;
          cursor: pointer;
          position: relative;
          .upload-text {
            margin-top: 10px;
            text-align: center;
            font-weight: bold;
            .upload-tip {
              font-size: 12px;
              color: #000;
              margin-top: 5px;
              margin: 0;
            }
          }
        }
      }
      .upload-tip {
        font-size: 12px;
        color: #999;
        margin-top: 5px;
      }
    }

    .qualification-list {
      padding: 0 16px 10px;
      .qualification-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        .upload-btn {
          font-size: 16px;
          font-weight: 600;
        }
      }
    }
  }

  .next-step-container {
    display: flex;
    justify-content: center;
    margin-top: 24px;
    padding-bottom: 100px;
    .next-step-button {
      width: 180px;
      height: 40px;
      font-size: 16px;
      border-radius: 10px;
    }
  }
}
// 使用深度选择器确保样式能够穿透到Element UI组件内部
.upload-container ::v-deep(.el-upload-dragger) {
  width: 100%;
  height: 100%;
  padding: 0;
  border-width: 0;
  border-radius: 0;
}
.upload-image {
  width: 100%;
  height: 150px;
}
.image-with-delete {
  position: relative;
  display: inline-block;
  width: 100%;
}
.delete-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  z-index: 2;
}
</style>
