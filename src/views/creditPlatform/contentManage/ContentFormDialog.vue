<!--
  标题: ContentFormDialog.vue
  功能: 金融内容新增/编辑弹窗
  说明: 用于新增和编辑金融文章
  当前版本: 1.0
-->
<template>
  <div class="content-form-dialog" v-loading="loading">
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px">
      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="文章标题" prop="articleTitle" required>
            <el-input
              v-model="formData.articleTitle"
              placeholder="请输入文章标题"
              maxlength="50"
              show-word-limit
              clearable
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="文章来源" prop="articleSource" required>
            <div style="display: flex; gap: 8px;">
              <el-input
                v-model="formData.articleSource"
                placeholder="请输入文章来源"
                maxlength="50"
                show-word-limit
                clearable
                style="flex: 1;"
              />
              <el-button type="primary" @click="loadAccountName">读取账号名称</el-button>
            </div>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
         <el-col :span="24">
          <el-form-item label="文章类型" prop="articleType" required>
            <el-radio-group v-model="formData.articleType">
              <el-radio
                v-for="dict in art_article_type"
                :key="dict.value"
                :label="dict.value"
              >
                {{ dict.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="文章简介" prop="articleSummary" required>
        <el-input
          v-model="formData.articleSummary"
          type="textarea"
          :rows="3"
          maxlength="100"
          show-word-limit
          placeholder="请输入文章简介（不超过100字）"
          clearable
        />
      </el-form-item>

      <el-form-item label="文章内容" prop="articleContent" required>
        <Editor v-model="formData.articleContent" :height="400" :minHeight="400" />
      </el-form-item>

      <div class="form-actions">
        <el-button type="primary" @click="handleSubmit" :loading="saving">
          {{ props.type === 'add' ? '保存' : '确认修改' }}
        </el-button>
        <el-button @click="emitCancel">取消</el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance, toRefs, defineAsyncComponent } from 'vue';
import type { ComponentInternalInstance } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { getCreditArticleDetail, addCreditArticle, updateCreditArticle } from '@/api/creditPlatform/contentManage';
import { getInfo } from '@/api/login';

const Editor = defineAsyncComponent(() => import('@/components/Editor/index.vue'));

const props = defineProps<{
  id?: string | number | null;
  type: 'add' | 'edit';
}>();

const emit = defineEmits<{
  (e: 'success'): void;
  (e: 'cancel'): void;
}>();

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { art_article_type } = toRefs<any>(proxy?.useDict('art_article_type'));

const formRef = ref<FormInstance>();
const saving = ref(false);
const loading = ref(false);

const formData = ref<any>({
  id: undefined,
  articleNo: '',
  articleTitle: '',
  articleSource: '',
  articleType: '',
  articleSummary: '',
  articleContent: '',
  articleStatus: '1'
});

const rules = {
  articleTitle: [
    { required: true, message: '请输入文章标题', trigger: 'blur' },
    { min: 1, max: 50, message: '文章标题长度需在1~50个字符内', trigger: 'blur' }
  ],
  articleSource: [
    { required: true, message: '请输入文章来源', trigger: 'blur' },
    { min: 1, max: 50, message: '文章来源长度需在1~50个字符内', trigger: 'blur' }
  ],
  articleType: [{ required: true, message: '请选择文章类型', trigger: 'change' }],
  articleSummary: [
    { required: true, message: '请输入文章简介', trigger: 'blur' },
    { min: 1, max: 100, message: '文章简介长度需在1~100个字符内', trigger: 'blur' }
  ],
  articleContent: [
    {
      required: true,
      validator: (_rule, value, callback) => {
        const content = (value || '').replace(/<p><br><\/p>/g, '').replace(/\s|&nbsp;/g, '').trim();
        if (!content) {
          callback(new Error('请输入文章内容'));
        } else {
          callback();
        }
      },
      trigger: 'change'
    }
  ]
};

const generateArticleNo = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ART${year}${month}${day}${hours}${minutes}${seconds}${random}`;
};

const getCurrentTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const fetchDetail = async () => {
  if (!props.id) return;
  loading.value = true;
  try {
    const response = await getCreditArticleDetail(props.id as string);
    if (response && response.code === 200 && response.data) {
      const data = response.data;
      formData.value = {
        id: data.id,
        articleNo: data.articleNo || '',
        articleTitle: data.articleTitle || '',
        articleSource: data.articleSource || '',
        articleType: data.articleType || '',
        articleSummary: data.articleSummary || '',
        articleContent: data.articleContent || '',
        articleStatus: data.articleStatus || '2'
      };
    } else {
      ElMessage.error(response?.msg || '获取文章详情失败');
    }
  } catch (error) {
    ElMessage.error('获取文章详情失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

const handleSubmit = () => {
  if (!formRef.value) return;
  formRef.value.validate(async (valid) => {
    if (!valid) return;
    saving.value = true;
    try {
      const payload: any = { ...formData.value };
      if (props.type === 'add') {
        payload.articleNo = generateArticleNo();
        payload.articleStatus = '1';
        delete payload.createTime;
        delete payload.publishTime;
      } else {
        payload.updateTime = getCurrentTime();
      }
      const response = props.type === 'edit' ? await updateCreditArticle(payload) : await addCreditArticle(payload);
      if (response && response.code === 200) {
        ElMessage.success(props.type === 'edit' ? '修改成功' : '新增成功');
        emit('success');
      } else {
        ElMessage.error(response?.msg || (props.type === 'edit' ? '修改失败' : '新增失败'));
      }
    } catch (error) {
      ElMessage.error(props.type === 'edit' ? '修改失败，请稍后重试' : '新增失败，请稍后重试');
    } finally {
      saving.value = false;
    }
  });
};

const emitCancel = () => {
  emit('cancel');
};

const loadAccountName = async () => {
  try {
    const response = await getInfo();
    if (response && response.code === 200 && response.data) {
      const user = response.data.user;
      const nickName = user?.nickName || user?.userName || '';
      if (nickName) {
        formData.value.articleSource = nickName;
        ElMessage.success('账号名称读取成功');
      } else {
        ElMessage.warning('未获取到账号名称');
      }
    } else {
      ElMessage.error(response?.msg || '获取账号名称失败');
    }
  } catch (error) {
    ElMessage.error('获取账号名称失败，请稍后重试');
  }
};

onMounted(() => {
  if (props.type === 'edit' && props.id) {
    fetchDetail();
  } else if (props.type === 'add') {
    formData.value.articleStatus = '1';
  }
});
</script>

<style scoped lang="scss">
.content-form-dialog {
  padding: 20px 0;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid #e4e7ed;
  gap: 12px;

  .el-button {
    min-width: 100px;
  }
}
</style>
