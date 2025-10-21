<!-- 
标题: LegalExpert.vue
功能: 法务专家注册
说明: 
开发信息: Create by 李刘超 2025-10-14 09:21:00
当前版本: 1.0
-->

<template>
  <div class="wrapper">
    <div class="content">
      <div class="title">
        <div class="block"></div>
        <span class="text">基础信息</span>
      </div>
      <el-form :model="formData" :rules="rules" ref="formRef" label-width="200px" label-position="left" class="expert-form">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="律师证书:" prop="diploma" required>
              <div class="upload-container">
                <el-upload class="upload-box" action="#" drag :auto-upload="false" :show-file-list="false" :on-change="handleDiplomaChange">
                  <div class="upload-content">
                    <img src="@/assets/images/register3.svg" class="step-icon" />
                    <div class="upload-text">
                      <span>点击或将文件拖拽到这里上传</span>
                      <p class="upload-tip">单个文件最大10M 支持扩展名：jpg.jpeg.gif.png.pdf</p>
                    </div>
                  </div>
                </el-upload>
              </div>
            </el-form-item>

            <el-form-item label="专家姓名:" prop="expertName" required>
              <el-input v-model="formData.expertName" placeholder="50个字符，仅限中文" />
            </el-form-item>

            <el-form-item label="执业机构:" prop="practiceInstitution" required>
              <el-input v-model="formData.practiceInstitution" placeholder="50个字符，仅限中文" />
            </el-form-item>

            <el-form-item label="执业证号:" prop="practiceCertificateNumber" required>
              <el-input v-model="formData.practiceCertificateNumber" placeholder="50个字符，仅限中文" />
            </el-form-item>

            <el-form-item label="发证机关:" prop="issuingAuthority" required>
              <el-input v-model="formData.issuingAuthority" placeholder="请输入发证机关" />
            </el-form-item>

            <el-form-item label="身份证号:" prop="idCard" required>
              <el-input v-model="formData.idCard" placeholder="请输入身份证号" />
            </el-form-item>

            <el-form-item label="专业技术资格名称:" prop="technicalQualification" style="white-space: nowrap">
              <el-input v-model="formData.technicalQualification" placeholder="请输入专业技术资格名称" />
            </el-form-item>

            <el-form-item label="专家简介:" prop="professionalSummary" required>
              <el-input
                v-model="formData.professionalSummary"
                type="textarea"
                :maxlength="150"
                show-word-limit
                input-style="height: 188px"
                placeholder="请输入专家简介"
              />
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
                >
                  <div class="upload-content" style="padding: 20px 20px 10px">
                    <img src="@/assets/images/register3.svg" class="step-icon" />
                    <div class="upload-text">
                      <p>上传照片</p>
                    </div>
                  </div>
                </el-upload>
                <span class="upload-tip">单个文件最大10M 支持扩展名：jpg.png.jpeg.gif</span>
              </div>
            </el-form-item>

            <el-form-item label="性别:" prop="sex" required>
              <el-select v-model="formData.sex" placeholder="请选择" style="width: 100%">
                <el-option label="男" value="0" />
                <el-option label="女" value="1" />
              </el-select>
            </el-form-item>

            <el-form-item label="执业证类型:" prop="practiceCertificateType" required>
              <el-input v-model="formData.practiceCertificateType" placeholder="请输入执业证类型" />
            </el-form-item>

            <el-form-item label="法律执业资格或律师资格证号:" prop="legalPracticeQualification" style="white-space: nowrap" required>
              <el-input v-model="formData.legalPracticeQualification" placeholder="请输入法律执业资格或律师资格证号" />
            </el-form-item>

            <el-form-item label="发证日期:" prop="issueDate" required>
              <el-date-picker v-model="formData.issueDate" type="date" value-format="YYYY-MM-DD" placeholder="选择日期" style="width: 100%" />
            </el-form-item>

            <el-form-item label="联系电话:" prop="contactPhone" required>
              <el-input v-model="formData.contactPhone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
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
              <el-button v-throttle  plain style="color: #108c58; border-color: #108c58">
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
          <el-table-column prop="remark" label="备注" />
          <el-table-column label="操作" width="150">
            <template #default="scope">
              <el-button v-throttle  type="primary" link @click="previewQualification(scope.row)">预览</el-button>
              <!--  资质名称为 毕业证 或 法律执业资格或律师资格证号 不显示删除按钮  -->
              <el-button v-throttle 
                type="primary"
                v-if="scope.row.name !== '毕业证' && scope.row.name !== '照片'"
                link
                @click="deleteQualification(scope.$index)"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <div class="next-step-container">
      <el-button v-throttle  type="primary" class="next-step-button" @click="handleNextStep">下一步</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { isIdCard } from '@/utils/validate';
