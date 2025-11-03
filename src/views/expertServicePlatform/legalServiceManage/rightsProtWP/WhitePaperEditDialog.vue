<!--
  标题: WhitePaperEditDialog.vue
  功能: 维权白皮书新增/编辑弹窗
  说明: 用于新增和编辑维权白皮书
  当前版本: 1.0
-->
<template>
  <div class="whitepaper-edit-dialog" v-loading="loading">
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="140px">
      <!-- 白皮书标题 -->
      <el-form-item label="白皮书标题" prop="title" required>
        <el-input 
          v-model="formData.title" 
          placeholder="请输入标题内容" 
          maxlength="30"
          show-word-limit
          clearable
        />
      </el-form-item>

      <!-- 发布状态 -->
      <el-form-item label="发布状态" prop="status" required>
        <el-select v-model="formData.status" placeholder="请选择" style="width: 100%" clearable>
          <el-option label="启用" value="启用" />
          <el-option label="禁用" value="禁用" />
        </el-select>
      </el-form-item>

      <!-- 版本号 -->
      <el-form-item label="版本号" prop="version" required>
        <el-input 
          v-model="formData.version" 
          placeholder="请输入版本号，如：V1.0" 
          clearable
        />
      </el-form-item>

      <!-- 简介 -->
      <el-form-item label="简介" prop="summary">
        <el-input 
          v-model="formData.summary" 
          type="textarea" 
          :rows="3" 
          placeholder="请输入简介"
          maxlength="200"
          show-word-limit
          clearable
        />
      </el-form-item>

      <!-- 正文内容 -->
      <el-form-item label="正文内容" prop="content" required>
        <Editor v-model="formData.content" :height="400" :minHeight="400" />
      </el-form-item>

      <!-- 表单操作按钮 -->
      <div class="form-actions">
        <el-button type="primary" @click="handleSubmit" :loading="saving">
          {{ props.type === 'add' ? '发布' : '保存' }}
        </el-button>
        <el-button @click="emitCancel">取消</el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
// import { 
//   getWhitePaperDetail, 
//   addWhitePaper,
//   editWhitePaper
// } from '@/api/expertServicePlatform/legalServiceManage/whitePaperManage';

const props = defineProps<{
  id?: string | number | null;
  type: 'add' | 'edit' | 'view';
}>();

const emit = defineEmits<{
  (e: 'success'): void;
  (e: 'cancel'): void;
}>();

// 表单引用
const formRef = ref();
// 保存状态
const saving = ref(false);
// 加载状态
const loading = ref(false);

// 表单数据
const formData = ref({
  id: undefined as number | string | undefined,
  title: '',
  status: '',
  version: '',
  summary: '',
  content: ''
});

// 表单验证规则
const rules = {
  title: [
    { required: true, message: '请输入白皮书标题', trigger: 'blur' },
    { min: 2, max: 30, message: '标题长度在 2 到 30 个字符', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择发布状态', trigger: 'change' }
  ],
  version: [
    { required: true, message: '请输入版本号', trigger: 'blur' },
    { pattern: /^V\d+\.\d+(\.\d+)?$/, message: '版本号格式不正确，如：V1.0', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入正文内容', trigger: 'blur' },
    { min: 10, message: '内容至少 10 个字符', trigger: 'blur' }
  ]
};

/** 获取白皮书详情 */
const fetchWhitePaperDetail = async () => {
  if (!props.id) return;
  
  loading.value = true;
  try {
    // TODO: 替换为真实API调用
    // const response: any = await getWhitePaperDetail(props.id);
    
    // 模拟数据
    await new Promise(resolve => setTimeout(resolve, 500));
    const mockData = {
      id: props.id,
      title: '2025年XXX通告',
      status: '启用',
      version: 'V1.0',
      summary: '这是一份维权白皮书的简介',
      content: '这是维权白皮书的详细内容...'
    };
    
    formData.value = {
      id: mockData.id,
      title: mockData.title || '',
      status: mockData.status || '',
      version: mockData.version || '',
      summary: mockData.summary || '',
      content: mockData.content || ''
    };
    
    ElMessage.success('获取详情成功');
  } catch (error) {
    console.error('获取白皮书详情失败:', error);
    ElMessage.error('获取白皮书详情失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

/** 提交表单 */
const handleSubmit = async () => {
  if (!formRef.value) return;
  
  try {
    const valid = await formRef.value.validate();
    if (!valid) return;
    
    const confirmMsg = props.type === 'add' 
      ? '确定要发布此维权白皮书吗？发布后用户将可以查看此内容。'
      : '确定要保存并发布此维权白皮书吗？';
    
    await ElMessageBox.confirm(confirmMsg, '系统提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    
    saving.value = true;
    
    // 构建提交数据
    const submitData = {
      ...(props.type === 'edit' ? { id: formData.value.id } : {}),
      title: formData.value.title,
      status: formData.value.status,
      version: formData.value.version,
      summary: formData.value.summary,
      content: formData.value.content
    };
    
    // TODO: 调用对应的接口
    // const api = props.type === 'add' ? addWhitePaper : editWhitePaper;
    // const response: any = await api(submitData);
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('提交数据:', submitData);
    
    ElMessage.success(props.type === 'add' ? '维权白皮书发布成功' : '维权白皮书修改成功');
    emit('success');
  } catch (error) {
    if (error !== 'cancel') {
      console.error('操作失败:', error);
      ElMessage.error('操作失败，请稍后重试');
    }
  } finally {
    saving.value = false;
  }
};

/** 取消 */
const emitCancel = () => {
  emit('cancel');
};

// 页面加载时的处理
onMounted(() => {
  if (props.type === 'edit' && props.id) {
    fetchWhitePaperDetail();
  }
});
</script>

<style scoped lang="scss">
.whitepaper-edit-dialog {
  padding: 20px 0;
}

// 表单操作按钮
.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid #e4e7ed;
  gap: 12px;
  
  .el-button {
    min-width: 100px;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .form-actions {
    .el-button {
      width: 100%;
    }
  }
}
</style>

