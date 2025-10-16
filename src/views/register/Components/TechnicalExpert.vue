<!-- 
标题: TecnnicalExpert.vue
功能: 技术专家注册
说明: 
开发信息: Create by 李刘超 2025-10-13 14:21:42
当前版本: 1.0
-->

<template>
  <div class="wrapper">
    <div class="title">
      <div class="block"></div>
      <span class="text">基础信息</span>
    </div>

    <el-form :model="formData" :rules="rules" ref="formRef" label-width="120px" class="expert-form">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="毕业证书:" prop="diploma" required>
            <div class="upload-container">
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

          <el-form-item label="出生年月:" prop="birthDate" required>
            <el-date-picker v-model="formData.birthDate" type="date" placeholder="选择日期" style="width: 100%" />
          </el-form-item>

          <el-form-item label="专业:" prop="major" required>
            <el-input v-model="formData.major" placeholder="50个字符，仅限中文" />
          </el-form-item>

          <el-form-item label="毕业日期:" prop="graduationDate" required>
            <el-date-picker v-model="formData.graduationDate" type="date" placeholder="选择日期" style="width: 100%" />
          </el-form-item>

          <el-form-item label="学位:" prop="degree" required>
            <!-- <el-input v-model="formData.degree" placeholder="50个字符，仅限中文" /> -->
            <el-select v-model="formData.degree" placeholder="请选择" style="width: 100%">
              <el-option label="学士" value="学士" />
              <el-option label="硕士" value="硕士" />
              <el-option label="博士" value="博士" />
              <el-option label="其他" value="其他" />
            </el-select>
          </el-form-item>

          <el-form-item label="专业技术资格名称:" prop="technicalQualification" required style="white-space: nowrap">
            <el-input v-model="formData.technicalQualification" placeholder="请输入专业技术资格名称" />
          </el-form-item>

          <el-form-item label="身份证号:" prop="idCard">
            <el-input v-model="formData.idCard" placeholder="请输入身份证号" />
          </el-form-item>

          <el-form-item label="专家简介:" prop="expertInfo" required>
            <el-input
              v-model="formData.expertInfo"
              type="textarea"
              :maxlength="300"
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
                <div class="upload-content" style="padding: 20px">
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
              <el-option label="男" value="0" />
              <el-option label="女" value="1" />
            </el-select>
          </el-form-item>

          <el-form-item label="毕业院校:" prop="graduationSchool" required>
            <el-input v-model="formData.graduationSchool" placeholder="请输入毕业院校" />
          </el-form-item>

          <el-form-item label="入学日期:" prop="enrollmentDate" required>
            <el-date-picker v-model="formData.enrollmentDate" type="date" placeholder="选择日期" style="width: 100%" />
          </el-form-item>

          <el-form-item label="学历:" prop="education" required>
            <el-select v-model="formData.education" placeholder="请选择" style="width: 100%">
              <el-option label="本科" value="本科" />
              <el-option label="硕士" value="硕士" />
              <el-option label="博士" value="博士" />
              <el-option label="其他" value="其他" />
            </el-select>
          </el-form-item>

          <el-form-item label="毕业证编号:" required prop="graduationCertNo">
            <el-input v-model="formData.graduationCertNo" placeholder="请输入毕业证编号" />
          </el-form-item>

          <el-form-item label="联系电话:" prop="contactPhone" required>
            <el-input v-model="formData.contactPhone" placeholder="请输入联系电话" />
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
              <!--  资质名称为 毕业证 不显示删除按钮  -->
              <el-button type="primary" v-if="scope.row.name !== '毕业证'" link @click="deleteQualification(scope.$index)">删除</el-button>
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
import { TechnicalExpert } from '@/api/register/TechnicalExpert/types';
import { uploadImage } from '@/api/register';
import { FileType } from '@/api/register/types';
import { technicalExpertInfoRegister } from '@/api/register/TechnicalExpert';
import { useRegisterDataStore } from '@/store/modules/registerData';

const emit = defineEmits(['nextStep']); // 定义事件
const { setRegisterData } = useRegisterDataStore();

// 表单数据
const formData = reactive<TechnicalExpert>({
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
  contactPhone: ''
} as TechnicalExpert);

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
// 上传毕业证
const handleDiplomaChange = (file: any) => {
  uploadImage({ file: file.raw }).then((res) => {
    if (res.code === 200 && res.data?.ossId) {
      diplomaUrl.value = res.data.ossId;
      qualificationList.value.push({
        index: qualificationList.value.length + 1,
        name: '毕业证',
        remark: res?.data?.fileName || '上传毕业证',
        url: res.data.url,
        fileType: '2',
        ossId: res.data.ossId
      });
    }
  });
};
// 上传照片
const handlePhotoChange = (file: any) => {
  const tempUrl = URL.createObjectURL(file.raw);
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
const validateIdCard = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback();
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
  expertInfo: [{ required: true, message: '请输入专家简介', trigger: 'blur' }],
  degree: [{ required: true, message: '请选择学位', trigger: 'change' }],
  graduationCertNo: [{ required: true, message: '请输入毕业证书编号', trigger: 'blur' }],
  technicalQualification: [{ required: true, message: '请输入专业技术资格名称', trigger: 'blur' }],
  contactPhone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
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
  enrollmentDate: [{ required: true, message: '请选择入学日期', trigger: 'change' }],
  education: [{ required: true, message: '请选择学历', trigger: 'change' }],
  graduationSchool: [{ required: true, message: '请输入毕业学校', trigger: 'blur' }]
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
      const temp = { ...formData };
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
      // 这里可以添加提交逻辑
    } else {
      ElMessage.error('请完善必填信息');
      return false;
    }
  });
};
</script>

<style scoped lang="scss">
.wrapper {
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
        width: 100%;
        border-radius: 6px;
        background-color: #f5f7fa;
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
