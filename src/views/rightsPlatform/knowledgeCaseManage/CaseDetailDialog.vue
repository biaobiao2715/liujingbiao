<!-- 
标题：    CaseDetailDialog.vue
功能：    知识库案件详情/编辑弹窗
说明：    配合知识库案件管理列表使用
当前版本：1.0
开发信息：Created by Cursor AI 2025-11-19
修改人信息：
修改内容：
-->
<template>
  <el-dialog
    :model-value="visible"
    :title="dialogTitle"
    width="720px"
    destroy-on-close
    @close="handleClose"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="110px" v-loading="loading">
      <el-form-item label="案件编号" prop="caseCode">
        <el-input v-model="formData.caseCode" placeholder="请输入案件编号" :disabled="mode === 'view'" />
      </el-form-item>
      <el-form-item label="案件名称" prop="caseTitle">
        <el-input v-model="formData.caseTitle" placeholder="请输入案件名称" :disabled="mode === 'view'" />
      </el-form-item>
      <el-form-item label="知识分类" prop="knowledgeCategory">
        <el-select
          v-model="formData.knowledgeCategory"
          placeholder="请选择分类"
          clearable
          filterable
          :disabled="mode === 'view'"
        >
          <el-option
            v-for="item in knowledge_category"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="案件状态" prop="status">
        <el-select
          v-model="formData.status"
          placeholder="请选择状态"
          clearable
          filterable
          :disabled="mode === 'view'"
        >
          <el-option
            v-for="item in knowledge_case_status"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="责任人" prop="ownerName">
        <el-input v-model="formData.ownerName" placeholder="请输入责任人" :disabled="mode === 'view'" />
      </el-form-item>
      <el-form-item label="案件描述" prop="caseDesc">
        <el-input
          type="textarea"
          v-model="formData.caseDesc"
          placeholder="请输入案件描述"
          :rows="4"
          :disabled="mode === 'view'"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" v-if="mode !== 'view'" :loading="saving" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed, getCurrentInstance, toRefs } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import type { ComponentInternalInstance, ComponentPublicInstance } from 'vue';
import { ElMessage } from 'element-plus';

const props = defineProps<{
  visible: boolean;
  mode: 'view' | 'edit' | 'add';
  detail?: Record<string, any>;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'confirm'): void;
}>();

const formRef = ref<FormInstance>();
const loading = ref(false);
const saving = ref(false);

const formData = ref({
  caseCode: '',
  caseTitle: '',
  knowledgeCategory: '',
  status: '',
  ownerName: '',
  caseDesc: ''
});

const rules: FormRules = {
  caseCode: [{ required: true, message: '请输入案件编号', trigger: 'blur' }],
  caseTitle: [{ required: true, message: '请输入案件名称', trigger: 'blur' }],
  knowledgeCategory: [{ required: true, message: '请选择知识分类', trigger: 'change' }],
  status: [{ required: true, message: '请选择案件状态', trigger: 'change' }]
};

const internalInstance = getCurrentInstance() as ComponentInternalInstance & {
  proxy: ComponentPublicInstance & {
    useDict?: (...args: string[]) => Record<string, any>;
  };
};
const dictSource =
  internalInstance?.proxy?.useDict?.('knowledge_case_status', 'knowledge_category') ?? {};
const { knowledge_case_status, knowledge_category } = toRefs<any>(dictSource);

const dialogTitle = computed(() => {
  if (props.mode === 'add') return '新增案件';
  if (props.mode === 'edit') return '编辑案件';
  return '查看案件';
});

watch(
  () => props.visible,
  (val) => {
    if (val) {
      formData.value = {
        caseCode: props.detail?.caseCode || '',
        caseTitle: props.detail?.caseTitle || '',
        knowledgeCategory: props.detail?.knowledgeCategory || '',
        status: props.detail?.status || '',
        ownerName: props.detail?.ownerName || '',
        caseDesc: props.detail?.caseDesc || ''
      };
    } else {
      formRef.value?.resetFields();
    }
  }
);

const handleClose = () => {
  emit('close');
};

const handleSubmit = () => {
  if (!formRef.value) return;
  formRef.value.validate(async (valid) => {
    if (!valid) return;
    saving.value = true;
    try {
      // TODO: 提交表单
      ElMessage.success(props.mode === 'add' ? '新增成功' : '编辑成功');
      emit('confirm');
      handleClose();
    } finally {
      saving.value = false;
    }
  });
};
</script>

