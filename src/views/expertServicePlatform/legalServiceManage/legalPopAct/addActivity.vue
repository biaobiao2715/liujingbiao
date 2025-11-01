<!--
  标题: addActivity.vue
  功能: 普法活动新增
  说明: 用于新增普法活动的详细信息
  当前版本: 1.0
  开发信息: Created by AI Assistant
-->
<template>
  <div class="add-activity">
    <!-- 主要内容区域 - 大盒子 -->
    <div class="main-content-box">
      <!-- 页面标题 -->
      <div class="page-header">
        <h2 class="page-title">新增普法活动</h2>
      </div>

      <!-- 新增表单 -->
      <el-form 
        ref="formRef" 
        :model="formData" 
        :rules="formRules" 
        label-width="140px"
        class="add-form"
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
            <el-option label="请选择" value="请选择" />
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
          <el-button type="primary" @click="handlePublish" :loading="saving">发布</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance, toRefs } from 'vue';
import type { ComponentInternalInstance } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';
import { addActivity } from '@/api/expertServicePlatform/legalServiceManage/activityManage';

const router = useRouter();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

// 使用字典数据
const { legal_popularize_activity_type } = toRefs<any>(
  (proxy as any)?.useDict('legal_popularize_activity_type')
);

// 表单引用
const formRef = ref();
// 保存状态
const saving = ref(false);

// 表单数据
const formData = ref({
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

/** 发布活动 */
const handlePublish = async () => {
  // 表单验证
  if (!formRef.value) return;
  
  try {
    const valid = await formRef.value.validate();
    if (!valid) return;
    
    await ElMessageBox.confirm(
      '确定要发布此普法活动吗？发布后用户将可以看到此活动。',
      '系统提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    
    saving.value = true;
    
    // 构建提交数据 - 字段对应关系
    const submitData = {
      activityTitle: formData.value.activityTitle,            // 活动标题
      activitySummary: formData.value.activitySummary,        // 活动简介
      activityType: formData.value.activityType,              // 活动类型
      activityAddress: formData.value.activityAddress,        // 活动地址
      startTime: formData.value.startTime,                    // 开始时间
      endTime: formData.value.endTime,                        // 结束时间
      activityContact: formData.value.activityContact,        // 联系人
      activityContactPhone: formData.value.activityContactPhone // 联系方式
    };
    
    console.log('提交数据:', submitData);
    
    // 调用新增接口 - 响应拦截器已处理，response 直接是后端返回数据
    const response: any = await addActivity(submitData);
    
    if (response && response.code === 200) {
      ElMessage.success('普法活动发布成功');
      // 返回列表页面
      router.push('/expertServicePlatform/legalServiceManage/activityManage');
    } else {
      ElMessage.error(response?.msg || '发布失败，请稍后重试');
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('发布失败:', error);
      ElMessage.error('发布失败，请稍后重试');
    }
  } finally {
    saving.value = false;
  }
};

// 页面加载时的初始化（可选）
// onMounted(() => {
//   // 如需设置默认时间，可取消注释
//   // const now = new Date();
//   // const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
//   // formData.value.startTime = now.toISOString().slice(0, 19).replace('T', ' ');
//   // formData.value.endTime = tomorrow.toISOString().slice(0, 19).replace('T', ' ');
// });
</script>

<style scoped lang="scss">
.add-activity {
  padding: 24px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

// 主要内容区域 - 大盒子
.main-content-box {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 24px;
  margin-bottom: 24px;
}

// 页面标题区域
.page-header {
  margin-bottom: 32px;
  
  .page-title {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
    color: #606266;
  }
}

// 新增表单
.add-form {
  // 表单项样式
  .el-form-item {
    margin-bottom: 24px;
    
    :deep(.el-form-item__label) {
      font-weight: 500;
      color: #606266;
      font-size: 14px;
    }
    
    :deep(.el-form-item__content) {
      .el-input__wrapper {
        border-radius: 4px;
        border: 1px solid #dcdfe6;
        
        &:hover {
          border-color: #c0c4cc;
        }
        
        &.is-focus {
          border-color: #409eff;
          box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
        }
      }
      
      .el-textarea__inner {
        border-radius: 4px;
        border: 1px solid #dcdfe6;
        resize: vertical;
        
        &:hover {
          border-color: #c0c4cc;
        }
        
        &:focus {
          border-color: #409eff;
          box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
        }
      }
      
      .el-select {
        width: 100%;
        
        .el-input__wrapper {
          &:hover {
            border-color: #c0c4cc;
          }
          
          &.is-focus {
            border-color: #409eff;
            box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
          }
        }
      }
      
      .el-date-editor {
        .el-input__wrapper {
          &:hover {
            border-color: #c0c4cc;
          }
          
          &.is-focus {
            border-color: #409eff;
            box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
          }
        }
      }
    }
    
    // 必填项标识
    &.is-required {
      :deep(.el-form-item__label) {
        &::before {
          content: '*';
          color: #f56c6c;
          margin-right: 4px;
        }
      }
    }
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
  
  .el-button {
    min-width: 120px;
    height: 40px;
    border-radius: 4px;
    font-weight: 500;
    font-size: 14px;
    
    &.el-button--primary {
      background-color: #409eff;
      border-color: #409eff;
      
      &:hover {
        background-color: #66b1ff;
        border-color: #66b1ff;
      }
      
      &:active {
        background-color: #3a8ee6;
        border-color: #3a8ee6;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .add-activity {
    padding: 16px;
  }
  
  .main-content-box {
    padding: 16px;
  }
  
  .page-header {
    .page-title {
      font-size: 20px;
    }
  }
  
  .time-range {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    
    .time-item {
      justify-content: space-between;
      
      .time-label {
        flex-shrink: 0;
      }
      
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
  
  .form-actions {
    .el-button {
      width: 100%;
    }
  }
}

// 字符计数样式
:deep(.el-input__count) {
  color: #909399;
  font-size: 12px;
}

// 错误信息样式
:deep(.el-form-item__error) {
  color: #f56c6c;
  font-size: 12px;
  line-height: 1;
  padding-top: 4px;
}

// 下拉箭头样式
:deep(.el-select .el-input__suffix) {
  .el-input__suffix-inner {
    .el-icon {
      color: #c0c4cc;
    }
  }
}

// 日期选择器图标样式
:deep(.el-date-editor .el-input__suffix) {
  .el-input__suffix-inner {
    .el-icon {
      color: #c0c4cc;
    }
  }
}
</style>
