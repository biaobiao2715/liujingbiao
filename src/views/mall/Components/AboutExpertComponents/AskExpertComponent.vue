<!--
  标题: AskExpertComponent.vue
  功能: 咨询专家组件
  说明: 咨询专家组件，包含咨询专家的表单
  当前版本: 1.0
  开发信息: Created by 李春雷 2025-10-29
-->
<template>
  <el-dialog title="咨询专家" v-model="dialogVisible" width="50%">
    <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
      <el-form-item label="描述" prop="description">
        <el-input type="textarea" v-model="form.description" placeholder="输入的留言不能少于十个字" :rows="4"></el-input>
      </el-form-item>

      <el-form-item label="图片上传">
        <imageUpload v-model="form.images" />
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

const dialogVisible = ref(false);

const form = ref({
  id: '',
  description: '',
  images: []
});

const rules = {
  description: [
    { required: true, message: '描述不能为空', trigger: 'blur' },
    { min: 10, message: '描述不能少于10个字', trigger: 'blur' }
  ]
};

const fileList = ref([]);

const formRef = ref();

const submitForm = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      console.log('提交表单:', form.value);
    } else {
      console.log('表单验证失败');
    }
  });
};

const resetForm = () => {
  formRef.value?.resetFields();
  fileList.value = [];
};

const openDialog = (expertId: string) => {
  form.value.id = expertId;
  dialogVisible.value = true;
  resetForm();
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
