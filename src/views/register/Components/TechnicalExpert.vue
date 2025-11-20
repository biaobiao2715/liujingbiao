<!-- 
标题: TecnnicalExpert.vue
功能: 技术专家注册
说明: 
开发信息: Create by 李刘超 2025-10-13 14:21:42
当前版本: 1.0
-->

<template>
  <div class="wrapper">
    <el-form :model="formData" :rules="rules" ref="formRef" label-width="140px" label-position="left" class="expert-form">
      <div class="content">
        <div class="title">
          <div class="block"></div>
          <span class="text">基础信息</span>
        </div>
        <div style="padding: 0 16px">
          <el-row :gutter="50">
            <el-col :span="12">
              <el-form-item label="毕业证书" prop="diploma" required>
                <div class="upload-container">
                  <el-upload
                    class="upload-box"
                    accept=".jpg,.jpeg,.gif,.png,.pdf"
                    action="#"
                    drag
                    :auto-upload="false"
                    :show-file-list="false"
                    :on-change="handleDiplomaChange"
                    :before-upload="beforeUpload"
                  >
                    <div class="upload-content">
                      <div v-if="!diplomaUrl">
                        <img src="@/assets/images/register3.svg" class="step-icon" />
                        <div class="upload-text">
                          <span>点击或将文件拖拽到这里上传</span>
                          <p class="upload-tip">单个文件最大10M 支持扩展名：jpg.jpeg.gif.png.pdf</p>
                        </div>
                      </div>
                      <img v-if="diplomaUrl" :src="diplomaUrl" :alt="diplomaUrl" class="upload-image" />
                    </div>
                  </el-upload>
                </div>
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="照片" prop="photo" required>
                <div class="upload-container">
                  <el-upload
                    class="upload-box"
                    action="#"
                    :auto-upload="false"
                    style="width: 150px"
                    :show-file-list="false"
                    :on-change="handlePhotoChange"
                    accept=".jpg,.jpeg,.gif,.png"
                    drag
                  >
                    <div class="upload-content">
                      <div v-if="!photoUrl">
                        <img src="@/assets/images/register3.svg" class="step-icon" />
                        <div class="upload-text">
                          <p>上传照片</p>
                        </div>
                      </div>
                      <img v-if="photoUrl" :src="photoUrl" :alt="photoUrl" class="upload-image" />
                    </div>
                  </el-upload>
                  <p class="upload-tip">单个文件最大10M 支持扩展名：jpg.png.jpeg.gif</p>
                </div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="专家姓名" prop="expertName" required>
                <el-input v-model="formData.expertName" placeholder="OCR识别，可编辑" />
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="性别" prop="sex" required>
                <el-select v-model="formData.sex" placeholder="OCR识别，可编辑" filterable style="width: 100%">
                  <el-option label="男" value="0" />
                  <el-option label="女" value="1" />
                </el-select> </el-form-item
            ></el-col>

            <el-col :span="12">
              <el-form-item label="出生年月" prop="birthDate" required>
                <el-date-picker
                  v-model="formData.birthDate"
                  type="date"
                  value-format="YYYY-MM"
                  placeholder="OCR识别，可编辑"
                  style="width: 100%"
                /> </el-form-item
            ></el-col>
            <el-col :span="12">
              <el-form-item label="毕业院校" prop="graduationSchool" required>
                <el-input v-model="formData.graduationSchool" placeholder="OCR识别，可编辑" />
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="专业" prop="major" required>
                <el-input v-model="formData.major" maxlength="99" placeholder="OCR识别，可编辑" /> </el-form-item
            ></el-col>
            <el-col :span="12">
              <el-form-item label="入学日期" prop="enrollmentDate" required>
                <el-date-picker
                  v-model="formData.enrollmentDate"
                  type="date"
                  value-format="YYYY-MM-DD"
                  placeholder="OCR识别，可编辑"
                  style="width: 100%"
                /> </el-form-item
            ></el-col>

            <el-col :span="12">
              <el-form-item label="毕业日期" prop="graduationDate" required>
                <el-date-picker
                  v-model="formData.graduationDate"
                  :disabled-date="disabledGraduationDate"
                  type="date"
                  value-format="YYYY-MM-DD"
                  placeholder="OCR识别，可编辑"
                  style="width: 100%"
                /> </el-form-item
            ></el-col>

            <el-col :span="12">
              <el-form-item label="学历" prop="education" required>
                <el-select v-model="formData.education" placeholder="OCR识别，可编辑" filterable style="width: 100%">
                  <el-option label="本科" value="本科" />
                  <el-option label="硕士" value="硕士" />
                  <el-option label="博士" value="博士" />
                  <el-option label="其他" value="其他" />
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="学位" prop="degree" required>
                <el-select v-model="formData.degree" placeholder="OCR识别，可编辑" filterable style="width: 100%">
                  <el-option label="学士" value="学士" />
                  <el-option label="硕士" value="硕士" />
                  <el-option label="博士" value="博士" />
                  <el-option label="其他" value="其他" />
                </el-select> </el-form-item
            ></el-col>

            <el-col :span="12">
              <el-form-item label="毕业证书编号" prop="graduationCertNo" required>
                <el-input v-model="formData.graduationCertNo" placeholder="OCR识别，可编辑" /> </el-form-item
            ></el-col>
            <el-col :span="12">
              <el-form-item label="专业技术资格名称" prop="technicalQualification" style="white-space: nowrap">
                <el-input v-model="formData.technicalQualification" placeholder="请输入专业技术资格名称" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="联系电话" prop="phoneNumber" required>
                <el-input v-model="formData.phoneNumber" placeholder="请输入联系电话" /> </el-form-item
            ></el-col>
            <el-col :span="12">
              <el-form-item label="身份证号" prop="idCard"> <el-input v-model="formData.idCard" placeholder="请输入身份证号" /> </el-form-item
            ></el-col>

            <el-col :span="12"></el-col>
            <el-col :span="12">
              <el-form-item label="专家简介" prop="expertInfo" required>
                <el-input
                  v-model="formData.expertInfo"
                  type="textarea"
                  :maxlength="300"
                  show-word-limit
                  input-style="height: 188px"
                  placeholder="请输入专家简介"
                /> </el-form-item
            ></el-col>
          </el-row>
        </div>
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
          <el-table
            :data="qualificationList"
            style="width: 100%"
            :cell-style="{ textAlign: 'center' }"
            :header-cell-style="{ textAlign: 'center' }"
            border
          >
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
                <el-input
                  v-model="formData.password"
                  type="password"
                  placeholder="输入密码，包含8-20位大小写字母、符号或数字两种以上"
                  show-password
                />
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
import { isIdCard } from '@/utils/validate';
import { TechnicalExpert } from '@/api/register/technicalExpert/types';
import { ocrUploadImage, uploadImage } from '@/api/register';
import { FileType } from '@/api/register/types';
import { FormRules } from 'element-plus';
import { checkPhoneUnique } from '@/api/register/purchaser'; //手机号唯一接口
import { sendSmsCode as sendSmsCodeApi } from '@/api/register/accountRegiser'; //验证码接口
import { technicalExpertInfoRegister } from '@/api/register/technicalExpert'; //注册接口
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
// 表单数据
const form: TechnicalExpert = {
  // 专家姓名
  expertName: '',
  sex: '',
  birthDate: '',
  // 毕业院校
  graduationSchool: '',
  // 专业
  major: '',
  // 入学日期
  enrollmentDate: '',
  // 毕业日期
  graduationDate: '',
  // 学历
  education: '',
  // 学位
  degree: '',
  graduationCertNo: '',
  // 技术资质
  technicalQualification: '',
  // 身份证号
  idCard: '',
  // 专家简介
  expertInfo: '',
  // 联系电话
  phoneNumber: ''
} as TechnicalExpert;

