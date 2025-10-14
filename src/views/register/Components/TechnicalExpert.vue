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
      <span class="text"> <span class="bold">专家</span>基础信息</span>
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

          <el-form-item label="专家姓名:" prop="name" required>
            <el-input v-model="formData.name" placeholder="50个字符，仅限中文" />
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

          <el-form-item label="学位:">
            <el-input v-model="formData.degree" placeholder="50个字符，仅限中文" />
          </el-form-item>

          <el-form-item label="专业技术资格名称:" style="white-space: nowrap">
            <el-input v-model="formData.technicalQualification" placeholder="请输入专业技术资格名称" />
          </el-form-item>

          <el-form-item label="身份证号:">
            <el-input v-model="formData.idNumber" placeholder="请输入身份证号" />
          </el-form-item>

          <el-form-item label="专家简介:" prop="introduction" required>
            <el-input
              v-model="formData.introduction"
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

          <el-form-item label="性别:" prop="gender" required>
            <el-select v-model="formData.gender" placeholder="请选择" style="width: 100%">
              <el-option label="男" value="male" />
              <el-option label="女" value="female" />
            </el-select>
          </el-form-item>

          <el-form-item label="毕业院校:" required>
            <el-input v-model="formData.school" placeholder="请输入毕业院校" />
          </el-form-item>

          <el-form-item label="入学日期:" required>
            <el-date-picker v-model="formData.enrollmentDate" type="date" placeholder="选择日期" style="width: 100%" />
          </el-form-item>

          <el-form-item label="学历:" required>
            <el-select v-model="formData.education" placeholder="请选择" style="width: 100%">
              <el-option label="本科" value="bachelor" />
              <el-option label="硕士" value="master" />
              <el-option label="博士" value="doctor" />
              <el-option label="其他" value="other" />
            </el-select>
          </el-form-item>

          <el-form-item label="毕业证编号:" required>
            <el-input v-model="formData.diplomaNumber" placeholder="请输入毕业证编号" />
          </el-form-item>

          <el-form-item label="联系电话:" required>
            <el-input v-model="formData.phone" placeholder="请输入联系电话" />
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
import { ref, reactive, defineEmits } from 'vue';
import { Plus } from '@element-plus/icons-vue';

const emit = defineEmits(['nextStep']); // 定义事件

// 表单数据
const formData = reactive({
  name: '',
  gender: '',
  birthDate: '',
  school: '',
  major: '',
  enrollmentDate: '',
  graduationDate: '',
  education: '',
  degree: '',
  diplomaNumber: '',
  technicalQualification: '',
  phone: '',
  idNumber: '',
  introduction: ''
});

// 上传图片相关
const diplomaUrl = ref('');
const photoUrl = ref('');

const handleDiplomaChange = (file: any) => {
  diplomaUrl.value = URL.createObjectURL(file.raw);
  qualificationList.value.push({
    index: qualificationList.value.length + 1,
    name: '毕业证',
    remark: '上传毕业证',
    url: diplomaUrl.value
  });
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

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请输入专家姓名', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  birthDate: [{ required: true, message: '请选择出生年月', trigger: 'change' }],
  major: [{ required: true, message: '请输入专业', trigger: 'blur' }],
  graduationDate: [{ required: true, message: '请选择毕业日期', trigger: 'change' }],
  introduction: [{ required: true, message: '请输入专家简介', trigger: 'blur' }],
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
  ]
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
      // 这里可以添加提交逻辑
      emit('nextStep');
    } else {
      console.log('表单验证失败');
      ElMessage.error('请完善必填信息');
      emit('nextStep');
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
