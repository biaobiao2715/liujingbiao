<!--
  标题: ActivityEditDialog.vue
  功能: 普法活动新增/编辑弹窗
  说明: 用于新增和编辑普法活动
  当前版本: 1.0
-->
<template>
  <div class="activity-edit-dialog" v-loading="loading">
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="140px" class="edit-form">
      <el-form-item label="普法活动标题" prop="activityTitle" required>
        <el-input v-model="formData.activityTitle" placeholder="请输入标题内容" maxlength="30" show-word-limit clearable />
      </el-form-item>
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
      <el-form-item label="普法活动类型" prop="activityType" required>
        <el-select v-model="formData.activityType" placeholder="请选择" style="width: 100%" clearable>
          <el-option v-for="item in legal_popularize_activity_type" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="普法活动地址" prop="activityAddress" required>
        <el-input v-model="formData.activityAddress" placeholder="请输入普法活动地址" maxlength="30" show-word-limit clearable />
      </el-form-item>
      <el-form-item label="普法活动时间" required>
        <div class="time-range">
          <div class="time-item">
            <label class="time-label">开始时间:</label>
            <el-form-item prop="startTime" style="margin-bottom: 0">
              <el-date-picker
                v-model="formData.startTime"
                type="datetime"
                placeholder="选择开始时间"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 200px"
                clearable
                :disabled-date="disabledStartDate"
                :disabled-time="disabledStartTime"
                @change="handleStartTimeChange"
              />
            </el-form-item>
          </div>
          <span class="time-separator">-</span>
          <div class="time-item">
            <label class="time-label">结束时间:</label>
            <el-form-item prop="endTime" style="margin-bottom: 0">
              <el-date-picker
                v-model="formData.endTime"
                type="datetime"
                placeholder="选择结束时间"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 200px"
                clearable
                :disabled-date="disabledEndDate"
                @change="handleEndTimeChange"
              />
            </el-form-item>
          </div>
        </div>
      </el-form-item>
      <el-form-item label="普法活动联系人" prop="activityContact" required>
        <el-input v-model="formData.activityContact" placeholder="请输入联系人" maxlength="20" show-word-limit clearable />
      </el-form-item>
      <el-form-item label="联系人电话" prop="activityContactPhone" required>
        <el-input v-model="formData.activityContactPhone" placeholder="请输入联系电话" clearable />
      </el-form-item>

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
import { ref, onMounted, getCurrentInstance, toRefs, computed } from 'vue';
import type { ComponentInternalInstance } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getActivityDetail, editActivity, addActivity } from '@/api/expertServicePlatform/legalServiceManage/activityManage';

const props = defineProps<{
  id?: string | number | null;
  type: 'add' | 'edit' | 'view';
}>();

const emit = defineEmits<{
  (e: 'success'): void;
  (e: 'cancel'): void;
}>();

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const { legal_popularize_activity_type } = toRefs<any>((proxy as any)?.useDict('legal_popularize_activity_type'));

const formRef = ref();
const saving = ref(false);
const loading = ref(false);

const formData = ref({
  id: undefined as string | number | undefined,
  activityTitle: '',
  activitySummary: '',
  activityType: '',
  activityAddress: '',
  startTime: '',
  endTime: '',
  activityContact: '',
  activityContactPhone: '',
  activityStatus: '1'
});