const FormRulesarr: FormRules<TechnicalExpert & { diploma: string; photo: string }> = {
  // 专家姓名
  expertName: [
    {
      required: true,
      trigger: 'blur',
      validator: (rule: any, value: any, callback: any) => {
        if (!value) {
          callback(new Error('请输入姓名'));
        } else if (value.length > 50) {
          callback(new Error('专家姓名最多50个字符'));
        } else if (!/^[\u4e00-\u9fa5a-zA-Z\s]+$/.test(value)) {
          callback(new Error('专家姓名只能包含中文、英文'));
        } else {
          callback();
        }
      }
    }
  ],
  // 性别
  sex: [{ required: true, message: '请选择性别', trigger: 'change' }],
  // 出生年月
  birthDate: [
    {
      validator: (rule: any, value: any, callback: any) => {
        if (!value) {
          callback(new Error('请选择出生年月'));
          //   格式 YYYY-MM
        } else if (!/^\d{4}-\d{2}$/.test(value)) {
          callback(new Error('请输入有效的出生年月，格式为YYYY-MM'));
        } else {
          callback();
        }
      }
    }
  ],
  // 专业
  major: [{ required: true, message: '请输入专业名称', trigger: 'blur' }],
  // 毕业日期
  graduationDate: [
    {
      validator: (rule: any, value: any, callback: any) => {
        if (!value) {
          callback(new Error('请选择毕业日期'));
        } else if (formData.value.enrollmentDate && value < formData.value.enrollmentDate) {
          callback(new Error('毕业日期不能早于入学日期'));
        } else {
          callback();
        }
      },
      trigger: 'change'
    }
  ],
  // 专家简介
  expertInfo: [
    {
      required: true,
      trigger: 'blur',
      validator: (rule: any, value: any, callback: any) => {
        if (!value) {
          callback(new Error('请输入专家简介'));
        } else if (value.length > 150) {
          callback(new Error('专家简介最多150个字符'));
        } else {
          callback();
        }
      }
    }
  ],
  // 学位
  degree: [{ required: true, message: '请选择学位', trigger: 'change' }],
  // 毕业证书编号
  graduationCertNo: [
    {
      required: true,
      trigger: 'blur',
      validator: (rule: any, value: any, callback: any) => {
        if (!value) {
          callback(new Error('请输入毕业证书编号'));
        } else if (value.length > 20) {
          callback(new Error('毕业证书编号最多20个字符'));
        } else {
          callback();
        }
      }
    }
  ],
  // 联系电话
  contactPhone: [
    {
      required: true,
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
  // 毕业证书
  diploma: [
    {
      required: true,
      validator: (rule: any, value: any, callback: any) => {
        if (!diplomaUrl.value) {
          callback(new Error('请上传毕业证书'));
        } else {
          callback();
        }
      },
      trigger: 'change'
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
  // 入学日期
  enrollmentDate: [{ required: true, message: '请选择入学日期', trigger: 'change' }],
  // 学历
  education: [{ required: true, message: '请选择学历', trigger: 'change' }],
  // 毕业学校
  graduationSchool: [
    {
      required: true,
      trigger: 'blur',
      validator: (rule: any, value: any, callback: any) => {
        if (!value) {
          callback(new Error('请输入毕业学校'));
        } else if (value.length > 100) {
          callback(new Error('毕业校院名称最长不超过100字节，且仅支持汉字、字母、数字和常见符号。'));
        } else {
          callback();
        }
      }
    }
  ],
  userName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
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
    { min: 8, max: 20, message: '密码长度为8-20位', trigger: 'blur' },
    {
      validator: (rule, value) => {
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}:"<>?]).{8,}/.test(value)) {
          return new Error('密码需包含大小写字母、数字和符号中的至少三种');
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
// 表单引用
const formRef = ref();

// 上传毕业证url
const diplomaUrl = ref('');
// 照片url
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
// 禁用毕业日期早于入学日期
const disabledGraduationDate = (date) => {
  if (!formData.value.enrollmentDate) {
    return false;
  }
  const enrollmentDate = new Date(formData.value.enrollmentDate);
  return date.getTime() < enrollmentDate.getTime();
};
// 上传毕业证
const handleDiplomaChange = (file: any) => {
  proxy?.$modal.loading('正在上传毕业证，请稍候...');
  uploadImage({ file: file.raw })
    .then((res) => {
      if (res.code === 200 && res.data?.ossId) {
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
            remark: '毕业证',
            url: res.data.url,
            fileType: '2',
            ossId: res.data.ossId
          });
        }
        return ocrUploadImage({ image_url_list: [res.data.url] })
          .then((res) => {
            const data = res?.data?.[0] || {};
            Object.keys(data).forEach((key) => {
              if (data[key]) {
                formData.value[key] = data[key];
              }
            });
          })
          .catch((error) => {
            // 如果OCR识别失败，则移除之前添加的文件
            qualificationList.value.pop();
            ElMessage.error('OCR识别失败，请重试');
            console.error('上传失败：', error);
            throw error; // 继续抛出错误以便在最后统一处理
          });
      }
    })
    .finally(() => {
      proxy?.$modal.closeLoading();
    });
};
// 删除文件
const deleteQualification = (index: number) => {
  qualificationList.value.splice(index, 1);
  qualificationList.value.forEach((item, i) => {
    item.index = i + 1;
  });
};
// 上传照片
const handlePhotoChange = (file: any) => {
  uploadImage({ file: file.raw }).then((res) => {
    if (res.code === 200 && res.data?.ossId) {
      photoUrl.value = res.data.url;
      const findPhoto = qualificationList.value.find((item) => item.fileType === '0');
      if (findPhoto) {
        findPhoto.name = res?.data?.fileName;
        findPhoto.url = res.data.url;
        findPhoto.ossId = res.data.ossId;
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

// 下一步按钮处理函数
const handleNextStep = () => {
  formRef.value.validate((valid: boolean) => {
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
      technicalExpertInfoRegister(temp).then((res) => {
        if (res.code === 200) {
          proxy?.$modal.msgSuccess('操作成功');
          emit('nextStep', { username: formData.value.expertName, account: formData.value.phoneNumber });
        }
      });
      // 这里可以添加提交逻辑
    } else {
      ElMessage.error('请完善必填信息');
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
        width: 100%;
        .upload-content {
          width: 100%;
          text-align: center;
          background: #fafdfc;
          border-radius: 4px 4px 4px 4px;
          border: 1px solid #108c58;
          padding: 29px 0;
          cursor: pointer;
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

    .upload-image {
      width: 100%;
      height: 150px;
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
</style>
