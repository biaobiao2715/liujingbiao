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
            <el-upload
              ref="uploadRef"
              :limit="1"
              accept=".xlsx, .xls"
              :headers="upload.headers"
              :action="upload.url + '?updateSupport=' + upload.updateSupport"
              :disabled="upload.isUploading"
              :on-progress="handleFileUploadProgress"
              :on-success="handleFileSuccess"
              :auto-upload="false"
              drag
            >
              <el-icon class="el-icon--upload">
                <i-ep-upload-filled />
                <!-- <el-icon class="el-icon--upload"><upload-filled /></el-icon> -->
              </el-icon>
              <div class="el-upload__text">点击或将文件拖拽到这里上传</div>
              <div class="el-upload__tip">单个文件最大10M 支持扩展名：jpg.jpeg.gif.png.pdf</div>
            </el-upload>
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
              <el-select v-model="scope.row.attrNameOne" placeholder="请选择性别" filterable clearable>
                <el-option v-for="(item, index) in secondCategoryOptions" :key="index" :label="item.name" :value="item.id"></el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column prop="attrDescribeOne" label="姓名">
            <template #default="scope">
              <el-input v-model="scope.row.attrDescribeOne" placeholder="请输入"></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="attrNameTwo" label="身份证号码">
            <template #default="scope">
              <el-input v-model="scope.row.attrNameTwo" placeholder="请输入"></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="attrDescribeTwo" label="联系电话">
            <template #default="scope">
              <el-input v-model="scope.row.attrDescribeTwo" placeholder="请输入"></el-input>
            </template>
          </el-table-column>

          <el-table-column label="操作" align="center">
            <template #default="scope">
              <el-button type="text">预览</el-button>

              <!-- 删除 -->
              <el-button type="text" @click="removeTableCell(scope.$index, scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="table-footer">
          <el-button class="flex-buttom" @click="addTableCell" type="primary" plain>新增属性</el-button>
        </div>
      </el-row>

      <div class="section-title">
        <span class="title-text">资料清单</span>
      </div>

      <el-row :gutter="20">
        <el-upload
          :action="uploadAction"
          :auto-upload="false"
          :on-change="handleChange"
          :on-remove="handleRemove"
          :file-list="fileList"
          :limit="10"
          accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx"
          drag
          multiple
          show-file-list
          list-type="text"
          :before-upload="beforeUpload"
          :on-exceed-limit="handleExceed"
        >
          <div class="upload-btn">
            <el-button type="primary" size="small">附件上传</el-button>
          </div>
        </el-upload>

        <!-- 附件列表 -->
        <div v-if="fileList.length > 0" class="file-list">
          <table class="file-table">
            <thead>
              <tr>
                <th>序号</th>
                <th>附件名</th>
                <th>备注</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(file, index) in fileList" :key="file.uid">
                <td>{{ index + 1 }}</td>
                <td>{{ file.name }}</td>
                <td>
                  <el-input v-model="file.remark" placeholder="请输入" @blur="handleRemarkChange(file)" />
                </td>
                <td>
                  <el-button type="text" @click="previewFile(file)">预览</el-button>
                  <el-button type="text" @click="removeFile(file)">删除</el-button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </el-row>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { defineComponent, reactive, ref } from 'vue';
import { globalHeaders } from '@/utils/request';
import { DataFormTs, DictDataQuery, TableItem } from '@/api/register/Supplier/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

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

const data = reactive({
  form: { ...initFormData },
  rules: formRules
});

const { form, rules } = toRefs(data);
const dataFormRef = ref<ElFormInstance>();

// 性别数据
const secondCategoryOptions = ref<Array<{ id: number; name: string }>>([
  { id: 1, name: '男' },
  { id: 2, name: '女' },
  { id: 3, name: '其他' }
]);

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

// 添加新行-供应商联系人
const addTableCell = () => {
  tableList.value.push({
    attrNameOne: '',
    attrDescribeOne: '',
    attrNameTwo: '',
    attrDescribeTwo: ''
  });
};
//  删除行 -供应商联系人
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

/** 表单重置 */
const reset = () => {
  form.value = { ...initFormData };
  dataFormRef.value?.resetFields();
};

/** 提交按钮 */
const submitForm = () => {
  dataFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      //   form.value.dictCode
      proxy?.$modal.msgSuccess('操作成功');
    }
  });
};

/**文件上传中处理 */
const handleFileUploadProgress = () => {
  upload.isUploading = true;
};
/** 文件上传成功处理 */
const handleFileSuccess = (response: any, file: UploadFile) => {
  upload.isUploading = false;
};
import { ElMessage } from 'element-plus';

// 上传地址（替换为实际接口）
const uploadAction = '/api/upload';

// 文件列表
const fileList = ref<any[]>([]);

// 处理文件选择
const handleChange = (file: any, fileList: any[]) => {
  if (!fileList.some((f) => f.uid === file.uid)) {
    fileList.push({
      ...file,
      remark: ''
    });
  }
};

// 删除文件
const handleRemove = (file: any, fileList: any[]) => {
  const index = fileList.findIndex((f) => f.uid === file.uid);
  if (index !== -1) {
    fileList.splice(index, 1);
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
  if (file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        window.open(result);
      }
    };
    reader.readAsDataURL(file);
  } else {
    ElMessage.info('暂不支持该文件类型的在线预览');
  }
};

// 删除文件
const removeFile = (file: any) => {
  const index = fileList.value.findIndex((f) => f.uid === file.uid);
  if (index !== -1) {
    fileList.value.splice(index, 1);
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

.file-list {
  margin-top: 20px;
}

.file-table {
  width: 100%;
  border-collapse: collapse;
  margin: 10px 0;
}

.file-table th,
.file-table td {
  padding: 8px;
  border: 1px solid #ddd;
  text-align: left;
}

.file-table th {
  background-color: #f5f5f5;
  font-weight: normal;
}

.file-table tr:nth-child(even) {
  background-color: #f9f9f9;
}

.file-table tr:hover {
  background-color: #f1f1f1;
}
</style>
