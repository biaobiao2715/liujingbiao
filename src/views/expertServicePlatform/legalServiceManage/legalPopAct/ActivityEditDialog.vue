<!--
  标题: ActivityEditDialog.vue
  功能: 普法活动新增/编辑弹窗
  说明: 用于新增和编辑普法活动
  当前版本: 1.0
-->
<template>
  <div class="activity-edit-dialog" v-loading="loading">
    <el-form 
      ref="formRef" 
      :model="formData" 
      :rules="formRules" 
      label-width="140px"
      class="edit-form"
    >
      <!-- 普法活动标题 -->
      <el-form-item label="普法活动标题" prop="activityTitle" required>
        <el-input 
          v-model="formData.activityTitle" 
          placeholder="请输入标题内容" 
          maxlength="30"
          show-word-limit
          clearable
        />
      </el-form-item>
      
      <!-- 普法简介 -->
      <el-form-item label="普法简介" prop="activitySummary" required>
        <el-input
          v-model="formData.activitySummary"
          type="textarea"
          :rows="4"
          placeholder="请输入简介"
          maxlength="60"
          show-word-limit
          resize="vertical"
        />
      </el-form-item>
      
      <!-- 普法活动类型 -->
      <el-form-item label="普法活动类型" prop="activityType" required>
        <el-select v-model="formData.activityType" placeholder="请选择" style="width: 100%" clearable>
          <el-option 
            v-for="item in legal_popularize_activity_type" 
            :key="item.value" 
            :label="item.label" 
            :value="item.value" 
          />
        </el-select>
      </el-form-item>
      
      <!-- 普法活动地址 -->
      <el-form-item label="普法活动地址" prop="activityAddress" required>
        <el-input 
          v-model="formData.activityAddress" 
          placeholder="请输入普法活动地址" 
          maxlength="30"
          show-word-limit
          clearable
        />
      </el-form-item>
      
      <!-- 普法活动时间 -->
      <el-form-item label="普法活动时间" required>
        <div class="time-range">
          <div class="time-item">
            <label class="time-label">开始时间:</label>
            <el-date-picker
              v-model="formData.startTime"
              type="datetime"
              placeholder="选择开始时间"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 200px"
              clearable
            />
          </div>
          <span class="time-separator">-</span>
          <div class="time-item">
            <label class="time-label">结束时间:</label>
            <el-date-picker
              v-model="formData.endTime"
              type="datetime"
              placeholder="选择结束时间"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 200px"
              clearable
            />
          </div>
        </div>
      </el-form-item>
      
      <!-- 普法活动联系人 -->
      <el-form-item label="普法活动联系人" prop="activityContact" required>
        <el-input v-model="formData.activityContact" placeholder="请输入联系人" clearable />
      </el-form-item>
      
      <!-- 联系人电话 -->
      <el-form-item label="联系人电话" prop="activityContactPhone" required>
        <el-input v-model="formData.activityContactPhone" placeholder="请输入联系电话" clearable />
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
import { ref, onMounted, getCurrentInstance, toRefs } from 'vue';
import type { ComponentInternalInstance } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { 
  getActivityDetail, 
  editActivity,
  addActivity
} from '@/api/expertServicePlatform/legalServiceManage/activityManage';

const props = defineProps<{
  id?: string | number | null;
  type: 'add' | 'edit' | 'view';
}>();

const emit = defineEmits<{
  (e: 'success'): void;
  (e: 'cancel'): void;
}>();

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

// 使用字典数据
const { legal_popularize_activity_type } = toRefs<any>(
  (proxy as any)?.useDict('legal_popularize_activity_type')
);

// 表单引用
const formRef = ref();
// 保存状态
const saving = ref(false);
// 加载状态
const loading = ref(false);

// 表单数据
const formData = ref({
  id: undefined as string | undefined,
  activityTitle: '',
  activitySummary: '',
  activityType: '',
  activityAddress: '',
  startTime: '',
  endTime: '',
  activityContact: '',
  activityContactPhone: ''
});