const formRules = {
  activityTitle: [
    { required: true, message: '请输入普法活动标题,最多支持30个汉字', trigger: 'blur' },
    { min: 1, max: 30, message: '标题长度在 1 到 30 个字符', trigger: 'blur' }
  ],
  activitySummary: [
    { required: true, message: '请输入简介,最多支持60个汉字', trigger: 'blur' },
    { min: 1, max: 60, message: '简介长度在 1 到 60 个字符', trigger: 'blur' }
  ],
  activityType: [{ required: true, message: '请选择普法活动类型', trigger: 'change' }],
  activityAddress: [
    { required: true, message: '请输入普法活动地址,最多支持30个汉字', trigger: 'blur' },
    { min: 1, max: 30, message: '地址长度在 1 到 30 个字符', trigger: 'blur' }
  ],
  startTime: [
    { required: true, message: '请选择开始时间', trigger: 'change' },
    {
      validator: (_rule: any, value: any, callback: any) => {
        if (!value) {
          callback(new Error('请选择开始时间'));
          return;
        }
        if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)) {
          callback(new Error('时间格式不正确，请使用 YYYY-MM-DD HH:mm:ss 格式'));
          return;
        }
        // 检查开始时间不能早于当前时间
        const startDate = new Date(value);
        const now = new Date();
        if (startDate < now) {
          callback(new Error('开始时间不能早于当前时间'));
          return;
        }
        if (formData.value.endTime) {
          const endDate = new Date(formData.value.endTime);
          if (startDate >= endDate) {
            callback(new Error('开始时间必须早于结束时间'));
            return;
          }
        }
        callback();
      },
      trigger: ['change', 'blur']
    }
  ],
  endTime: [
    { required: true, message: '请选择结束时间', trigger: 'change' },
    {
      validator: (_rule: any, value: any, callback: any) => {
        if (!value) {
          callback(new Error('请选择结束时间'));
          return;
        }
        if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)) {
          callback(new Error('时间格式不正确，请使用 YYYY-MM-DD HH:mm:ss 格式'));
          return;
        }
        const endDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endDateOnly = new Date(endDate);
        endDateOnly.setHours(0, 0, 0, 0);
        // 结束时间不得早于今天
        if (endDateOnly < today) {
          callback(new Error('结束时间不得早于今天'));
          return;
        }
        if (formData.value.startTime) {
          const startDate = new Date(formData.value.startTime);
          if (endDate <= startDate) {
            callback(new Error('结束时间必须晚于开始时间'));
            return;
          }
        }
        callback();
      },
      trigger: ['change', 'blur']
    }
  ],
  activityContact: [
    { required: true, message: '请输入联系人姓名,最多支持20个汉字', trigger: 'blur' },
    { min: 1, max: 20, message: '联系人长度在 1 到 20 个字符', trigger: 'blur' }
  ],
  activityContactPhone: [
    { required: true, message: '请输入联系人手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
};

const fetchActivityDetail = async () => {
  if (!props.id) {
    ElMessage.error('活动ID不存在');
    return;
  }
  loading.value = true;
  try {
    const response: any = await getActivityDetail(props.id);
    if (response && response.code === 200) {
      const data = response.data;
      if (!data) {
        ElMessage.error('获取活动详情失败：数据为空');
        return;
      }
      formData.value = {
        id: data.id,
        activityTitle: data.activityTitle || '',
        activitySummary: data.activitySummary || '',
        activityType: data.activityType || '',
        activityAddress: data.activityAddress || '',
        startTime: data.startTime || '',
        endTime: data.endTime || '',
        activityContact: data.activityContact || '',
        activityContactPhone: data.activityContactPhone || '',
        activityStatus: data.activityStatus || '1'
      };
    } else {
      ElMessage.error(response?.msg || '获取活动详情失败');
    }
  } catch (error) {
    ElMessage.error('获取活动详情失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

const formatCurrentTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  try {
    const valid = await formRef.value.validate();
    if (!valid) return;
    const confirmMsg = props.type === 'add' ? '确定要发布此普法活动吗？发布后用户将可以看到此活动。' : '确定要保存并发布此普法活动吗？';
    await ElMessageBox.confirm(confirmMsg, '系统提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    saving.value = true;
    const currentTime = formatCurrentTime();
    const submitData: any = {
      ...(props.type === 'edit' && formData.value.id ? { id: formData.value.id } : {}),
      activityTitle: formData.value.activityTitle?.trim(),
      activityType: formData.value.activityType,
      activitySummary: formData.value.activitySummary?.trim(),
      activityAddress: formData.value.activityAddress?.trim(),
      activityContact: formData.value.activityContact?.trim(),
      activityContactPhone: formData.value.activityContactPhone?.trim(),
      startTime: formData.value.startTime,
      endTime: formData.value.endTime,
      activityStatus: formData.value.activityStatus,
      publishTimeStart: currentTime,
      publishTimeEnd: currentTime
    };
    if (props.type === 'edit' && !submitData.id) {
      ElMessage.error('编辑活动时缺少活动ID');
      saving.value = false;
      return;
    }
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
      ElMessage.error('操作失败，请稍后重试');
    }
  } finally {
    saving.value = false;
  }
};

const emitCancel = () => {
  emit('cancel');
};

// 禁用今天之前的日期（用于结束时间选择器）
const disabledEndDate = (time: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const timeOnly = new Date(time);
  timeOnly.setHours(0, 0, 0, 0);
  return timeOnly < today;
};

// 禁用早于当前时间的日期（用于开始时间选择器）
const disabledStartDate = (time: Date) => {
  const now = new Date();
  const timeOnly = new Date(time);
  timeOnly.setHours(0, 0, 0, 0);
  const nowOnly = new Date(now);
  nowOnly.setHours(0, 0, 0, 0);
  return timeOnly < nowOnly;
};

// 禁用早于当前时间的时间（用于开始时间选择器）
const disabledStartTime = (time: Date) => {
  const now = new Date();
  const selectedDate = new Date(time);
  // 如果选择的日期是今天，则禁用早于当前时间的时间点
  if (selectedDate.getFullYear() === now.getFullYear() && selectedDate.getMonth() === now.getMonth() && selectedDate.getDate() === now.getDate()) {
    return {
      disabledHours: () => {
        const hours = [];
        for (let i = 0; i < now.getHours(); i++) {
          hours.push(i);
        }
        return hours;
      },
      disabledMinutes: (selectedHour: number) => {
        if (selectedHour === now.getHours()) {
          const minutes = [];
          for (let i = 0; i <= now.getMinutes(); i++) {
            minutes.push(i);
          }
          return minutes;
        }
        return [];
      },
      disabledSeconds: (selectedHour: number, selectedMinute: number) => {
        if (selectedHour === now.getHours() && selectedMinute === now.getMinutes()) {
          const seconds = [];
          for (let i = 0; i <= now.getSeconds(); i++) {
            seconds.push(i);
          }
          return seconds;
        }
        return [];
      }
    };
  }
  return {};
};

const handleStartTimeChange = () => {
  if (formData.value.endTime && formRef.value) {
    formRef.value.validateField('endTime');
  }
};

const handleEndTimeChange = () => {
  if (formData.value.startTime && formRef.value) {
    formRef.value.validateField('startTime');
  }
};

onMounted(async () => {
  formRef.value?.resetFields?.();
  if ((props.type === 'edit' || props.type === 'view') && props.id) {
    await fetchActivityDetail();
  } else if (props.type === 'add') {
    formData.value.activityStatus = '1';
  }
});
</script>

<style scoped lang="scss">
.activity-edit-dialog {
  padding: 20px 0;
}

.edit-form {
  :deep(.el-form-item__label) {
    font-weight: 500;
    color: #606266;
  }
}

.time-range {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  .time-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    .time-label {
      font-size: 14px;
      color: #606266;
      font-weight: 500;
      white-space: nowrap;
      line-height: 32px;
    }
    .el-form-item {
      margin-bottom: 0 !important;
    }
  }
  .time-separator {
    color: #606266;
    font-size: 16px;
    font-weight: 500;
    margin: 0 8px;
    line-height: 32px;
  }
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
