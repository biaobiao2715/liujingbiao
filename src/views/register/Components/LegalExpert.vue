<!-- 
标题: LegalExpert.vue
功能: 法务专家注册
说明: 
开发信息: Create by 李刘超 2025-10-14 09:21:00
当前版本: 1.0
-->

<template>
  <div class="wrapper">
    <div class="title">
      <div class="block"></div>
      <span class="text"> <span class="bold">专家</span>基础信息</span>
    </div>

    <el-form :model="formData" :rules="rules" ref="formRef" label-width="200px" class="expert-form">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="律师证书:" prop="diploma" required>
            <div class="upload-container">
              <el-upload class="upload-box" action="#" drag :auto-upload="false" :show-file-list="false" :on-change="handleDiplomaChange">
                <div class="upload-content">
                  <el-icon><Plus /></el-icon>
                  <!-- <img v-else :src="diplomaUrl" class="preview-image" /> -->
                  <div class="upload-text">
                    <p>点击或将文件拖拽到这里上传</p>
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
                <div class="upload-content">
                  <el-icon><Plus /></el-icon>
                  <!-- <img v-else :src="photoUrl" class="preview-image" /> -->
                  <div class="upload-text">
                    <p>上传照片</p>
                  </div>
                </div>
              </el-upload>
              <p class="upload-tip">单个文件最大10M 支持扩展名：jpg.png.jpeg.gif</p>
            </div>
          </el-form-item>

          <el-form-item label="性别:" prop="sex" required>
            <el-select v-model="formData.sex" placeholder="请选择" style="width: 100%">
              <el-option label="男" :value="0" />
              <el-option label="女" :value="1" />
            </el-select>
          </el-form-item>

          <el-form-item label="执业证类型:" prop="practiceCertificateType" required>
            <el-input v-model="formData.practiceCertificateType" placeholder="请输入执业证类型" />
          </el-form-item>

          <el-form-item label="法律执业资格或律师资格证号:" prop="legalPracticeQualification" style="white-space: nowrap" required>
            <el-input v-model="formData.legalPracticeQualification" placeholder="请输入法律执业资格或律师资格证号" />
          </el-form-item>

          <el-form-item label="发证日期:" prop="issueDate" required>
            <el-date-picker v-model="formData.issueDate" type="date" placeholder="选择日期" style="width: 100%" />
          </el-form-item>

          <el-form-item label="联系电话:" prop="phoneNumber" required>
            <el-input v-model="formData.phoneNumber" placeholder="请输入联系电话" />
          </el-form-item>
        </el-col>
      </el-row>
      <div class="title" style="border-bottom: none; margin-bottom: 0">
        <div class="block"></div>
        <span class="text"> <span class="bold">资料清单</span></span>
      </div>
      <div class="qualification-list">
        <div class="qualification-header">
          <el-upload :on-change="addQualification" action="#" :auto-upload="false" :show-file-list="false">
            <el-button type="primary" size="small">附件上传</el-button>
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
              <el-button type="primary" link @click="previewQualification(scope.row)">预览</el-button>
              <!--  资质名称为 毕业证 或 法律执业资格或律师资格证号 不显示删除按钮  -->
              <el-button
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

      <div class="next-step-container">
        <el-button type="primary" class="next-step-button" @click="handleNextStep">下一步</el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { Plus } from '@element-plus/icons-vue';
import { isIdCard } from '@/utils/validate';
import { legalExpertInfoRegister } from '@/api/register/LegalExpert';
import { uploadImage } from '@/api/register';
import { LegalExpert } from '@/api/register/LegalExpert/types';

const emit = defineEmits(['nextStep']); // 定义事件

// 表单数据
// 可选 字段
const formData = reactive<LegalExpert>({
  // 专家名称
  expertName: '张三',
  // 性别
  sex: '男',
  // 执业机构
  practiceInstitution: '中国法律学会',
  // 执业证号
  practiceCertificateNumber: '123456789012345678',
  // 发证日期
  issueDate: '2025-10-15',
  // 法律执业资格或律师资格证号
  legalPracticeQualification: '123456789012345678',
  // 技术资格证号
  technicalQualification: '123456789012345678',
  // 联系电话
  phoneNumber: '13800000000',
  // 身份证号
  idCard: '44030419900101001X',
  // 专家简介
  professionalSummary: '专家简介简介',
  // 执业证类型
  practiceCertificateType: '法律执业证',
  // 发证机关
  issuingAuthority: '中国法律学会'
} as LegalExpert);

