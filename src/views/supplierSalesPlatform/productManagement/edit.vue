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
        <el-col :span="12">
          <!--  -->
        </el-col>

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
                label: 'categoryName',
                children: 'children'
              }"
            ></el-cascader>
          </el-form-item>
        </el-col>
        <el-col :span="12"></el-col>

        <el-col :span="12">
          <el-form-item label="商品品牌" prop="goodsBrandId">
            <el-select v-model="formData.goodsBrandId" placeholder="请选择品牌" style="width: 100%" clearable>
              <el-option v-for="item in brandOptions" :key="item.id" :label="item.attributeName" :value="item.id" :disabled="!item.status" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12"></el-col>

        <el-col :span="12">
          <el-form-item label="产品保障" prop="goodsEnsureIds">
            <el-select v-model="formData.goodsEnsureIds" placeholder="请选择产品保障" style="width: 100%" clearable multiple>
              <el-option v-for="item in guaranteeOptions" :key="item.id" :label="item.attributeName" :value="item.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12"></el-col>

        <el-col :span="12">
          <el-form-item label="产品功能" prop="goodsAbilityIds">
            <el-select v-model="formData.goodsAbilityIds" placeholder="请选择产品功能" style="width: 100%" clearable multiple>
              <el-option v-for="item in functionOptions" :key="item.id" :label="item.attributeName" :value="item.id" />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="24">
          <el-form-item label="商品主图" prop="titleFileList" class="uploadcss">
            <el-upload
              :file-list="hnGoodsFilesList"
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
          <el-form-item label="库存预警下限" prop="goodsAlert">
            <el-input v-model="formData.goodsAlert" placeholder="请输入商品库存预警下限" />
          </el-form-item>
        </el-col>
        <el-col :span="12"></el-col>
        <el-col :span="12">
          <el-form-item label="商品规格" prop="goodsSpecification">
            <el-select
              v-model="formData.goodsSpecification"
              placeholder="请选择商品规格"
              style="width: 100%"
              clearable
              @change="updateTableGoodsSpecification"
            >
              <el-option v-for="dict in goods_specification" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24" v-show="formData.goodsSpecification">
          <div class="form-flex">
            <div class="flex-text">自定义添加规格，以更精准描述产品。</div>
            <el-button class="flex-buttom" @click="addTableCell" type="primary" plain>新增规格值</el-button>
          </div>

          <el-table :data="hnGoodsSpecificationDataList" border style="width: 100%">
            <el-table-column prop="goodsSpecificationValue" label="单位" align="center">
              <template #header>
                <span class="required" aria-label="必填项">
                  {{ selectedSpecification(formData.goodsSpecification) }}
                </span>
              </template>

              <template #default="scope">
                <el-input
                  v-model="scope.row.goodsSpecificationValue"
                  placeholder="请输入商品规格值"
                  type="number"
                  :min="0"
                  :max="999999"
                  :class="{ 'is-error': scope.row.errors && scope.row.errors.goodsSpecificationValue }"
                ></el-input>
                <div class="validation-errors" v-if="scope.row.errors && scope.row.errors.goodsSpecificationValue">
                  {{ scope.row.errors.goodsSpecificationValue }}
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="goodsPrice" label="销售价" align="center">
              <template #header>
                <span class="required">销售价</span>
              </template>
              <template #default="scope">
                <el-input
                  v-model="scope.row.goodsPrice"
                  placeholder="请输入销售价"
                  type="number"
                  :min="0"
                  :max="999999"
                  :disabled="id ? (scope.row.id ? true : false) : false"
                  :class="{ 'is-error': scope.row.errors && scope.row.errors.goodsPrice }"
                ></el-input>

                <div class="validation-errors" v-if="scope.row.errors && scope.row.errors.goodsPrice">
                  {{ scope.row.errors.goodsPrice }}
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="goodsStock" label="可用库存" align="center">
              <template #header>
                <span class="required">可用库存</span>
              </template>
              <template #default="scope">
                <el-input
                  v-model="scope.row.goodsStock"
                  type="number"
                  :min="0"
                  :max="999999"
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
                <!-- 删除按钮仅在数据多于一条时显示 -->
                <el-button
                  v-if="hnGoodsSpecificationDataList.length > 1"
                  v-throttle
                  link
                  @click="removeTableCell(scope.$index, scope.row)"
                  type="primary"
                >
                  删除行
                </el-button>
                <!-- 启用/禁用 -->
                <el-button v-throttle link @click="toggleStatus(scope.row)" type="primary">
                  {{ scope.row.status == 0 ? '启用' : '禁用' }}
                </el-button>
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
            <el-radio value="1" size="large">上架</el-radio>
            <el-radio value="0" size="large">下架</el-radio>
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
        <el-col :span="3"><el-button v-throttle type="primary" @click="submitForm">提交商品</el-button></el-col>
        <el-col :span="3"><el-button v-throttle @click="submitClose">返回</el-button></el-col>
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
import router from '@/router';
import { Category } from '@/api/supplier/productManagement/types'; //ts类型
import { ossUploadImage, goodsAdd, goodsUpdate, goodsId } from '@/api/supplier/productManagement/product';
import { getProductCategoryList } from '@/api/platform/mallConfiguration/productCategory'; //商品类目
import { goodsAttributesAllList } from '@/api/platform/mallConfiguration/productAttributeLabel'; //商品保障+功能+品牌：
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { goods_specification } = toRefs<any>(proxy?.useDict('goods_specification'));
// 获取router路由参数
const route = useRoute();
const { id, copyid } = route.query;
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
const hnGoodsFilesList = ref<any[]>([]);
const imgList = ref<any[]>([]);
let timer: NodeJS.Timeout | null = null;
// 图片预览
const picOpen = ref(false);
const dialogImageUrl = ref('');
// 表格数据
const hnGoodsSpecificationDataList = ref<any[]>([
  {
    goodsSpecification: '', //商品规格
    goodsSpecificationValue: '', //商品规格值
    goodsPrice: '', //商品价格
    goodsStock: '', //商品库存
    status: 1 //状态（0：禁用 1：启用）
  }
]);
// 表单数据
const formData = ref({
  // 基础信息
  goodsName: '', //商品名称
  goodsCode: '', //商品编码
  goodsCategoryId: '', //商品类目
  goodsBrandId: '', //商品品牌
  goodsEnsureIds: '', //产品保障
  goodsAbilityIds: '', //产品功能
  goodsInfo: '', //商品介绍
  goodsDetail: '', //商品详情
  goodsAlert: '', //库存下限
  imagePathMain: '', //主图

  // 服务信息
  status: '1', //上架状态
  launchTime: '', //上架时间

  // 规格
  goodsSpecification: '', //商品规格
  imageList: []
});

