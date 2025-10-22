<template>
  <!--
  标题: EditDetails.vue
  功能: 商品编辑详情页
  说明: 用于商品编辑自己的详细信息
  当前版本: 1.0
  开发信息: Created by 刘景彪 2025-10-15
-->
  <div class="supplier-edit-details" v-loading="loading">
    <el-form ref="refForm" :model="formData" :rules="FormRulesarr" label-width="120px">
      <div>
        <div class="content-form-title">基本信息</div>
        <el-row>
          <el-col :span="12">
            <el-form-item label="商品名称" prop="headline">
              <el-input v-model="formData.headline" placeholder="请输入商品名称" maxlength="60" show-word-limit />
            </el-form-item>
          </el-col>
          <el-col :span="12"></el-col>

          <el-col :span="12">
            <el-form-item label="商品编码" prop="productCode">
              <el-input :disabled="true" v-model="formData.productCode" placeholder="自动生成" />
            </el-form-item>
          </el-col>
          <el-col :span="12"></el-col>

          <el-col :span="12">
            <el-form-item label="商品类目" prop="productSort">
              <el-cascader
                v-if="creditList"
                style="width: 100%"
                v-model="formData.productSort"
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
            <el-form-item label="商品品牌" prop="brand">
              <el-select v-model="formData.brand" placeholder="请选择品牌" style="width: 100%" clearable>
                <el-option v-for="item in brandOptions" :key="item.id" :label="item.name" :value="item.id" :disabled="!item.status" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12"></el-col>

          <el-col :span="12">
            <el-form-item label="产品保障" prop="guarantee">
              <el-select v-model="formData.guarantee" placeholder="请选择产品保障" style="width: 100%" clearable>
                <el-option v-for="item in guaranteeOptions" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12"></el-col>

          <el-col :span="12">
            <el-form-item label="产品功能" prop="function">
              <el-select v-model="formData.function" placeholder="请选择产品功能" style="width: 100%" clearable>
                <el-option v-for="item in functionOptions" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="商品主图" prop="titleFileList">
              <div>1、首张主图需保证图片品质,共需上传5张商品图片</div>
              <div>2、需上传800px以上的实拍大图,包含商品整体款式和商品细节</div>
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
              >
                <i class="el-icon-plus"></i>
              </el-upload>
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="商品介绍" prop="productDesc">
              <el-input v-model="formData.productDesc" type="textarea" :rows="5" placeholder="请输入商品介绍" maxlength="300" show-word-limit />
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="商品详情" prop="productDetail">
              <editor v-model="formData.productDetail" :min-height="192" />
            </el-form-item>
          </el-col>
        </el-row>

        <div class="line" style="margin-top: 18px"></div>

        <div class="content-form-title">价格与库存</div>
        <el-row>
          <el-col :span="12">
            <el-form-item label="商品规格" prop="specifications">
              <el-select v-model="formData.specifications" placeholder="请选择商品规格" style="width: 100%" clearable>
                <el-option v-for="item in specificationOptions" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <div class="form-flex">
              <div class="flex-text">自定义添加规格，以更精准描述产品。</div>
              <el-button class="flex-buttom" @click="addTableCell" type="primary" plain>新增规格</el-button>
            </div>

            <el-table :data="tableList" border style="width: 100%">
              <el-table-column prop="unit" label="单位">
                <template #header>
                  <span class="required">单位</span>
                </template>
                <template #default="scope">
                  <el-input
                    v-model="scope.row.unit"
                    placeholder="请输入姓名"
                    :class="{ 'is-error': scope.row.errors && scope.row.errors.unit }"
                  ></el-input>
                  <div class="validation-errors" v-if="scope.row.errors && scope.row.errors.unit">
                    {{ scope.row.errors.unit }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="sellingPrice" label="销售价">
                <template #header>
                  <span class="required">销售价</span>
                </template>
                <template #default="scope">
                  <el-input
                    v-model="scope.row.sellingPrice"
                    placeholder="请输入销售价"
                    :class="{ 'is-error': scope.row.errors && scope.row.errors.sellingPrice }"
                  ></el-input>
                  <div class="validation-errors" v-if="scope.row.errors && scope.row.errors.sellingPrice">
                    {{ scope.row.errors.sellingPrice }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="availableInventory" label="可用库存">
                <template #header>
                  <span class="required">可用库存</span>
                </template>
                <template #default="scope">
                  <el-input
                    v-model="scope.row.availableInventory"
                    placeholder="请输入可用库存"
                    :class="{ 'is-error': scope.row.errors && scope.row.errors.availableInventory }"
                  ></el-input>
                  <div class="validation-errors" v-if="scope.row.errors && scope.row.errors.availableInventory">
                    {{ scope.row.errors.availableInventory }}
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
          <el-form-item label="上架状态" prop="shelfStatus">
            <el-radio-group v-model="formData.shelfStatus">
              <el-radio :value="1" size="large">上架</el-radio>
              <el-radio :value="2" size="large">下架</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="上架时间" prop="listingTime">
            <el-date-picker v-model="formData.listingTime" value-format="YYYY-MM-DD HH:mm:ss" type="datetime" placeholder="请选择日期时间">
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
      </div>
    </el-form>

    <el-dialog
      title="预览"
      v-model:visible="picOpen"
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
import { AnyAaaaRecord } from 'node:dns';
import { uploadImage } from '@/api/Supplier/productManagement/product';
// import { wzfProductReleaseAdd, wzfProductReleaseId, wzfProductSortAll, uploadBatchImg } from '@/api/gapi/supplier';
// 获取router路由参数
const route = useRoute();
const { selID, readonly, addEnProducts } = route.query;

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { review_status, plat_qualification_grade, plat_credit_rating } = toRefs<any>(
  proxy?.useDict('review_status', 'plat_qualification_grade', 'plat_credit_rating')
);
// 定义 refs
const refForm = ref<InstanceType<typeof ElForm> | null>(null);
const refShop = ref();

// 定义数据
const loading = ref(false);
const tableList = ref<any[]>([{}]);

// 商品分组
const creditList = ref([]);
// 品牌选项
const brandOptions = ref([]);
// 保障选项
const guaranteeOptions = ref([]);
// 功能选项
const functionOptions = ref([]);
// 规格选项
const specificationOptions = ref([]);

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

// 表单数据
const formData = ref({
  // 基础信息
  headline: '', //商品名称
  productCode: '', //商品编码
  productSort: '', //商品类目
  brand: '', //商品品牌
  guarantee: '', //产品保障
  function: '', //产品功能
  productDesc: '', //商品介绍
  productDetail: '', //商品详情

  auditStatus: '',
  imagePathMain: '', //主图

  // 服务信息
  shelfStatus: 1, //上架状态
  listingTime: '', //上架时间

  // 规格
  specifications: '', //商品规格
  imageList: []
});

// 表单校验规则
const FormRulesarr: FormRules = {
  headline: [
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
  productSort: [{ required: true, message: '请选择商品类目', trigger: 'change' }],
  function: [{ required: true, message: '请选择产品功能', trigger: 'change' }]
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
  console.log('预览图片', file);
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
const uploadFile = (file: any) => {
  // 直接返回上传操作的 Promise
  return new Promise((resolve, reject) => {
    imgList.value.push(file);

    if (timer) {
      clearTimeout(timer);
      timer = null;
    }

    timer = setTimeout(function () {
      uploadedSuccessfully(file);
    }, 500);
  });
};

// 上传结束处理
const uploadedSuccessfully = (options: any) => {
  // 多张图片上传
  const arr = imgList.value;
  const fileData = new FormData();

  arr.forEach((v) => {
    fileData.append(`files`, v);
  });

  uploadImage(fileData)
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
      refShop.value.handleRemove(options);
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
  const errorsValue: { unit?: string; sellingPrice?: string; availableInventory?: string } = {};

  // 单位（必填）
  if (!contact.unit || contact.unit.trim() === '') {
    errorsValue.unit = '请输入姓名';
  }

  // 销售价（必填）
  if (!contact.sellingPrice || contact.sellingPrice.trim() === '') {
    errorsValue.sellingPrice = '请输入姓名';
  }
  // 可用库存（必填）
  if (!contact.availableInventory || contact.availableInventory.trim() === '') {
    errorsValue.availableInventory = '请输入姓名';
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
  // 商品类型
  // wzfProductSortAll().then((res) => {
  //   const arr: any[] = [];
  //   res.data.forEach((item: any) => {
  //     if (item.children.length === 0) {
  //       const brr = item;
  //       delete brr.children;
  //       arr.push(brr);
  //     } else {
  //       const brr = item;
  //       brr.children.map((i: any) => {
  //         delete i.children;
  //       });
  //       arr.push(brr);
  //     }
  //   });
  //   creditList.value = arr;
  // });

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

  // 模拟规格数据
  specificationOptions.value = [
    { id: 1, name: '规格1' },
    { id: 2, name: '规格2' }
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
</style>
