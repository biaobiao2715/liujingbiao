<template>
  <!--
    标题：			Supplier.vue
    功能：			企业注册-填写信息
    说明:
    当前版本：	1.0
    开发信息：	Created by 刘景彪  
 -->
  <div class="app-container">
    <el-form ref="dataFormRef" :model="form" :rules="rules" label-width="150px">
      <div class="section-title">
        <span class="title-text">基础信息</span>
      </div>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="营业执照：">
            <div class="upload-container">
              <el-upload
                class="upload-box"
                ref="uploadRef"
                :limit="1"
                accept=".xlsx, .xls"
                :headers="upload.headers"
                :disabled="upload.isUploading"
                :on-change="handleDiplomaChange"
                :on-progress="handleFileUploadProgress"
                :on-success="handleFileSuccess"
                :auto-upload="false"
              >
                <div class="upload-content">
                  <el-icon><Plus /></el-icon>
                  <!-- <img v-else :src="diplomaUrl" class="preview-image" /> -->
                  <div class="upload-text">
                    <div>点击或将文件拖拽到这里上传</div>
                    <div class="upload-tip">单个文件最大10M 支持扩展名：jpg.jpeg.gif.png.pdf</div>
                  </div>
                </div>
              </el-upload>
            </div>
          </el-form-item>
        </el-col>

        <el-col :span="12"> </el-col>

        <el-col :span="12">
          <el-form-item label="企业名称：">
            <el-input v-model="form.dictLabel" />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="注册资本：">
            <el-input v-model="form.dictLabel" />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="统一社会信用代码：">
            <el-input v-model="form.dictLabel" />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="注册地址：">
            <el-input v-model="form.dictLabel" />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="注册日期：" prop="dictLabel">
            <el-date-picker v-model="form.dictLabel" value-format="YYYY-MM-DD" type="date" style="width: 100%"></el-date-picker>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="经营范围：">
            <el-input v-model="form.cssClass" />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="法定代表人：" prop="dictValue">
            <el-input v-model="form.dictValue" placeholder="请选择注册日期" />
          </el-form-item>
        </el-col>
        <el-col :span="12"> </el-col>

        <el-col :span="12">
          <el-form-item label="办公地址：" prop="cssClass">
            <el-input v-model="form.cssClass" placeholder="请输入法定代表人" />
          </el-form-item>
        </el-col>
      </el-row>

      <div class="section-title">
        <span class="title-text">企业联系人</span>
      </div>
      <el-row :gutter="20">
        <el-table :data="tableList" border>
          <el-table-column type="index" width="100" label="序号" />

          <el-table-column prop="attrNameOne" label="联系人类型">
            <template #default="scope">
              <el-select v-model="scope.row.attrNameOne" placeholder="请选择" filterable clearable>
                <el-option v-for="(item, index) in secondCategoryOptions" :key="index" :label="item.name" :value="item.id"></el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column prop="attrDescribeOne" label="姓名" width="180">
            <template #header>
              <span class="required">姓名</span>
            </template>
            <template #default="scope">
              <el-input
                v-model="scope.row.attrDescribeOne"
                placeholder="请输入姓名"
                :class="{ 'is-error': scope.row.errors && scope.row.errors.name }"
              >
              </el-input>
              <div class="validation-errors" v-if="scope.row.errors && scope.row.errors.name">
                {{ scope.row.errors.name }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="attrNameTwo" label="身份证号码">
            <template #default="scope">
              <el-input
                v-model="scope.row.attrNameTwo"
                placeholder="请输入身份证号码"
                maxlength="18"
                :class="{ 'is-error': scope.row.errors && scope.row.errors.idCard }"
              >
              </el-input>
              <div class="validation-errors" v-if="scope.row.errors && scope.row.errors.idCard">
                {{ scope.row.errors.idCard }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="attrDescribeTwo" label="联系电话">
            <template #header>
              <span class="required">联系电话</span>
            </template>
            <template #default="scope">
              <el-input
                v-model="scope.row.attrDescribeTwo"
                placeholder="请输入联系电话"
                :class="{ 'is-error': scope.row.errors && scope.row.errors.phone }"
              >
              </el-input>
              <div class="validation-errors" v-if="scope.row.errors && scope.row.errors.phone">
                {{ scope.row.errors.phone }}
              </div>
            </template>
          </el-table-column>

          <el-table-column label="操作" align="center">
            <template #default="scope">
              <!-- 删除 -->
              <el-button type="text" @click="removeTableCell(scope.$index, scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="addsuppliercss flex-center-center" @click="addTableCell">+ 新增属性</div>

        <!-- <div class="table-footer">
          <el-button class="flex-buttom" @click="addTableCell" type="primary" plain>新增属性</el-button>
        </div> -->
      </el-row>

      <div class="section-title">
        <span class="title-text">资料清单</span>
      </div>

      <div>
        <el-upload
          :action="uploadAction"
          :auto-upload="false"
          :file-list="fileListtable"
          :limit="10"
          accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx"
          multiple
          list-type="text"
          :show-file-list="false"
          :on-change="handleChange"
          :on-remove="handleRemove"
          :before-upload="beforeUpload"
          :on-exceed-limit="handleExceed"
        >
          <div class="upload-btn">
            <el-button type="primary" size="small">附件上传</el-button>
          </div>
        </el-upload>

        <el-table :data="fileListtable" style="width: 100%" :cell-style="{ textAlign: 'center' }" :header-cell-style="{ textAlign: 'center' }" border>
          <el-table-column prop="index" label="序号" width="80" />
          <el-table-column prop="name" label="附件名" />
          <el-table-column prop="remark" label="备注">
            <template #default="scope">
              <el-input v-model="scope.row.remark" placeholder="请输入"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template #default="scope">
              <el-button type="primary" link @click="previewFile(scope.row)">预览</el-button>
              <!--  资质名称为 毕业证 不显示删除按钮  -->
              <el-button type="primary" v-if="scope.row.name !== '毕业证'" link @click="removeFile(scope.$index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="next-step-container">
        <el-button type="primary" class="next-step-button" @click="submitForm">下一步</el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { defineComponent, reactive, ref } from 'vue';
import { globalHeaders } from '@/utils/request';
import { ElMessage } from 'element-plus';
import { DataFormTs, DictDataQuery, TableItem } from '@/api/register/Supplier/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const emit = defineEmits(['nextStep']); // 定义事件
const initFormData: DataFormTs = {
  dictCode: undefined,
  dictLabel: '',
  dictValue: '',
  cssClass: '',
  listClass: 'primary',
  dictSort: 0,
  remark: ''
};

const formRules = {
  dictLabel: [{ required: true, message: '数据标签不能为空', trigger: 'blur' }],
  dictValue: [{ required: true, message: '数据键值不能为空', trigger: 'blur' }],
  dictSort: [{ required: true, message: '数据顺序不能为空', trigger: 'blur' }]
};

// 表单数据
const data = reactive({
  form: { ...initFormData },
  rules: formRules
});

const { form, rules } = toRefs(data);
const dataFormRef = ref<ElFormInstance>();

// 联系人类型
const secondCategoryOptions = ref<Array<{ id: number; name: string }>>([
  { id: 1, name: '法人' },
  { id: 2, name: '自然人' }
]);

// 企业联系人
const tableList = ref<TableItem[]>([
  {
    attrNameOne: '',
    attrDescribeOne: '',
    attrNameTwo: '',
    attrDescribeTwo: ''
  }
]);

/*** 导入参数 */
const upload = reactive({
  // 是否禁用上传
  isUploading: false,
  // 是否更新已经存在的用户数据
  updateSupport: 0,
  // 设置上传的请求头部
  headers: globalHeaders(),
  // 上传的地址
  url: import.meta.env.VITE_APP_BASE_API + '/system/user/importData'
});

// 添加新行-企业联系人
const addTableCell = () => {
  tableList.value.push({
    attrNameOne: '',
    attrDescribeOne: '',
    attrNameTwo: '',
    attrDescribeTwo: ''
  });
};
//  删除行 -企业联系人
const removeTableCell = (index: number, row: TableItem) => {
  if (tableList.value.length > 1) {
    tableList.value.splice(index, 1);
  } else {
    // 如果是最后一行，清空而不是删除
    row.attrNameOne = '';
    row.attrDescribeOne = '';
    row.attrNameTwo = '';
    row.attrDescribeTwo = '';
  }
};

/**
 * 验证企业联系人信息
 * @param contact - 包含联系人信息的对象，包含姓名、身份证号和电话等字段
 * @returns 包含验证错误信息的对象，如果没有错误则返回空对象
 */
const validateContact = (contact: any) => {
  const errorsValue: { name?: string; idCard?: string; phone?: string } = {};

  // 验证姓名（必填）
  if (!contact.attrDescribeOne || contact.attrDescribeOne.trim() === '') {
    errorsValue.name = '姓名不能为空';
  }

  // 验证身份证号码（格式验证）
  if (contact.attrNameTwo && contact.attrNameTwo.trim() !== '') {
    const idCardPattern = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
    if (!idCardPattern.test(contact.attrNameTwo)) {
      errorsValue.idCard = '身份证号码格式不正确';
    }
  }

  // 验证联系电话（必填且格式验证）
  if (!contact.attrDescribeTwo || contact.attrDescribeTwo.trim() === '') {
    errorsValue.phone = '联系电话不能为空';
  } else {
    const phonePattern = /^1[3-9]\d{9}$/;
    if (!phonePattern.test(contact.attrDescribeTwo)) {
      errorsValue.phone = '请输入有效的手机号码';
    }
  }

  return errorsValue;
};

/**
 * 验证所有联系人信息
 * 遍历所有联系人进行验证，如果全部验证通过则显示成功消息，否则提示存在错误需要修正
 */
const validateAndSubmit = () => {
  let isValid = true;

  // 验证所有联系人
  tableList.value.forEach((contact) => {
    const arr = validateContact(contact);
    contact.errors = arr;

    if (Object.keys(arr).length > 0) {
      isValid = false;
    }
  });

  if (isValid) {
    proxy?.$modal.msgSuccess('所有联系人信息验证通过！');
    // 这里可以添加提交数据的逻辑
    console.log('提交的数据：', tableList.value);
  } else {
    proxy?.$modal.msgError('请检查并修正表单中的错误');
  }
};

/** 表单重置 */
const reset = () => {
  form.value = { ...initFormData };
  dataFormRef.value?.resetFields();
};

/** 提交按钮 */
const submitForm = () => {
  dataFormRef.value.validate((valid: boolean) => {
    if (valid) {
      //   form.value.dictCode
      proxy?.$modal.msgSuccess('操作成功');
      emit('nextStep');
    } else {
      emit('nextStep');
      console.log('表单验证失败');
      ElMessage.error('请完善必填信息');
      // 删除 return false，避免隐式返回 boolean 值
    }
  });
};
/**文件变化处理 */
const handleDiplomaChange = (file: any) => {
  // diplomaUrl.value = URL.createObjectURL(file.raw);
  // qualificationList.value.push({
  //   index: qualificationList.value.length + 1,
  //   name: '毕业证',
  //   remark: '上传毕业证',
  //   url: diplomaUrl.value
  // });
};

/**文件上传中处理 */
const handleFileUploadProgress = () => {
  upload.isUploading = true;
};
/** 文件上传成功处理 */
const handleFileSuccess = (response: any, file: UploadFile) => {
  upload.isUploading = false;
};

// 上传地址（替换为实际接口）
const uploadAction = '/api/upload';

// 文件列表
const fileListtable = ref<any[]>([]);

// 处理文件选择
const handleChange = (file: any, fileList: any[]) => {
  console.log('file', file, fileList);
  if (!fileListtable.value.some((f) => f.uid === file.uid)) {
    fileListtable.value.push({
      ...file,
      remark: ''
    });
  }
};

// 删除文件
const handleRemove = (file: any, fileList: any[]) => {
  const index = fileListtable.value.findIndex((f) => f.uid === file.uid);
  if (index !== -1) {
    fileListtable.value.splice(index, 1);
  }
};

// 文件上传前校验
const beforeUpload = (file: any) => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    ElMessage.error('文件大小不能超过5MB');
    return false;
  }

  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  if (!allowedTypes.includes(file.type)) {
    ElMessage.error('不支持的文件类型');
    return false;
  }

  return true;
};