// 表单校验规则
const FormRulesarr: FormRules = {
  goodsName: [
    { required: true, message: '请输入商品名称，最多支持60个字符，30个汉字。', trigger: 'blur' },
    {
      validator: (rule: any, value: any, callback: any) => {
        if (!value || value.trim() === '') {
          callback(new Error('请输入商品名称，最多支持60个字符，30个汉字。'));
          return;
        }

        // 验证长度（100字节）
        if (new Blob([value]).size > 100) {
          callback(new Error('请输入商品名称，最多支持60个字符，30个汉字。'));
          return;
        }
        if (value.length > 60) {
          callback(new Error('请输入商品名称，最多支持60个字符，30个汉字。'));
          return;
        }
        if (value.match(/[\u4e00-\u9fa5]/g).length > 30) {
          callback(new Error('请输入商品名称，最多支持60个字符，30个汉字。'));
        }
        callback();
      },
      trigger: 'blur'
    }
  ],
  goodsCategoryId: [{ required: true, message: '请选择商品类目', trigger: 'change' }],
  goodsBrandId: [{ required: true, message: '请选择产品品牌', trigger: 'change' }],
  goodsEnsureIds: [{ required: true, message: '请选择产品保障', trigger: 'change' }],
  goodsAbilityIds: [{ required: true, message: '请选择产品功能', trigger: 'change' }],
  goodsInfo: [{ required: true, message: '请输入商品介绍', trigger: 'change' }],
  goodsDetail: [{ required: true, message: '请输入商品详情', trigger: 'change' }],
  goodsAlert: [{ required: true, message: '请输入库存预警下限', trigger: 'change' }],
  goodsSpecification: [{ required: true, message: '请选择商品规格', trigger: 'change' }],
  status: [{ required: true, message: '请选择上架状态', trigger: 'change' }],
  launchTime: [{ required: true, message: '请选择上架时间', trigger: 'change' }],
  titleFileList: [
    {
      validator: (rule: any, value: any, callback: any) => {
        if (!hnGoodsFilesList.value || hnGoodsFilesList.value.length === 0) {
          callback(new Error('请上传至少一张商品主图'));
        } else {
          callback();
        }
      },
      trigger: 'change'
    }
  ], // 新增规格值校验规则
  goodsSpecificationValue: [{ required: true, message: '请输入单位规格', trigger: 'blur' }]
};

