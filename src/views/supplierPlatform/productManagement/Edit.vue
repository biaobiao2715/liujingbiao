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
    <el-form ref="refForm" :model="formData" :rules="formRules" label-width="120px">
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
            <el-button class="flex-buttom" @click="() => addTableCell()" type="primary" plain>新增规格值</el-button>
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
                  :disabled="isEditMode && scope.row.id"
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
                  {{ scope.row.status == 0 ? '启用' : '禁用' }}
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

      <div class="flex-center-end">
        <el-button v-throttle @click="submitClose">返回</el-button>
        <el-button v-throttle type="primary" @click="submitForm">{{ isEditMode ? '保存' : '提交' }}</el-button>
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
import { onMounted, getCurrentInstance, toRefs } from 'vue';
import type { ComponentInternalInstance } from 'vue';
import { ElForm, type FormInstance } from 'element-plus';
import goodsImgAvatar from './goodsImgAvatar.vue';
import { useGoodsEditPage } from './composables/goods/useGoodsEditPage';

const props = defineProps<{
  id: string | number | null;
  type: 'add' | 'edit' | 'copy';
}>();

const emit = defineEmits<{
  (e: 'success'): void;
  (e: 'cancel'): void;
}>();

const refForm = ref<InstanceType<typeof ElForm> | null>(null); // 表单引用

// 使用组合式函数获取页面逻辑，并解构需要的字段
const {
  formData,
  formRules,
  creditList,
  brandOptions,
  guaranteeOptions,
  functionOptions,
  images,
  imagesActions,
  specTable,
  specActions,
  inputFilter,
  init,
  submit,
  cancel,
  isEditMode
} = useGoodsEditPage(refForm, {
  onCancel: () => emit('cancel'),
  onSuccess: () => emit('success')
});

// 字典：商品规格
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { goods_specification } = toRefs<any>(proxy?.useDict('goods_specification') || {});

// 上传相关别名，方便模板使用
const hnGoodsFilesList = images;
const handlePictureCardPreview = imagesActions.preview;
const handleBeforeUpload = imagesActions.beforeUpload;
const handleDelete = imagesActions.remove;
const handleExceed = imagesActions.exceed;

// 输入过滤别名
const { onInputDigits, onKeypressDigits, onInputPrice } = inputFilter;

// 规格表格别名
const hnGoodsSpecificationDataList = specTable;
const addTableCell = specActions.addRow;
const removeTableCell = specActions.removeRow;
const updateTableGoodsSpecification = specActions.updateSpecification;
const toggleStatus = specActions.toggleStatus;

// 预览 / 裁剪弹窗绑定
const picOpen = imagesActions.picOpen;
const dialogImageUrl = imagesActions.dialogImageUrl;
const cropOpen = imagesActions.cropOpen;
const urlData = imagesActions.urlData;
const onCropSuccess = imagesActions.onCropSuccess;
const picPreBeforeClose = () => {
  picOpen.value = false;
};

// 提交/返回
const submitForm = () => {
  submit();
};
const submitClose = () => {
  cancel();
};

// 初始化页面
onMounted(() => {
  init(props.type, props.id);
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
