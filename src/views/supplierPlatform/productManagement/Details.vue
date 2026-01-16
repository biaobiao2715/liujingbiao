<!--
  标题: enterprise/index.vue
  功能: 商品详情
  说明: 用于商品详情查询
  当前版本: 1.0
  开发信息: Created by 刘景彪 2025-10-15
-->
<template>
  <div class="supplier-edit-details">
    <el-form :model="formData" label-width="140px">
      <FormHeader title="商品详情" />
      <el-row :gutter="20" class="detail-form">
        <el-col :span="12">
          <el-form-item label="商品名称">
            <el-input v-model="formData.goodsName" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="商品编码">
            <el-input v-model="formData.goodsCode" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="商品品牌">
            <el-select v-model="formData.goodsBrandId" placeholder="请选择品牌" style="width: 100%" disabled clearable>
              <el-option v-for="item in brandOptions" :key="item.id" :label="item.attributeName" :value="item.id" :disabled="!item.status" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="创建时间">
            <el-input v-model="formData.createTime" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="商品状态">
            <!-- <el-select v-model="formData.status" placeholder="请选择商品状态" filterable clearable disabled>
              <el-option v-for="dict in goods_status" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select> -->
            <dict-tag :options="goods_status" :value="formData.status ?? ''" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="上架时间">
            <el-input v-model="formData.launchTime" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="产品保障">
            <!-- <el-select v-model="formData.goodsEnsureIds" placeholder="请选择产品保障" style="width: 100%" disabled clearable multiple>
              <el-option v-for="item in guaranteeOptions" :key="item.id" :label="item.attributeName" :value="item.id" />
            </el-select> -->
            <el-tag type="info" v-for="item in formData.goodsAbilityNames" :key="item" :closeable="false" style="margin-right: 5px">{{
              item
            }}</el-tag>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="商品主图">
            <img v-if="formData.ossUrl" :src="formData.ossUrl" class="main-image" alt="商品主图" />
          </el-form-item>
        </el-col>
      </el-row>

      <FormHeader title="商品信息" />
      <el-table :data="tableList" style="width: 100%">
        <el-table-column prop="goodsName" label="商品名称" width="200" :show-overflow-tooltip="true">
          <template #default>
            <div class="spec-name">{{ formData.goodsName }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="goodsCode" label="商品编码" width="240">
          <template #default>
            <div class="spec-code">{{ formData.goodsCode }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="goodsWeight" label="KG(计重)" width="120"> </el-table-column>
        <el-table-column prop="goodsPrice" label="销售价" width="200">
          <template #default="scope">
            <span v-if="operateMode === 'view'" style="color: #108c58">{{ formatPrice(scope.row.goodsPrice) }}¥</span>
            <div v-if="operateMode === 'edit'" style="display: flex; align-items: center; gap: 8px">
              <el-input
                v-model="scope.row.goodsPrice"
                type="number"
                :min="0"
                step="0.01"
                placeholder="请输入价格"
                class="price-input"
                @input="handlePriceChange(scope.$index)"
              >
                <template #suffix>¥</template>
              </el-input>
              <el-tag v-if="isPriceModified(scope.$index)" type="warning" size="small">已修改</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="goodsSpecificationValue" label="商品规格值">
          <template #default="scope">
            <span>{{ scope.row.goodsSpecificationValue }}{{ selectedSpecification(scope.row.goodsSpecification) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="goodsStock" label="可用库存" />
      </el-table>

      <div style="height: 20px"></div>

      <div v-show="operateMode === 'edit'" class="flex-center-end">
        <el-button v-throttle type="primary" @click="submitForm">保存</el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, getCurrentInstance, toRefs } from 'vue';
import type { ComponentInternalInstance } from 'vue';
import { ElMessage } from 'element-plus';
import FormHeader from '@/components/FormHeader/index.vue';
import { GoodsAttributesResponse, HnGoodsVo, HnGoodsSpecificationData } from '@/api/supplier/productManagement/types';
import { goodsId, updateGoodsPrice } from '@/api/supplier/productManagement/product';
import { goodsAttributesAllList } from '@/api/platform/mallConfiguration/productAttributeLabel';

const props = defineProps<{
  id: string | number | null;
  type: 'view' | 'edit';
}>();

const emit = defineEmits<{
  (e: 'success'): void;
  (e: 'cancel'): void;
}>();

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { goods_status, goods_specification } = toRefs<any>(proxy?.useDict('goods_status', 'goods_specification') || {});

const formData = ref<HnGoodsVo>({
  id: undefined,
  goodsName: '',
  goodsCode: '',
  goodsEnsureId: undefined,
  goodsEnsureName: '',
  goodsBrandId: undefined,
  goodsBrandName: '',
  createTime: '',
  launchTime: '',
  takeDownTime: '',
  status: '',
  goodsAlert: undefined,
  goodsCategoryId: undefined,
  goodsCategoryName: '',
  goodsDetail: '',
  goodsInfo: '',
  goodsSpecification: '',
  goodsSpecificationName: '',
  hnGoodsFilesList: [],
  hnGoodsSpecificationDataList: []
});
const tableList = ref<HnGoodsSpecificationData[]>([]);
const originalTableList = ref<HnGoodsSpecificationData[]>([]); // 保存原始数据用于对比
const brandOptions = ref<any[]>([]);
const guaranteeOptions = ref<any[]>([]);
const operateMode = ref<'view' | 'edit'>(props.type);

// 规格显示/更新/启用禁用
const selectedSpecification = (value: string) => {
  const dict = goods_specification.value.find((item: any) => item.value === value);
  return dict ? dict.label : '';
};

// 价格格式化
const formatPrice = (price?: number) => {
  if (price === null || price === undefined || isNaN(Number(price))) return '--';
  return Number(price).toFixed(2);
};

// 检查价格是否被修改
const isPriceModified = (index: number): boolean => {
  const currentRow = tableList.value[index];
  const originalRow = originalTableList.value[index];
  if (!currentRow || !originalRow) return false;

  const currentPrice = Number(currentRow.goodsPrice);
  const originalPrice = Number(originalRow.goodsPrice);

  return currentPrice !== originalPrice;
};

// 处理价格变化
const handlePriceChange = (index: number) => {
  // 触发响应式更新，确保标签能正确显示
  tableList.value = [...tableList.value];
};

// 保存价格 - 只传递修改过的数据行
const submitForm = async () => {
  // 找出修改过的行
  const modifiedRows = tableList.value.filter((currentRow, index) => {
    const originalRow = originalTableList.value[index];
    if (!originalRow) return false;

    // 比较价格是否发生变化
    const currentPrice = Number(currentRow.goodsPrice);
    const originalPrice = Number(originalRow.goodsPrice);

    return currentPrice !== originalPrice;
  });

  // 如果没有修改的行，提示用户
  if (modifiedRows.length === 0) {
    ElMessage.warning('没有价格变更，无需保存');
    return;
  }

  // console.log('修改的数据行:', modifiedRows);

  const saveData = {
    id: formData.value.id,
    hnGoodsSpecificationDataList: modifiedRows.map((spec) => ({
      id: spec.id,
      goodsId: formData.value.id,
      goodsPrice: spec.goodsPrice || 0
    }))
  };

  // console.log('提交的数据:', saveData);

  const response = await updateGoodsPrice(saveData);
  if (response && response.code === 200) {
    ElMessage.success(`成功修改 ${modifiedRows.length} 条价格数据`);
    emit('success');
  } else {
    console.error('价格修改失败:', response);
    // ElMessage.error(response?.msg || '价格修改失败');
  }
};

// 初始化
onMounted(async () => {
  operateMode.value = props.type;

  if (props.id) {
    const res = await goodsId(String(props.id));
    formData.value = res.data;
    tableList.value = res.data.hnGoodsSpecificationDataList || [];
    formData.value.goodsAbilityNames = res.data.goodsAbilityNames ? res.data.goodsAbilityNames.split(',') : [];
    // 深拷贝原始数据用于对比
    originalTableList.value = JSON.parse(JSON.stringify(res.data.hnGoodsSpecificationDataList || []));
    // console.log('加载的原始数据:', originalTableList.value);
  }
  const data = await goodsAttributesAllList();
  const { brandList = [], guaranteeList = [] } = (data ?? {}) as Partial<GoodsAttributesResponse>;
  brandOptions.value = brandList;
  guaranteeOptions.value = guaranteeList;
});
</script>

<style scoped lang="scss">
// .supplier-edit-details {
//   padding: 0 24px;
// }

.main-image {
  width: 64px;
  height: 64px;
}

.price-input {
  min-width: 120px;
}
</style>