import { ocrUploadImage, uploadImage } from '@/api/register';
import { LegalExpert } from '@/api/register/legalExpert/types';
import { FileType } from '@/api/register/types';
import { useRegisterDataStore } from '@/store/modules/registerData';
import { FormRules } from 'element-plus';
const emit = defineEmits(['nextStep']); // 定义事件
const { setRegisterData } = useRegisterDataStore();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

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
          callback(new Error('请输入专家姓名'));
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
          callback(new Error('执业证类别选择无效，请重新选择。'));
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
  technicalQualification: [{ required: true, message: '请输入技术资格证号', trigger: 'blur' }],
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
// 上传毕业证
const handleDiplomaChange = (file: any) => {
  proxy?.$modal.loading('正在上传律师证，请稍候...');
  uploadImage({
    file: file.raw
  })
    .then((res) => {
      diplomaUrl.value = res.data.ossId;
      qualificationList.value.push({
        index: qualificationList.value.length + 1,
        name: '毕业证',
        remark: res?.data?.fileName || '上传毕业证',
        url: res.data.url,
        fileType: '2',
        ossId: res.data.ossId
      });
      return ocrUploadImage({ file: file.raw })
        .then((res) => {
          // console.log('上传成功：', res);
          Object.keys(res).forEach((key) => {
            if (key in formData.value) {
              formData.value[key] = res[key];
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
    })
    .finally(() => {
      proxy?.$modal.closeLoading();
    });
};

// 上传照片
const handlePhotoChange = (file: any) => {
  uploadImage({ file: file.raw }).then((res) => {
    if (res.code === 200 && res.data?.ossId) {
      photoUrl.value = res.data.ossId;
      qualificationList.value.push({
        index: qualificationList.value.length + 1,
        name: '照片',
        remark: res?.data?.fileName || '上传照片',
        url: res.data.url,
        fileType: '0',
        ossId: res.data.ossId
      });
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

const deleteQualification = (index: number) => {
  //   qualificationList.value.splice(index, 1);
  //   // 重新计算序号
  //   qualificationList.value.forEach((item, i) => {
  //     item.index = i + 1;
  //   });
};

// 表单引用
const formRef = ref();

// 预览资质文件
const previewQualification = (row: any) => {
  console.log('预览资质', row);

  // 这里可以实现预览逻辑，例如打开文件或显示预览对话框
};

// 下一步按钮处理函数
const handleNextStep = () => {
  formRef.value?.validate((valid: boolean) => {
    if (valid) {
      const temp = { ...formData.value };
      const list = qualificationList.value.map((item) => ({
        fileType: item.fileType,
        ossId: item.ossId,
        remark: item.remark
      }));
      if (list.length) {
        //@ts-ignore
        temp['folder'] = list;
      }
      setRegisterData?.(temp);
      emit('nextStep');
    } else {
      return false;
    }
  });
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
        --bg-color: #fafdfc;
        width: 100%;
        --el-fill-color-blank: var(--bg-color);
        --el-border-color: #108c58;
        border: 1px dashed var(--el-border-color);
        border-radius: 6px;
        :deep(.el-upload-dragger) {
          height: 150px;
        }
        .upload-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          border-radius: 6px;
          background-color: var(--bg-color);
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
</style>