// 提交商品
const submitForm = () => {
  if (!refForm.value) return;

  refForm.value.validate((valid: boolean) => {
    if (!valid) {
      return;
    }

    // 规格值表格校验
    const isValid = validateAndSubmit();
    if (!isValid) return;

    const requestData = {
      ...formData.value,
      hnGoodsFilesList: hnGoodsFilesList.value,
      hnGoodsSpecificationDataList: hnGoodsSpecificationDataList.value.map((spec) => ({
        goodsSpecification: spec.goodsSpecification,
        goodsSpecificationValue: spec.goodsSpecificationValue,
        goodsPrice: parseFloat(spec.goodsPrice),
        goodsStock: parseInt(spec.goodsStock, 10),
        status: spec.status
      }))
    };
    console.log('提交数据', requestData);

    if (id) {
      goodsUpdate(requestData).then(() => {
        ElMessage.success('修改成功');
        router.push({
          path: '/supplier/sales/product/list'
        });
      });
    } else {
      goodsAdd(requestData).then(() => {
        ElMessage.success('新增成功');
        router.push({
          path: '/supplier/sales/product/list'
        });
      });
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
    .then(() => {
      router.push({
        path: '/supplier/sales/product/list'
      });
    })
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
  const findex = hnGoodsFilesList.value.map((f: any) => f.path).indexOf(file.path);
  if (findex > -1) {
    hnGoodsFilesList.value.splice(findex, 1);
  }
};

// 上传
const uploadFile = (file: any) => {
  return new Promise((resolve, reject) => {
    // imgList.value.push(file);

    // 防止重复触发，清除已有的定时器
    if (timer) {
      clearTimeout(timer);
    }

    // 设置新的定时器
    timer = setTimeout(() => {
      processUpload(file, resolve, reject);
    }, 500);
  });
};

// 处理上传逻辑
const processUpload = (file: any, resolve: any, reject: any) => {
  const fileData = file.file;
  ossUploadImage({ file: fileData })
    .then((response) => {
      const newFile = {
        name: response.data.fileName || '商品主图',
        url: response.data.url,
        fileType: '0',
        ossId: response.data.ossId
      };

      hnGoodsFilesList.value.push(newFile); // 添加到文件列表
      proxy?.$modal.closeLoading(); // 关闭 loading
      resolve(newFile); // 上传成功，调用 resolve
    })
    .catch((error) => {
      proxy?.$modal.closeLoading(); // 关闭 loading
      ElMessage.error(error.msg || '文件上传失败，请重试'); // 显示错误信息
      refShop.value.handleRemove(file); // 移除失败的文件
      reject(error); // 上传失败，调用 reject
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
  hnGoodsSpecificationDataList.value.push({
    goodsSpecification: formData.value.goodsSpecification, //商品规格
    goodsSpecificationValue: '', //商品规格值
    goodsPrice: '', //商品价格
    goodsStock: '', //商品库存
    status: 1 //状态（0：禁用 1：启用）
  });
};

// table删除
const removeTableCell = (index: number, row: any) => {
  ElMessageBox.confirm('您确定要删除该数据?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      hnGoodsSpecificationDataList.value.splice(index, 1);
    })
    .catch(() => {});
};

/**
 * 验证规格信息
 * @param contact - 包含联系人信息的对象
 * @returns 包含验证错误信息的对象，如果没有错误则返回空对象
 */
const validateContact = (contact: any) => {
  const errorsValue: { goodsSpecificationValue?: string; goodsPrice?: string; goodsStock?: string } = {};

  // 单位（必填）
  if (!contact.goodsSpecificationValue || contact.goodsSpecificationValue.trim() === '') {
    errorsValue.goodsSpecificationValue = '请输入单位规格';
  }

  // 销售价（必填且必须为大于0的数字）
  if (!contact.goodsPrice) {
    errorsValue.goodsPrice = '请输入销售价';
  } else if (isNaN(contact.goodsPrice) || parseFloat(contact.goodsPrice) <= 0) {
    errorsValue.goodsPrice = '销售价必须为大于0的数字';
  }

  // 可用库存（必填且必须为非负整数）
  if (!contact.goodsStock) {
    errorsValue.goodsStock = '请输入可用库存';
  } else if (!Number.isInteger(Number(contact.goodsStock)) || parseInt(contact.goodsStock, 10) < 0) {
    errorsValue.goodsStock = '可用库存必须为非负整数';
  }

  return errorsValue;
};

/**
 * 验证规格值
 */
const validateAndSubmit = () => {
  let isValid = true;

  // 验证所有联系人
  hnGoodsSpecificationDataList.value.forEach((contact) => {
    const errors = validateContact(contact);
    contact.errors = errors;

    if (Object.keys(errors).length > 0) {
      isValid = false;
    }
  });

  // 检查是否所有联系人都被禁用
  const allDisabled = hnGoodsSpecificationDataList.value.length > 0 && hnGoodsSpecificationDataList.value.every((contact) => contact.status == 0);

  if (allDisabled) {
    proxy?.$modal.msgError('必须启用至少一个规格');
    return false;
  }

  if (isValid) {
    return true;
  } else {
    proxy?.$modal.msgError('请检查并修正价格与库存中的错误');
    return false;
  }
};
// 表格中规格行的单位显示
const selectedSpecification = (value: string) => {
  const dict = goods_specification.value.find((item: any) => item.value === value);
  return dict ? dict.label : '';
};

/**
 * 更新表格中所有行的商品规格
 * @param selectedSpecification - 用户选择的商品规格
 */
const updateTableGoodsSpecification = (selectedSpecification: string) => {
  hnGoodsSpecificationDataList.value.forEach((item) => {
    item.goodsSpecification = selectedSpecification; // 更新每一行的商品规格
  });
};

// 切换行的启用/禁用状态
const toggleStatus = (row: any) => {
  row.status = row.status === 1 ? 0 : 1; // 切换状态（1：启用，0：禁用）
};

// 生命周期钩子
onMounted(async () => {
  const response = await getProductCategoryList({ status: '0' });
  if (response.code === 200) {
    creditList.value = proxy?.handleTree<Category>(response.data, 'id');
  }

  const data = await goodsAttributesAllList();
  console.log('商品保障+功能+品牌', data);

  // 模拟品牌数据
  brandOptions.value = data.brandList || [];
  // 模拟保障数据
  guaranteeOptions.value = data.guaranteeList || [];
  // 模拟功能数据
  functionOptions.value = data.functionList || [];

  if (id || copyid) {
    const ids = id || copyid;
    const detailResponse = await goodsId(ids as string); // 调用详情接口
    if (detailResponse.code === 200) {
      const data = detailResponse.data;
      if (copyid) {
        delete data.id;
        delete data.enterpriseId;
        delete data.goodsCode;
      }
      console.log('商品详情数据', data);
      formData.value = {
        ...data
      };
      if (data.sysOssLists && data.sysOssLists.length > 0) {
        hnGoodsFilesList.value = data.sysOssLists.map((file) => ({
          name: file.originalName || '商品主图',
          url: file.url,
          fileType: '1',
          ossId: file.ossId,
          path: file.url
        }));
        hnGoodsSpecificationDataList.value = data.hnGoodsSpecificationDataList;
      }
    }
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

.validation-errors {
  color: #f56c6c;
  font-size: 12px;
  line-height: 1.5;
  margin-top: 4px;
  min-height: 18px;
  text-align: left;
}
</style>
