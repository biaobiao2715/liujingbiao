<!--
  标题: EditDetails.vue
  功能: 商品编辑详情页
  说明: 用于商品编辑自己的详细信息
  当前版本: 1.0
  开发信息: Created by 刘景彪 2025-10-15
-->
<template>
  <div class="supplier-edit-details">
    <el-form ref="refForm" :model="formData" :rules="FormRulesarr" label-width="120px">
      <div class="content-form-title">基本信息</div>
      <el-row>
        <el-col :span="12">
          <el-form-item label="商品名称" prop="goodsName">
            <el-input v-model="formData.goodsName" placeholder="请输入商品名称" maxlength="60" show-word-limit />
          </el-form-item>
        </el-col>
        <el-col :span="12"></el-col>

        <el-col :span="12">
          <el-form-item label="商品编码" prop="goodsCode">
            <el-input :disabled="true" v-model="formData.goodsCode" placeholder="自动生成" />
          </el-form-item>
        </el-col>
        <el-col :span="12"></el-col>

        <el-col :span="12">
          <el-form-item label="商品类目" prop="goodsCategoryId">
            <el-cascader
              v-if="creditList"
              style="width: 100%"
              v-model="formData.goodsCategoryId"
              filterable
              :options="creditList"
              :props="{
                emitPath: false,
                value: 'id',
                label: 'name',
                children: 'children'
              }"
            ></el-cascader>
          </el-form-item>
        </el-col>
        <el-col :span="12"></el-col>

        <el-col :span="12">
          <el-form-item label="商品品牌" prop="goodsBrandId">
            <el-select v-model="formData.goodsBrandId" placeholder="请选择品牌" style="width: 100%" clearable>
              <el-option v-for="item in brandOptions" :key="item.id" :label="item.name" :value="item.id" :disabled="!item.status" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12"></el-col>

        <el-col :span="12">
          <el-form-item label="产品保障" prop="goodsEnsureId">
            <el-select v-model="formData.goodsEnsureId" placeholder="请选择产品保障" style="width: 100%" clearable>
              <el-option v-for="item in guaranteeOptions" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12"></el-col>

        <el-col :span="12">
          <el-form-item label="产品功能" prop="goodsAbilityIds">
            <el-select v-model="formData.goodsAbilityIds" placeholder="请选择产品功能" style="width: 100%" clearable>
              <el-option v-for="item in functionOptions" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="24">
          <el-form-item label="商品主图" prop="titleFileList" class="uploadcss">
            <el-upload
              :file-list="fileList"
              :limit="5"
              ref="refShop"
              list-type="picture-card"
              action="#"
              multiple
              :on-preview="handlePictureCardPreview"
              :before-upload="handleBeforeUpload"
              :http-request="uploadFile"
              :on-remove="handleDelete"
              :on-exceed="handleExceed"
              :auto-upload="false"
            >
              <el-icon class="avatar-uploader-icon"><Plus /></el-icon>
            </el-upload>
            <div>1.将用于首页、活动等特定场景的展示</div>
            <div>2.建议图片比例1:1,像素高于需800*800px,小于10MB,格式为PNG/JPEG/JPG</div>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="商品介绍" prop="goodsInfo">
            <el-input v-model="formData.goodsInfo" type="textarea" :rows="5" placeholder="请输入商品介绍" maxlength="300" show-word-limit />
          </el-form-item>
        </el-col>

        <el-col :span="24">
          <el-form-item label="商品详情" prop="goodsDetail">
            <editor v-model="formData.goodsDetail" :min-height="192" />
          </el-form-item>
        </el-col>
      </el-row>

      <div class="line" style="margin-top: 18px"></div>

      <div class="content-form-title">价格与库存</div>
      <el-row>
        <el-col :span="12">
          <el-form-item label="商品规格" prop="goodsSpecification">
            <el-select v-model="formData.goodsSpecification" placeholder="请选择商品规格" style="width: 100%" clearable>
              <el-option v-for="dict in goods_specification" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <div class="form-flex">
            <div class="flex-text">自定义添加规格，以更精准描述产品。</div>
            <el-button class="flex-buttom" @click="addTableCell" type="primary" plain>新增规格</el-button>
          </div>

          <el-table :data="tableList" border style="width: 100%">
            <el-table-column prop="goodsSpecificationValue" label="单位">
              <template #header>
                <span class="required">单位</span>
              </template>
              <template #default="scope">
                <el-input
                  v-model="scope.row.goodsSpecificationValue"
                  placeholder="请输入姓名"
                  :class="{ 'is-error': scope.row.errors && scope.row.errors.goodsSpecificationValue }"
                ></el-input>
                <div class="validation-errors" v-if="scope.row.errors && scope.row.errors.goodsSpecificationValue">
                  {{ scope.row.errors.goodsSpecificationValue }}
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="goodsPrice" label="销售价">
              <template #header>
                <span class="required">销售价</span>
              </template>
              <template #default="scope">
                <el-input
                  v-model="scope.row.goodsPrice"
                  placeholder="请输入销售价"
                  :class="{ 'is-error': scope.row.errors && scope.row.errors.goodsPrice }"
                ></el-input>
                <div class="validation-errors" v-if="scope.row.errors && scope.row.errors.goodsPrice">
                  {{ scope.row.errors.goodsPrice }}
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="goodsStock" label="可用库存">
              <template #header>
                <span class="required">可用库存</span>
              </template>
              <template #default="scope">
                <el-input
                  v-model="scope.row.goodsStock"
                  placeholder="请输入可用库存"
                  :class="{ 'is-error': scope.row.errors && scope.row.errors.goodsStock }"
                ></el-input>
                <div class="validation-errors" v-if="scope.row.errors && scope.row.errors.goodsStock">
                  {{ scope.row.errors.goodsStock }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center">
              <template v-slot="scope">
                <!-- 删除 -->
                <el-button link @click="removeTableCell(scope.$index, scope.row)">删除行</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-col>
      </el-row>

      <div class="line" style="margin-top: 18px"></div>

      <div class="content-form-title">服务信息</div>
      <div>
        <el-form-item label="上架状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :value="1" size="large">上架</el-radio>
            <el-radio :value="2" size="large">下架</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="上架时间" prop="launchTime">
          <el-date-picker v-model="formData.launchTime" value-format="YYYY-MM-DD HH:mm:ss" type="datetime" placeholder="请选择日期时间">
          </el-date-picker>
        </el-form-item>
      </div>

      <div class="line" style="margin-top: 18px"></div>

      <!-- 按钮 -->
      <el-row type="flex" justify="center" :gutter="5">
        <el-col :span="3"><el-button v-throttle @click="submitClose">取消</el-button></el-col>
        <el-col :span="3"><el-button v-throttle type="primary" plain @click="submitForm('1')">暂存</el-button></el-col>
        <el-col :span="3"><el-button v-throttle type="primary" @click="submitForm('2')">提交</el-button></el-col>
      </el-row>
    </el-form>

    <el-dialog
      title="预览"
      v-model="picOpen"
      :before-close="picPreBeforeClose"
      class="pic-dialog"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      append-to-body
    >
      <img width="100%" :src="dialogImageUrl" alt="" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { ElMessage, ElMessageBox, ElForm, FormRules } from 'element-plus';
import { useRoute } from 'vue-router';
import { ossUploadImage, goodsAdd, goodsUpdate } from '@/api/Supplier/productManagement/product';
// 获取router路由参数
const route = useRoute();
const { selID } = route.query;
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const { goods_specification } = toRefs<any>(proxy?.useDict('goods_specification'));
// 定义 refs
const refForm = ref<InstanceType<typeof ElForm> | null>(null);
const refShop = ref();
// 商品分组
const creditList = ref([]);
// 品牌选项
const brandOptions = ref([]);
// 保障选项
const guaranteeOptions = ref([]);
// 功能选项
const functionOptions = ref([]);
// 图片上传相关
const fileSize = ref(5); // 大小限制(MB)
const fileType = ref(['png', 'jpg', 'jpeg', 'bmp']); // 文件类型
// 图片储存
const fileList = ref<any[]>([]);
const imgList = ref<any[]>([]);
let timer: NodeJS.Timeout | null = null;
// 图片预览
const picOpen = ref(false);
const dialogImageUrl = ref('');
// 表格数据
const tableList = ref<any[]>([{}]);
// 表单数据
const formData = ref({
  // 基础信息
  goodsName: '', //商品名称
  goodsCode: '', //商品编码
  goodsCategoryId: '', //商品类目
  goodsBrandId: '', //商品品牌
  goodsEnsureId: '', //产品保障
  goodsAbilityIds: '', //产品功能
  goodsInfo: '', //商品介绍
  goodsDetail: '', //商品详情

  auditStatus: '',
  imagePathMain: '', //主图

  // 服务信息
  status: 1, //上架状态
  launchTime: '', //上架时间

  // 规格
  goodsSpecification: '', //商品规格
  imageList: []
});

// 表单校验规则
const FormRulesarr: FormRules = {
  goodsName: [
    { required: true, message: '供应商名称不能为空', trigger: 'blur' },
    {
      validator: (rule: any, value: any, callback: any) => {
        if (!value || value.trim() === '') {
          callback(new Error('供应商名称不能为空'));
          return;
        }

        // 验证长度（100字节）
        if (new Blob([value]).size > 100) {
          callback(new Error('输入字符超过限制，最多可输入100字节'));
          return;
        }
        if (value.length > 60) {
          callback(new Error('输入字符超过限制，最多可输入60字节'));
          return;
        }
        if (value.match(/[\u4e00-\u9fa5]/g).length > 30) {
          callback(new Error('输入字符超过限制，最多可输入30汉字'));
        }
        callback();
      },
      trigger: 'blur'
    }
  ],
  goodsCategoryId: [{ required: true, message: '请选择商品类目', trigger: 'change' }],
  goodsAbilityIds: [{ required: true, message: '请选择产品功能', trigger: 'change' }],
  titleFileList: [
    {
      required: true,
      message: '请上传商品主图',
      trigger: 'change'
    }
  ]
};

// 方法定义
const submitForm = (status: string) => {
  if (!refForm.value) return;

  refForm.value.validate((valid: boolean) => {
    if (!valid) {
      return;
    }

    const arr = validateAndSubmit();
    if (!arr) return;

    const newtiem = new Date();
    const jsonData = {
      ...formData.value,
      auditStatus: status
    };

    // status：1-暂存，2-发布
    if (selID) {
      // wzfProductReleaseAdd(jsonData).then((response) => {
      //   ElMessage.success('修改成功');
      // });
    } else {
      // wzfProductReleaseAdd(jsonData).then((row) => {
      //   ElMessage.success('新增成功');
      // });
    }
  });
};

// 取消
const submitClose = () => {
  ElMessageBox.confirm('确定关闭表单？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {})
    .catch(() => {});
};

// 关闭预览
const picPreBeforeClose = () => {
  dialogImageUrl.value = '';
  picOpen.value = false;
};

// 点击预览
const handlePictureCardPreview = (file: any) => {
  dialogImageUrl.value = file.url;
  picOpen.value = true;
};

// 删除图片
const handleDelete = (file: any) => {
  const findex = fileList.value.map((f: any) => f.path).indexOf(file.path);
  if (findex > -1) {
    fileList.value.splice(findex, 1);
  }
};
// 上传
const uploadFile = (options: any) => {
  console.log('上传图片', options);
  // 直接返回上传操作的 Promise
  return new Promise((resolve, reject) => {
    imgList.value.push(options.file);

    if (timer) {
      clearTimeout(timer);
      timer = null;
    }

    timer = setTimeout(function () {
      uploadedSuccessfully(options.file);
    }, 500);
  });
};

// 上传结束处理
const uploadedSuccessfully = (file: any) => {
  // 多张图片上传
  const arr = imgList.value;
  const fileData = new FormData();

  arr.forEach((v) => {
    // fileData.append(`files`, v);
    fileData.append(`file`, v);
  });

  ossUploadImage(fileData)
    .then((response) => {
      imgList.value = [];
      const newFile = {
        name: response.data.fileName || '商品主图',
        remark: '商品主图',
        url: response.data.url,
        fileType: '1',
        ossId: response.data.ossId
      };
      fileList.value.push(newFile);
      // 关闭loading
      proxy?.$modal.closeLoading();
    })
    .catch((res) => {
      imgList.value = [];
      // 关闭loading
      proxy?.$modal.closeLoading();
      ElMessage.error(res.msg);
      refShop.value.handleRemove(file);
    });
};

// 文件个数超出
const handleExceed = () => {
  ElMessage.error(`上传文件数量不能超过 5 个!`);
};

// 上传前loading加载
const handleBeforeUpload = (file: any) => {
  let isImg = false;
  if (fileType.value.length) {
    let fileExtension = '';
    if (file.name.lastIndexOf('.') > -1) {
      fileExtension = file.name.slice(file.name.lastIndexOf('.') + 1);
    }
    isImg = fileType.value.some((type) => {
      if (file.type.indexOf(type) > -1) return true;
      if (fileExtension && fileExtension.indexOf(type) > -1) return true;
      return false;
    });
  } else {
    isImg = file.type.indexOf('image') > -1;
  }

  if (!isImg) {
    ElMessage.error(`文件格式不正确, 请上传${fileType.value.join('/')}图片格式文件!`);
    return false;
  }
  if (fileSize.value) {
    const isLt = file.size / 1024 / 1024 < fileSize.value;
    if (!isLt) {
      ElMessage.error(`上传图片大小不能超过 ${fileSize.value} MB!`);
      return false;
    }
  }
  // 显示loading
  proxy?.$modal.loading('正在上传图片，请稍候...');
  return true;
};

// table新增
const addTableCell = () => {
  tableList.value.push({});
};

// table删除
const removeTableCell = (index: number, row: any) => {
  ElMessageBox.confirm('您确定要删除该数据?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      tableList.value.splice(index, 1);
    })
    .catch(() => {});
};

/**
 * 验证规格信息
 * @param contact - 包含联系人信息的对象，包含姓名、身份证号和电话等字段
 * @returns 包含验证错误信息的对象，如果没有错误则返回空对象
 */
const validateContact = (contact: any) => {
  const errorsValue: { goodsSpecificationValue?: string; goodsPrice?: string; goodsStock?: string } = {};

  // 单位（必填）
  if (!contact.goodsSpecificationValue || contact.goodsSpecificationValue.trim() === '') {
    errorsValue.goodsSpecificationValue = '请输入姓名';
  }

  // 销售价（必填）
  if (!contact.goodsPrice || contact.goodsPrice.trim() === '') {
    errorsValue.goodsPrice = '请输入姓名';
  }
  // 可用库存（必填）
  if (!contact.goodsStock || contact.goodsStock.trim() === '') {
    errorsValue.goodsStock = '请输入姓名';
  }

  return errorsValue;
};

/**
 * 验证规格值
 */
const validateAndSubmit = () => {
  let isValid = true;

  // 验证所有联系人
  tableList.value.forEach((contact) => {
    const errors = validateContact(contact);
    contact.errors = errors;

    if (Object.keys(errors).length > 0) {
      isValid = false;
    }
  });

  if (isValid) {
    return true;
  } else {
    proxy?.$modal.msgError('请检查并修正价格与库存中的错误');
    return false;
  }
};

// 生命周期钩子
onMounted(() => {
  // 模拟商品分组数据
  creditList.value = [
    {
      id: 1,
      name: '商品分类1',
      children: [
        { id: 1, name: '商品分类1-1' },
        { id: 2, name: '商品分类1-2' },
        { id: 3, name: '商品分类1-3' }
      ]
    },
    {
      id: 1,
      name: '商品分类2',
      children: [
        { id: 1, name: '商品分类2-1' },
        { id: 2, name: '商品分类2-2' },
        { id: 3, name: '商品分类2-3' }
      ]
    }
  ];

  // 模拟品牌数据
  brandOptions.value = [
    { id: 1, name: '品牌A', status: true },
    { id: 2, name: '品牌B', status: true },
    { id: 3, name: '品牌C', status: false }
  ];

  // 模拟保障数据
  guaranteeOptions.value = [
    { id: 1, name: '保障1' },
    { id: 2, name: '保障2' }
  ];

  // 模拟功能数据
  functionOptions.value = [
    { id: 1, name: '功能1' },
    { id: 2, name: '功能2' },
    { id: 3, name: '功能3' }
  ];

  if (selID) {
    // wzfProductReleaseId(selID).then((response) => {
    //   formData.value = response.data;
    //   attrListClick(); //其他属性进行 更改
    // });
  }
});
</script>
<style lang="scss" scoped>
.supplier-edit-details {
  padding: 24px;
}

.line {
  height: 1px;
  background-color: #dcdfe6;
  margin: 40px 0px 30px 0px;
}

.content-form-title {
  position: relative;
  height: 14px;
  line-height: 14px;
  font-weight: bold;
  font-size: 14px;
  color: #333333;
  margin-left: 15px;
  margin-bottom: 20px;
}

.content-form-title::before {
  position: absolute;
  left: -15px;
  top: 0;
  bottom: 0;
  content: '';
  width: 5px;
  background: #2d6cf5;
}

.required::before {
  content: '*';
  color: #f56c6c;
  margin-right: 4px;
}

.uploadcss {
  // 表单
  ::v-deep .el-form-item__content {
    white-space: nowrap;
    display: inline-block;
  }
}

// 图片上传
::v-deep .el-upload-list--picture-card .el-upload-list__item {
  width: 106px;
  height: 106px;
}

::v-deep .el-upload--picture-card {
  width: 106px;
  height: 106px;
  line-height: 106px;
  float: left;
}

.form-flex {
  display: flex;
  align-items: center;
  height: 30px;
  margin-bottom: 20px;
  .flex-text {
    height: 30px;
    line-height: 30px;
    font-size: 14px;
    color: #666666;

    margin-right: 30px;
  }
  .flex-buttom {
    width: 90px;
    height: 30px;
    display: flex;
    justify-content: center;
    align-items: center;

    font-size: 14px;
    border-radius: 4px;
  }
}

// 上传状态样式
.el-upload-list--picture-card .el-upload-list__item {
  position: relative;
}

.el-upload-list--picture-card .el-upload-list__item .el-upload-list__item-status-label {
  position: absolute;
  top: 0;
  right: 0;
  width: 20px;
  height: 20px;
  line-height: 20px;
  text-align: center;
  font-size: 12px;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 50%;
  z-index: 1;
}

.el-upload-list--picture-card .el-upload-list__item .el-upload-list__item-status-label.uploading {
  background-color: #2d6cf5;
}

.el-upload-list--picture-card .el-upload-list__item .el-upload-list__item-status-label.failed {
  background-color: #f56c6c;
}

.el-upload-list--picture-card .el-upload-list__item .el-upload-list__item-status-label.success {
  background-color: #67c23a;
}

.el-upload-list--picture-card .el-upload-list__item .el-upload-list__item-status-label:hover {
  opacity: 0.8;
}
</style>