// 超出数量限制
const handleExceed = () => {
  ElMessage.warning('最多只能上传10个文件');
};

// 预览文件
const previewFile = (file: any) => {
  console.log('预览文件:', file);
  // 这里可以实现预览逻辑，例如打开文件或显示预览对话框
  // if (file.raw.type.startsWith('image/')) {
  //   const reader = new FileReader();
  //   reader.onload = (e) => {
  //     const result = e.target?.result;
  //     if (typeof result === 'string') {
  //       window.open(result);
  //     }
  //   };
  //   reader.readAsDataURL(file);
  // } else {
  //   ElMessage.info('暂不支持该文件类型的在线预览');
  // }
};

// 删除文件
const removeFile = (file: any) => {
  const index = fileListtable.value.findIndex((f) => f.uid === file.uid);
  if (index !== -1) {
    fileListtable.value.splice(index, 1);
  }
};
// 备注变更处理
const handleRemarkChange = (file: any) => {
  console.log('备注更新:', file.remark);
};
</script>

<style scoped lang="scss">
.section-title {
  position: relative;
  padding: 10px 0;
  margin-bottom: 20px;
  border-bottom: 1px solid #e5e5e5;
}

.title-text {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  display: inline-block;
  padding-left: 10px;
  position: relative;
}

.title-text::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 100%;
  background-color: #409eff;
}

.addsuppliercss {
  width: 100%;
  height: 40px;
  color: #0079fe;
  border-width: 0 1px 1px 1px;
  border-style: solid;
  border-color: #e4e4e4;
}

.upload-container {
  width: 100%;

  .upload-box {
    width: 100%;
    .upload-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background-color: #f5f7fa;
      width: 100%;
      border-radius: 6px;
      padding: 20px;
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
}

.upload-btn {
  padding: 10px;
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

.required::before {
  content: '*';
  color: #f56c6c;
  margin-right: 4px;
}
</style>
