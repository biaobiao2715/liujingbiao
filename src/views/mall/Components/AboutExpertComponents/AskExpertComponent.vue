<!--
  标题: AskExpertComponent.vue
  功能: 咨询专家组件
  说明: 咨询专家组件，包含咨询专家的表单
  当前版本: 1.0
  开发信息: Created by 李春雷 2025-10-29
-->
<template>
  <el-dialog title="咨询专家" v-model="dialogVisible" width="800">
    <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
      <el-form-item label="描述" prop="questionContent">
        <el-input type="textarea" v-model="form.questionContent" placeholder="输入的留言不能少于十个字" :rows="4"></el-input>
      </el-form-item>

      <el-form-item label="图片上传" prop="questionImage">
        <imageUpload v-model="form.questionImage" @uploadSuccess="handleUploadSuccess" />
        <div slot="tip" class="el-upload__tip">支持jpg、gif、png三种格式，最多上传九张图片，每张图片大小不超过10MB</div>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="submitForm">发送</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ImageUpload from '@/components/ImageUpload/index.vue';
import { addQuestion } from '@/api/mall/expert';

const dialogVisible = ref(false);

const emit = defineEmits(['submitSuccess']);

const form = ref({
  expertId: '',
  questionTitle: '',
  questionContent: '',
  expertType: '',
  questionImage: []
});

const imgList = ref([]);

const rules = {
  questionContent: [
    { required: true, message: '描述不能为空', trigger: 'blur' },
    { min: 10, message: '描述不能少于10个字', trigger: 'blur' }
  ],
  questionImage: [{ message: '请上传图片', trigger: 'change' }]
};

const fileList = ref([]);

const formRef = ref();

const resetForm = () => {
  formRef.value?.resetFields();
  fileList.value = [];
};

const openDialog = (expertId: string, type: string) => {
  form.value.expertId = expertId;
  form.value.expertType = type;
  dialogVisible.value = true;
  resetForm();
};

// 处理上传成功
const handleUploadSuccess = (fileList) => {
  console.log(fileList, form.value.questionImage);
  imgList.value = fileList.map((item) => {
    return {
      name: item.originalName,
      originalName: item.originalName,
      ossId: item.ossId,
      url: item.url,
      ext1: item.ext1,
      fileSuffix: item.fileSuffix
    };
  });
};

const submitForm = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      addQuestion({ ...form.value, questionImage: imgList.value }).then((res) => {
        if (res.code === 200) {
          ElMessage.success('咨询成功');
          dialogVisible.value = false;
          resetForm();
          emit('submitSuccess');
        } else {
          ElMessage.error(res.msg || '咨询失败');
        }
      });
    } else {
      console.log('表单验证失败');
    }
  });
};

defineExpose({
  openDialog
});
</script>

<style scoped lang="scss">
.ask-expert {
}

.upload-demo {
  margin-top: 20px;
}
</style>