// 上传图片相关
const diplomaUrl = ref('');
const photoUrl = ref('');

const handleDiplomaChange = (file: any) => {
  uploadImage({
    file: file.raw
  }).then((res) => {
    // console.log(res);
    // formData.diplomaOssId = res.ossId;
  });
  //   diplomaUrl.value = URL.createObjectURL(file.raw);
  //   qualificationList.value.push({
  //     index: qualificationList.value.length + 1,
  //     name: '毕业证',
  //     remark: '上传毕业证',
  //     url: diplomaUrl.value
  //   });
};

// 资质清单相关
const qualificationList = ref<
  {
    index: number;
    name: string;
    remark: string;
    url: string;
  }[]
>([]);

const handlePhotoChange = (file: any) => {
  photoUrl.value = URL.createObjectURL(file.raw);
  qualificationList.value.push({
    index: qualificationList.value.length + 1,
    name: '照片',
    remark: '上传照片',
    url: photoUrl.value
  });
};

const addQualification = (file: any) => {
  qualificationList.value.push({
    index: qualificationList.value.length + 1,
    name: file.name,
    remark: '附件上传',
    url: URL.createObjectURL(file.raw)
  });
};

const deleteQualification = (index: number) => {
  //   qualificationList.value.splice(index, 1);
  //   // 重新计算序号
  //   qualificationList.value.forEach((item, i) => {
  //     item.index = i + 1;
  //   });
};
const validateIdCard = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback(new Error('请输入身份证号'));
  } else if (!isIdCard(value)) {
    callback(new Error('请输入正确的身份证号'));
  } else {
    callback();
  }
};
// 表单验证规则
const rules = {
  expertName: [{ required: true, message: '请输入专家姓名', trigger: 'blur' }],
  sex: [{ required: true, message: '请选择性别', trigger: 'change' }],
  birthDate: [{ required: true, message: '请选择出生年月', trigger: 'change' }],
  major: [{ required: true, message: '请输入专业', trigger: 'blur' }],
  graduationDate: [{ required: true, message: '请选择毕业日期', trigger: 'change' }],
  professionalSummary: [{ required: true, message: '请输入专家简介', trigger: 'blur' }],
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
  idCard: [{ trigger: 'blur', validator: validateIdCard }],
  practiceCertificateType: [{ required: true, message: '请选择执业资格类型', trigger: 'change' }]
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
  formRef.value.validate((valid: boolean) => {
    if (valid) {
      console.log('表单验证通过，提交数据', formData);
      const params = { ...formData } as LegalExpert;

      legalExpertInfoRegister(params).then((res) => {
        console.log(res.data);
        // 这里可以添加提交逻辑
        emit('nextStep');
      });
    } else {
      console.log('表单验证失败');
      ElMessage.error('请完善必填信息');
      //   emit('nextStep');
      return false;
    }
  });
};
</script>

<style scoped lang="scss">
.wrapper {
  .title {
    border-bottom: 1px solid #333;
    padding-bottom: 10px;
    display: flex;
    align-items: baseline;
    gap: 5px;
    margin-bottom: 20px;
    .block {
      width: 8px;
      height: 20px;
      background-color: #409eff;
    }
    .text {
      font-weight: 500;
      font-size: 20px;
      color: #333;
      .bold {
        font-weight: 700;
      }
    }
  }
  .expert-form {
    padding: 20px;
  }
  .upload-container {
    width: 100%;

    .upload-box {
      width: 100%;
      --el-fill-color-blank: #f5f7fa;
      .upload-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background-color: #f5f7fa;
        width: 100%;
        border-radius: 6px;
        padding: 20px;
        cursor: pointer;
        .preview-image {
          width: 100%;
          max-height: 200px;
          object-fit: contain;
        }
        .upload-text {
          margin-top: 10px;
          text-align: center;
          .upload-tip {
            font-size: 12px;
            color: #999;
            margin-top: 5px;
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
    .qualification-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      span {
        font-size: 16px;
        font-weight: 600;
      }
    }
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
}
</style>
