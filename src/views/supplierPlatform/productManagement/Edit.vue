<!--
  文件: productManagement/Edit.vue
  功能: 商品编辑
  说明: 用于商品编辑页面
  版本: 1.0
  作者: 刘景彪
  创建日期: 2025-10-15
-->
<template>
  <div class="supplier-edit-details">
    <!-- 基本信息 -->
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
                label: 'categoryName',
                children: 'children'
              }"
            />
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

      <!-- 价格与库存 -->
      <div class="content-form-title">价格与库存</div>
      <el-row>
        <el-col :span="12">
          <el-form-item label="库存预警下限" prop="goodsAlert">
            <el-input
              v-model="formData.goodsAlert"
              placeholder="请输入商品库存预警下限"
              inputmode="numeric"
              @input="(val) => onInputDigits(val, formData, 'goodsAlert', { maxLen: 9 })"
              @keypress="onKeypressDigits"
            />
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
            <el-table-column prop="goodsWeight" label="KG(计重)" align="center">
              <template #header>
                <span class="required">KG(计重)</span>
              </template>
              <template #default="scope">
                <el-input
                  v-model="scope.row.goodsWeight"
                  placeholder="请输入KG(计重)"
                  type="number"
                  :min="0"
                  :max="999999"
                  @input="(val) => onInputPrice(val, scope.row, 'goodsWeight')"
                  :class="{ 'is-error': scope.row.errors && scope.row.errors.goodsWeight }"
                />
                <div class="validation-errors" v-if="scope.row.errors && scope.row.errors.goodsWeight">
                  {{ scope.row.errors.goodsWeight }}
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="goodsSpecificationValue" label="单位" align="center">
              <template #header>
                <span class="required">
                  {{ selectedSpecification(formData.goodsSpecification) }}
                </span>
              </template>
              <template #default="scope">
                <el-input
                  v-model="scope.row.goodsSpecificationValue"
                  placeholder="请输入商品规格值"
                  inputmode="numeric"
                  @input="(val) => onInputDigits(val, scope.row, 'goodsSpecificationValue')"
                  @keypress="onKeypressDigits"
                />
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
                  @input="(val) => onInputPrice(val, scope.row, 'goodsPrice')"
                  :disabled="operateMode == 'edit' ? (scope.row.id ? true : false) : false"
                  :class="{ 'is-error': scope.row.errors && scope.row.errors.goodsPrice }"
                />
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
                  placeholder="请输入可用库存"
                  inputmode="numeric"
                  @input="(val) => onInputDigits(val, scope.row, 'goodsStock')"
                  @keypress="onKeypressDigits"
                />
                <div class="validation-errors" v-if="scope.row.errors && scope.row.errors.goodsStock">
                  {{ scope.row.errors.goodsStock }}
                </div>
              </template>
            </el-table-column>

            <el-table-column label="操作" align="center">
              <template #default="scope">
                <el-button v-if="hnGoodsSpecificationDataList.length > 1" v-throttle link @click="removeTableCell(scope.$index)" type="primary">
                  删除行
                </el-button>
                <el-button v-throttle link @click="toggleStatus(scope.row)" type="primary">
                  {{ scope.row.status == 0 ? '启用' : '禁用' }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-col>
      </el-row>

      <div class="line" style="margin-top: 18px"></div>

      <!-- 服务信息 -->
      <div class="content-form-title">服务信息</div>
      <div>
        <el-form-item label="上架状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio value="1" size="large">上架</el-radio>
            <el-radio value="0" size="large">下架</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="上架时间" prop="launchTime" v-if="formData.status == '1'">
          <el-date-picker
            v-model="formData.launchTime"
            value-format="YYYY-MM-DD HH:mm:ss"
            type="datetime"
            placeholder="请选择日期时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="下架时间" prop="takeDownTime" v-if="formData.status == '0'">
          <el-date-picker
            v-model="formData.takeDownTime"
            value-format="YYYY-MM-DD HH:mm:ss"
            type="datetime"
            placeholder="请选择日期时间"
            style="width: 100%"
          />
        </el-form-item>
      </div>

      <div class="line" style="margin-top: 18px"></div>

      <!-- 操作按钮 -->
      <el-row type="flex" justify="center" :gutter="5">
        <el-col :span="3"><el-button v-throttle type="primary" @click="submitForm">提交商品</el-button></el-col>
        <el-col :span="3"><el-button v-throttle @click="submitClose">返回</el-button></el-col>
      </el-row>
    </el-form>

    <!-- 图片预览 -->
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
// ==========================
// 导入（分组、补全缺失 API）
// ==========================
import { ref, onMounted, getCurrentInstance, toRefs, type ComponentInternalInstance } from 'vue';
import { ElMessage, ElMessageBox, ElForm, type FormRules } from 'element-plus';
import { Category, GoodsAttributesResponse, HnGoodsVo } from '@/api/supplier/productManagement/types';
import { ossUploadImage, goodsAdd, goodsUpdate, goodsId } from '@/api/supplier/productManagement/product';
import { getProductCategoryList } from '@/api/platform/mallConfiguration/productCategory';
import { goodsAttributesAllList } from '@/api/platform/mallConfiguration/productAttributeLabel';

// ==========================
// Props/Emits
// ==========================
const props = defineProps<{
  id: string | number | null;
  type: 'add' | 'edit' | 'copy';
}>();

const emit = defineEmits<{
  (e: 'success'): void;
  (e: 'cancel'): void;
  // 兼容旧事件
}>();

// ==========================
// 字典/常量/状态
// ==========================
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { goods_specification } = toRefs<any>(proxy?.useDict('goods_specification'));

const refForm = ref<InstanceType<typeof ElForm> | null>(null);
const refShop = ref();

const creditList = ref<any[]>([]);
const brandOptions = ref<any[]>([]);
const guaranteeOptions = ref<any[]>([]);
const functionOptions = ref<any[]>([]);

const operateMode = ref(props.type);

// ==========================
// 图片上传：状态 & 预览
// ==========================
const fileSize = ref(5);
const fileType = ref(['png', 'jpg', 'jpeg', 'bmp']);
const hnGoodsFilesList = ref<any[]>([]);
let timer: NodeJS.Timeout | null = null;

// 图片预览
const picOpen = ref(false);
const dialogImageUrl = ref('');

// ==========================
// 表格数据 & 表单数据
// ==========================
const hnGoodsSpecificationDataList = ref<any[]>([
  { goodsSpecification: '', goodsSpecificationValue: '', goodsPrice: '', goodsStock: '', goodsWeight: '', status: 1 }
]);

// 表单数据
const formData = ref<HnGoodsVo>({
  goodsName: '',
  goodsCode: '',
  goodsCategoryId: '',
  goodsBrandId: '',
  goodsInfo: '',
  goodsDetail: '',
  goodsAlert: '',
  status: '1',
  launchTime: '',
  goodsEnsureIds: [] as Array<string | number>,
  goodsAbilityIds: [] as Array<string | number>,
  goodsSpecification: '',
  imageList: []
});

// ==========================
// 表单校验（与 UI 规则一致）
// ==========================
const FormRulesarr: FormRules = {
  goodsName: [
    { required: true, message: '请输入商品名称，最多支持60个字符，30个汉字。', trigger: 'blur' },
    {
      validator: (rule: any, value: any, callback: any) => {
        if (!value || value.trim() === '') return callback(new Error('请输入商品名称，最多支持60个字符，30个汉字。'));
        if (new Blob([value]).size > 100) return callback(new Error('请输入商品名称，最多支持60个字符，30个汉字。'));
        if (value.length > 60) return callback(new Error('请输入商品名称，最多支持60个字符，30个汉字。'));
        const zh = value.match(/[\u4e00-\u9fa5]/g) || [];
        if (zh.length > 30) return callback(new Error('请输入商品名称，最多支持60个字符，30个汉字。'));
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
  goodsAlert: [
    { required: true, message: '请输入库存预警下限', trigger: 'change' },
    {
      validator: (_: any, value: any, callback: any) => {
        // 正整数
        if (!/^[1-9]\d*$/.test(String(value ?? ''))) {
          callback(new Error('库存预警下限必须为正整数'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ],
  goodsSpecification: [{ required: true, message: '请选择商品规格', trigger: 'change' }],
  status: [{ required: true, message: '请选择上架状态', trigger: 'change' }],
  launchTime: [{ required: true, message: '请选择上架时间', trigger: 'change' }],
  takeDownTime: [{ required: true, message: '请选择下架时间', trigger: 'change' }],
  titleFileList: [
    {
      validator: (_: any, __: any, callback: any) => {
        if (!hnGoodsFilesList.value || hnGoodsFilesList.value.length === 0) callback(new Error('请上传至少一张商品主图'));
        else callback();
      },
      trigger: 'change'
    }
  ],
  goodsSpecificationValue: [{ required: true, message: '请输入单位规格', trigger: 'blur' }]
};

// ==========================
// 提交/取消
// ==========================
const submitForm = () => {
  if (!refForm.value) return;
  refForm.value.validate(async (valid: boolean) => {
    if (!valid) return;
    const isValid = validateAndSubmit();
    if (!isValid) return;

    const requestData = {
      ...formData.value,
      hnGoodsFilesList: hnGoodsFilesList.value,
      hnGoodsSpecificationDataList: hnGoodsSpecificationDataList.value.map((spec) => ({
        goodsWeight: spec.goodsWeight,
        goodsSpecification: spec.goodsSpecification,
        goodsSpecificationValue: spec.goodsSpecificationValue,
        goodsPrice: parseFloat(spec.goodsPrice),
        goodsStock: parseInt(spec.goodsStock, 10),
        status: spec.status
      }))
    };

    if (operateMode.value === 'edit') {
      await goodsUpdate(requestData);
      ElMessage.success('修改成功');
    } else {
      await goodsAdd(requestData);
      ElMessage.success('新增成功');
    }
    emit('success');
  });
};

// 取消
const submitClose = () => {
  ElMessageBox.confirm('确定关闭表单？', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' })
    .then(() => emit('cancel'))
    .catch(() => {});
};

// ==========================
// 图片预览/上传相关方法（聚合至同一区域）
// ==========================
// 预览关闭
const picPreBeforeClose = () => {
  dialogImageUrl.value = '';
  picOpen.value = false;
};
// 预览
const handlePictureCardPreview = (file: any) => {
  dialogImageUrl.value = file.url;
  picOpen.value = true;
};
// 删除图片
const handleDelete = (file: any) => {
  const findex = hnGoodsFilesList.value.map((f: any) => f.path).indexOf(file.path);
  if (findex > -1) hnGoodsFilesList.value.splice(findex, 1);
};

// 上传
const uploadFile = (file: any) =>
  new Promise((resolve, reject) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => processUpload(file, resolve, reject), 500);
  });

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
      hnGoodsFilesList.value.push(newFile);
      proxy?.$modal.closeLoading();
      resolve(newFile);
    })
    .catch((error) => {
      proxy?.$modal.closeLoading();
      ElMessage.error(error.msg || '文件上传失败，请重试');
      refShop.value.handleRemove(file);
      reject(error);
    });
};

const handleExceed = () => ElMessage.error(`上传文件数量不能超过 5 个!`);

const handleBeforeUpload = (file: any) => {
  let isImg = false;
  if (fileType.value.length) {
    let fileExtension = '';
    if (file.name.lastIndexOf('.') > -1) fileExtension = file.name.slice(file.name.lastIndexOf('.') + 1);
    isImg = fileType.value.some((type) => file.type.indexOf(type) > -1 || (fileExtension && fileExtension.indexOf(type) > -1));
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
  proxy?.$modal.loading('正在上传图片，请稍候...');
  return true;
};

// ==========================
// 表格相关（规格/状态）
// ==========================
// 新增/删除
const addTableCell = () => {
  hnGoodsSpecificationDataList.value.push({
    goodsSpecification: formData.value.goodsSpecification,
    goodsSpecificationValue: '',
    goodsPrice: '',
    goodsStock: '',
    goodsWeight: '',
    status: 1
  });
};
const removeTableCell = (index: number) => {
  ElMessageBox.confirm('您确定要删除该数据?', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' })
    .then(() => hnGoodsSpecificationDataList.value.splice(index, 1))
    .catch(() => {});
};

// 单行校验/整表校验
const validateContact = (contact: any) => {
  const errorsValue: { goodsWeight?: string; goodsSpecificationValue?: string; goodsPrice?: string; goodsStock?: string } = {};
  if (!contact.goodsWeight || contact.goodsWeight.trim() === '') errorsValue.goodsWeight = '请输入商品重量';
  if (!contact.goodsWeight) errorsValue.goodsWeight = '请输入商品重量';
  if (!contact.goodsSpecificationValue || contact.goodsSpecificationValue.trim() === '') errorsValue.goodsSpecificationValue = '请输入单位规格';
  if (!contact.goodsPrice) errorsValue.goodsPrice = '请输入销售价';
  else if (isNaN(contact.goodsPrice) || parseFloat(contact.goodsPrice) <= 0) errorsValue.goodsPrice = '销售价必须为大于0的数字';
  if (!contact.goodsStock) errorsValue.goodsStock = '请输入可用库存';
  else if (!Number.isInteger(Number(contact.goodsStock)) || parseInt(contact.goodsStock, 10) < 0) errorsValue.goodsStock = '可用库存必须为非负整数';
  return errorsValue;
};
const validateAndSubmit = () => {
  let isValid = true;
  hnGoodsSpecificationDataList.value.forEach((c) => {
    const errors = validateContact(c);
    c.errors = errors;
    if (Object.keys(errors).length > 0) isValid = false;
  });
  const allDisabled = hnGoodsSpecificationDataList.value.length > 0 && hnGoodsSpecificationDataList.value.every((c) => c.status == 0);
  if (allDisabled) {
    proxy?.$modal.msgError('必须启用至少一个规格');
    return false;
  }
  if (!isValid) proxy?.$modal.msgError('请检查并修正价格与库存中的错误');
  return isValid;
};
// 规格显示/更新/启用禁用
const selectedSpecification = (value: string) => {
  const dict = goods_specification.value.find((item: any) => item.value === value);
  return dict ? dict.label : '';
};
const updateTableGoodsSpecification = (selected: string) => {
  hnGoodsSpecificationDataList.value.forEach((item) => (item.goodsSpecification = selected));
};
const toggleStatus = (row: any) => {
  row.status = row.status === 1 ? 0 : 1;
};

const onInputPrice = (val: string, row: any, type: string) => {
  // 只允许数字和小数点，且最多两位小数
  let s = val
    .replace(/[^\d.]/g, '') // 只保留数字和小数点
    .replace(/^0+(\d)/, '$1') // 去除多余前导0
    .replace(/\.{2,}/g, '.') // 只保留第一个小数点
    .replace('.', '$#$')
    .replace(/\./g, '')
    .replace('$#$', '.'); // 只保留第一个小数点
  if (s.indexOf('.') > -1) {
    s = s.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3'); // 保留两位小数
  }
  if (type === 'goodsWeight') {
    row.goodsWeight = s;
    return;
  } else if (type === 'goodsPrice') {
    row.goodsPrice = s;
  }
};

// ==========================
// 通用输入过滤（数字）
// ==========================
// 过滤出纯数字（可选长度限制）
const filterDigits = (val: string, opts?: { maxLen?: number }) => {
  let s = (val ?? '').replace(/\D/g, '');
  if (opts?.maxLen) s = s.slice(0, opts.maxLen);
  return s;
};

// 通用：把输入值写入任意对象的任意键
const onInputDigits = (val: string, obj: Record<string, any>, key: string, opts?: { maxLen?: number }) => {
  obj[key] = filterDigits(val, opts);
};

// 屏蔽非数字按键（保留常见控制键）
const onKeypressDigits = (e: KeyboardEvent) => {
  const key = e.key;
  if (!/[0-9]/.test(key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'].includes(key)) {
    e.preventDefault();
  }
};

// ==========================
// 生命周期
// ==========================
onMounted(async () => {
  // 类目
  const response = await getProductCategoryList();
  if (response.code === 200) {
    creditList.value = proxy?.handleTree<Category>(response.data, 'id') || [];
  }
  // 品牌/保障/功能
  const data = await goodsAttributesAllList();
  const { brandList = [], guaranteeList = [], functionList = [] } = (data ?? {}) as Partial<GoodsAttributesResponse>;
  brandOptions.value = brandList;
  guaranteeOptions.value = guaranteeList;
  functionOptions.value = functionList;

  // 根据 props 初始化
  operateMode.value = props.type;
  refForm.value?.resetFields?.();
  hnGoodsFilesList.value = [];
  hnGoodsSpecificationDataList.value = [
    { goodsSpecification: '', goodsSpecificationValue: '', goodsPrice: '', goodsStock: '', goodsWeight: '', status: 1 }
  ];

  if (props.id) {
    const detailResponse = await goodsId(String(props.id));
    if (detailResponse.code === 200) {
      const data = detailResponse.data;
      if (props.type === 'copy') {
        // 复制商品时，清除唯一标识和敏感字段，主图和规格不带入，仅保留基础信息
        formData.value.goodsName = data.goodsName || '';
        formData.value.goodsCode = ''; // 商品编码清空，复制时由后端生成
        formData.value.goodsCategoryId = data.goodsCategoryId || '';
        formData.value.goodsBrandId = data.goodsBrandId || '';
        formData.value.goodsInfo = data.goodsInfo || '';
        formData.value.goodsDetail = data.goodsDetail || '';
        formData.value.goodsAlert = data.goodsAlert || '';
        formData.value.status = data.status || '1';
        // launchTime赋值为当前时间
        const now = new Date();
        const pad = (n: number) => (n < 10 ? '0' + n : n);
        formData.value.launchTime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
        formData.value.goodsEnsureIds = data.goodsEnsureIds || [];
        formData.value.goodsAbilityIds = data.goodsAbilityIds || [];
        formData.value.goodsSpecification = data.goodsSpecification || '';
        formData.value.imageList = [];
        hnGoodsSpecificationDataList.value = data.hnGoodsSpecificationDataList.map((item: any) => ({
          goodsSpecification: item.goodsSpecification || '',
          goodsSpecificationValue: item.goodsSpecificationValue || '',
          goodsPrice: item.goodsPrice || '',
          goodsStock: item.goodsStock || '',
          goodsWeight: item.goodsWeight || '',
          status: item.status || 1
        }));
      } else {
        // 编辑/查看时直接赋值
        formData.value = { ...data };
        if (data.sysOssLists && data.sysOssLists.length > 0) {
          hnGoodsSpecificationDataList.value = data.hnGoodsSpecificationDataList;
        }
      }

      // 主图和规格数据不带入
      hnGoodsFilesList.value = data.sysOssLists.map((file: any) => ({
        name: file.originalName || '商品主图',
        url: file.url,
        fileType: '1',
        ossId: file.ossId,
        path: file.url
      }));
    }
  }
});
</script>

<style lang="scss" scoped>
/* 布局与样式（未更改，仅保留原样式） */
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
  ::v-deep .el-form-item__content {
    white-space: nowrap;
    display: inline-block;
  }
}
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
