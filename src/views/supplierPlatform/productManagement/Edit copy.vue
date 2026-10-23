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
      <FormHeader title="基本信息" />
      <el-row>
        <el-col :span="12">
          <el-form-item label="商品名称" prop="goodsName">
            <el-input v-model="formData.goodsName" placeholder="请输入商品名称" maxlength="30" show-word-limit />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="商品编码" prop="goodsCode">
            <el-input :disabled="true" v-model="formData.goodsCode" placeholder="自动生成" />
          </el-form-item>
        </el-col>

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

        <el-col :span="12">
          <el-form-item label="商品品牌" prop="goodsBrandId">
            <el-select v-model="formData.goodsBrandId" placeholder="请选择品牌" style="width: 100%" filterable clearable>
              <el-option v-for="item in brandOptions" :key="item.id" :label="item.attributeName" :value="item.id" :disabled="!item.status" />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="24">
          <el-form-item label="产品保障" prop="goodsEnsureIds">
            <el-select v-model="formData.goodsEnsureIds" placeholder="请选择产品保障" style="width: 100%" filterable clearable multiple>
              <el-option v-for="item in guaranteeOptions" :key="item.id" :label="item.attributeName" :value="item.id" />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="24">
          <el-form-item label="产品功能" prop="goodsAbilityIds">
            <el-select v-model="formData.goodsAbilityIds" placeholder="请选择产品功能" style="width: 100%" filterable clearable multiple>
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
              accept="image/png,image/jpeg,image/jpg,image/bmp"
              action="#"
              :on-preview="handlePictureCardPreview"
              :before-upload="handleBeforeUpload"
              :on-remove="handleDelete"
              :on-exceed="handleExceed"
            >
              <el-icon class="avatar-uploader-icon"><Plus /></el-icon>
            </el-upload>
            <div>1.将用于首页、活动等特定场景的展示</div>
            <div>2.建议图片比例1:1,像素高于需800*800px,小于10MB,格式为PNG/JPEG/JPG</div>
          </el-form-item>
        </el-col>

        <el-col :span="24">
          <el-form-item label="商品介绍" prop="goodsInfo">
            <el-input v-model="formData.goodsInfo" type="textarea" :rows="5" placeholder="请输入商品介绍" maxlength="300" show-word-limit />
          </el-form-item>
        </el-col>

        <el-col :span="24">
          <el-form-item label="商品详情" prop="goodsDetail">
            <editor v-model="formData.goodsDetail" :height="200" :minHeight="200" />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 价格与库存 -->
      <FormHeader title="价格与库存" />
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

          <el-table :data="hnGoodsSpecificationDataList" style="width: 100%">
            <el-table-column prop="goodsWeight" label="KG(计重)">
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
            <el-table-column prop="goodsSpecificationValue" label="单位">
              <template #header>
                <span class="required">
                  商品规格值
                  <!-- {{ selectedSpecification(formData.goodsSpecification) }} -->
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

            <el-table-column prop="goodsPrice" label="销售价">
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
                  :disabled="props.type === OperateMode.Edit ? (scope.row.id ? true : false) : false"
                  :class="{ 'is-error': scope.row.errors && scope.row.errors.goodsPrice }"
                />
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
                  inputmode="numeric"
                  @input="(val) => onInputDigits(val, scope.row, 'goodsStock')"
                  @keypress="onKeypressDigits"
                />
                <div class="validation-errors" v-if="scope.row.errors && scope.row.errors.goodsStock">
                  {{ scope.row.errors.goodsStock }}
                </div>
              </template>
            </el-table-column>

            <el-table-column fixed="right" label="操作">
              <template #default="scope">
                <el-button v-if="hnGoodsSpecificationDataList.length > 1" v-throttle link @click="removeTableCell(scope.$index)" type="primary">
                  删除行
                </el-button>
                <el-button v-throttle link @click="toggleStatus(scope.row)" type="primary">
                  {{ scope.row.status === SpecStatus.Disabled ? '启用' : '禁用' }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <div style="margin-top: 18px"></div>
        </el-col>
      </el-row>

      <!-- 服务信息 -->
      <FormHeader title="服务信息" />
      <div>
        <el-form-item label="上架状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :value="GoodsStatus.OnSale" size="large">上架</el-radio>
            <el-radio :value="GoodsStatus.OffSale" size="large">下架</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="上架时间" prop="launchTime" v-if="formData.status === GoodsStatus.OnSale">
          <el-date-picker
            v-model="formData.launchTime"
            value-format="YYYY-MM-DD HH:mm:ss"
            type="datetime"
            placeholder="请选择日期时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="下架时间" prop="takeDownTime" v-if="formData.status === GoodsStatus.OffSale">
          <el-date-picker
            v-model="formData.takeDownTime"
            value-format="YYYY-MM-DD HH:mm:ss"
            type="datetime"
            placeholder="请选择日期时间"
            style="width: 100%"
          />
        </el-form-item>
      </div>

      <div class="flex-center-end">
        <el-button v-throttle @click="submitClose">返回</el-button>
        <el-button v-throttle type="primary" @click="submitForm">{{ props.type === OperateMode.Edit ? '保存' : '提交' }}</el-button>
      </div>
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
    <!-- 商品裁剪 -->
    <el-dialog title="商品裁剪" v-model="cropOpen" width="800px" :close-on-click-modal="false" :close-on-press-escape="false" append-to-body>
      <goodsImgAvatar ref="cropperRef" :urlData="urlData" @success="onCropSuccess" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
// ==========================
import { ref, onMounted, getCurrentInstance, toRefs, type ComponentInternalInstance } from 'vue';
import { ElMessage, ElMessageBox, ElForm, type FormRules } from 'element-plus';
import { goodsAdd, goodsUpdate } from '@/api/supplier/productManagement/product';
import goodsImgAvatar from './goodsImgAvatar.vue';
import { GoodsStatus, OperateMode, SpecStatus } from '@/enums/goodsEnum';
import { mapGoodsSubmit } from './composables/mappers/goodsMapper';
import { useGoodsInit } from './composables/goods/useGoodsInit';

import {
  requiredRule,
  positiveIntegerRule,
  chineseLengthRule,
  uploadRequiredRule
} from '@/views/supplierPlatform/productManagement/composables/goods/validator';
// ==========================
// Props/Emits
// ==========================
const props = defineProps<{
  id: string | number | null;
  type: OperateMode;
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

const { formData, hnGoodsSpecificationDataList, hnGoodsFilesList, creditList, brandOptions, guaranteeOptions, functionOptions, init } =
  useGoodsInit();
// ==========================
// 图片上传：状态 & 预览
// ==========================
const fileSize = ref(5);
const fileType = ref(['png', 'jpg', 'jpeg', 'bmp']);
const timer: NodeJS.Timeout | null = null;
// 防抖/节流相关状态
const uploadBusy = ref(false);

// 简易防抖/节流工具
const debounce = (fn: (...args: any[]) => any, delay = 300) => {
  let t: any;
  return (...args: any[]) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
};
const throttle = (fn: (...args: any[]) => any, gap = 800) => {
  let last = 0;
  return (...args: any[]) => {
    const now = Date.now();
    if (now - last >= gap) {
      last = now;
      return fn(...args);
    }
  };
};

// 图片预览
const picOpen = ref(false); // 图片预览弹窗
const cropOpen = ref(false); // 商品裁剪弹窗
const dialogImageUrl = ref('');
const urlData = ref('');

// ==========================
// 表单校验（与 UI 规则一致）
// ==========================
const FormRulesarr: FormRules = {
  /** 商品名称 */
  goodsName: [requiredRule('请输入商品名称，30个汉字。'), chineseLengthRule(30, '请输入商品名称，30个汉字。')],
  /** 类目 */
  goodsCategoryId: [requiredRule('请选择商品类目', 'change')],
  /** 品牌 */
  goodsBrandId: [requiredRule('请选择产品品牌', 'change')],
  /** 保障 */
  goodsEnsureIds: [requiredRule('请选择产品保障', 'change')],
  /** 功能 */
  goodsAbilityIds: [requiredRule('请选择产品功能', 'change')],
  /** 商品介绍 */
  goodsInfo: [requiredRule('请输入商品介绍', 'change')],
  /** 商品详情 */
  goodsDetail: [requiredRule('请输入商品详情', 'change')],
  /** 库存预警 */
  goodsAlert: [requiredRule('请输入库存预警下限', 'change'), positiveIntegerRule('库存预警下限必须为正整数')],
  /** 规格 */
  goodsSpecification: [requiredRule('请选择商品规格', 'change')],
  /** 上架状态 */
  status: [requiredRule('请选择上架状态', 'change')],
  /** 上架时间 */
  launchTime: [requiredRule('请选择上架时间', 'change')],
  /** 下架时间 */
  takeDownTime: [requiredRule('请选择下架时间', 'change')],
  /** 主图上传 */
  titleFileList: [uploadRequiredRule(() => hnGoodsFilesList.value, '请上传至少一张商品主图')],
  /** 单位规格 */
  goodsSpecificationValue: [requiredRule('请输入单位规格')]
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

    const requestData = mapGoodsSubmit(formData.value, hnGoodsSpecificationDataList.value, hnGoodsFilesList.value);

    if (formData.value.status === GoodsStatus.OffSale) delete requestData.launchTime;
    if (formData.value.status === GoodsStatus.OnSale) delete requestData.takeDownTime;

    if (props.type === OperateMode.Edit) {
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
// 上传前校验
const _handleBefore = (file: any) => {
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
  // 防并发：忙碌锁避免快速重复打开裁剪弹窗
  if (uploadBusy.value) return false;
  uploadBusy.value = true;
  // 打开裁剪弹窗，走裁剪->提交->上传流程
  urlData.value = file;
  cropOpen.value = true;
  // 阻止 el-upload 默认上传
  return false;
};
// 对 beforeUpload 做轻量防抖，并且同步阻止默认上传
const debouncedBeforeUpload = debounce(_handleBefore, 300);
const handleBeforeUpload = (file: any) => {
  debouncedBeforeUpload(file);
  // 必须同步返回 false 才能阻止 el-upload 默认发请求
  return false;
};
// 超出数量限制
const handleExceed = () => ElMessage.error(`上传文件数量不能超过 5 个!`);

// 删除图片
const handleDelete = (file: any) => {
  const findex = hnGoodsFilesList.value.map((f: any) => f.path).indexOf(file.path);
  if (findex > -1) hnGoodsFilesList.value.splice(findex, 1);
  // 图片删除后，主动刷新“商品主图”校验（titleFileList）
  refForm.value?.validateField?.('titleFileList');
};

// 裁剪完成后上传
const onCropSuccess = (response: any) => {
  try {
    const newFile = {
      name: response.fileName || '商品主图',
      url: response.url,
      path: response.url,
      fileType: '0',
      ossId: response.ossId
    } as any;
    hnGoodsFilesList.value = [...hnGoodsFilesList.value, newFile];
    // 刷新“商品主图”校验
    refForm.value?.validateField?.('titleFileList');
    ElMessage.success('已添加裁剪后的商品图片');
  } catch (error: any) {
    ElMessage.error(error?.msg || '裁剪图片上传失败，请重试');
  } finally {
    cropOpen.value = false;
    uploadBusy.value = false;
  }
};

// 新增
const addTableCell = () => {
  hnGoodsSpecificationDataList.value.push({
    goodsSpecification: formData.value.goodsSpecification,
    goodsSpecificationValue: '',
    goodsPrice: '',
    goodsStock: '',
    goodsWeight: '',
    status: SpecStatus.Enabled
  });
};
// 删除
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

// 校验并提交
const validateAndSubmit = () => {
  let isValid = true;
  hnGoodsSpecificationDataList.value.forEach((c) => {
    const errors = validateContact(c);
    c.errors = errors;
    if (Object.keys(errors).length > 0) isValid = false;
  });
  const allDisabled =
    hnGoodsSpecificationDataList.value.length > 0 && hnGoodsSpecificationDataList.value.every((c) => c.status === SpecStatus.Disabled);
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
// 更新表格中的规格字段
const updateTableGoodsSpecification = (selected: string) => {
  hnGoodsSpecificationDataList.value.forEach((item) => (item.goodsSpecification = selected));
};

// 启用禁用规格
const toggleStatus = (row: any) => {
  row.status = row.status === SpecStatus.Enabled ? SpecStatus.Disabled : SpecStatus.Enabled;
};
// 输入价格过滤
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
  await init(props.type, props.id);
});
</script>

<style lang="scss" scoped>
/* 布局与样式（未更改，仅保留原样式） */
// .supplier-edit-details {
//   // padding: 24px;
// }
.line {
  height: 1px;
  background-color: #dcdfe6;
  margin: 40px 0px 30px 0px;
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

  ::v-deep .el-upload-list--picture-card {
    display: block;
    height: 114px;
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
    margin: 0 8px 8px 0;
  }
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