// 表单验证规则
const formRules = {
  activityTitle: [
    { required: true, message: '请输入普法活动标题,最多支持30个汉字', trigger: 'blur' },
    { min: 1, max: 30, message: '标题长度在 1 到 30 个字符', trigger: 'blur' }
  ],
  activitySummary: [
    { required: true, message: '请输入简介,最多支持60个汉字', trigger: 'blur' },
    { min: 1, max: 60, message: '简介长度在 1 到 60 个字符', trigger: 'blur' }
  ],
  activityType: [
    { required: true, message: '请选择普法活动类型', trigger: 'change' }
  ],
  activityAddress: [
    { required: true, message: '请输入普法活动地址,最多支持30个汉字', trigger: 'blur' },
    { min: 1, max: 30, message: '地址长度在 1 到 30 个字符', trigger: 'blur' }
  ],
  startTime: [
    { required: true, message: '请选择开始时间', trigger: 'change' }
  ],
  endTime: [
    { required: true, message: '请选择结束时间', trigger: 'change' }
  ],
  activityContact: [
    { required: true, message: '请输入联系人姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  activityContactPhone: [
    { required: true, message: '请输入联系人手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
};

/** 获取活动详情 */
const fetchActivityDetail = async () => {
  if (!props.id) return;
  
  loading.value = true;
  try {
    const response: any = await getActivityDetail(props.id);
    
    if (response && response.code === 200) {
      const data = response.data;
      
      if (!data) {
        ElMessage.error('获取活动详情失败：数据为空');
        return;
      }
      
      // 将接口返回的数据赋值给表单
      formData.value = {
        id: data.id,
        activityTitle: data.activityTitle || '',
        activitySummary: data.activitySummary || '',
        activityType: data.activityType || '',
        activityAddress: data.activityAddress || '',
        startTime: data.startTime || '',
        endTime: data.endTime || '',
        activityContact: data.activityContact || '',
        activityContactPhone: data.activityContactPhone || ''
      };
    } else {
      ElMessage.error(response?.msg || '获取活动详情失败');
    }
  } catch (error) {
    console.error('获取活动详情失败:', error);
    ElMessage.error('获取活动详情失败，请稍后重试');
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
      ? '确定要发布此普法活动吗？发布后用户将可以看到此活动。'
      : '确定要保存并发布此普法活动吗？';
    
    await ElMessageBox.confirm(confirmMsg, '系统提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    
    saving.value = true;
    
    // 构建提交数据
    const submitData = {
      ...(props.type === 'edit' ? { id: formData.value.id } : {}),
      activityTitle: formData.value.activityTitle,
      activitySummary: formData.value.activitySummary,
      activityType: formData.value.activityType,
      activityAddress: formData.value.activityAddress,
      startTime: formData.value.startTime,
      endTime: formData.value.endTime,
      activityContact: formData.value.activityContact,
      activityContactPhone: formData.value.activityContactPhone
    };
    
    // 调用对应的接口
    const api = props.type === 'add' ? addActivity : editActivity;
    const response: any = await api(submitData);
    
    if (response && response.code === 200) {
      ElMessage.success(props.type === 'add' ? '普法活动发布成功' : '普法活动修改成功');
      emit('success');
    } else {
      ElMessage.error(response?.msg || '操作失败，请稍后重试');
    }
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
    fetchActivityDetail();
  }
});
</script>

<style scoped lang="scss">
.activity-edit-dialog {
  padding: 20px 0;
}

// 编辑表单
.edit-form {
  :deep(.el-form-item__label) {
    font-weight: 500;
    color: #606266;
  }
}

// 时间范围样式
.time-range {
  display: flex;
  align-items: center;
  gap: 16px;
  
  .time-item {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .time-label {
      font-size: 14px;
      color: #606266;
      font-weight: 500;
      white-space: nowrap;
    }
  }
  
  .time-separator {
    color: #606266;
    font-size: 16px;
    font-weight: 500;
    margin: 0 8px;
  }
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
  .time-range {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    
    .time-item {
      justify-content: space-between;
      
      .el-date-editor {
        width: 100% !important;
        max-width: 200px;
      }
    }
    
    .time-separator {
      text-align: center;
      margin: 8px 0;
    }
  }
}
</style>

