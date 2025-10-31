<template>
  <div class="supplier-edit-details">
    <el-form :model="formData" label-width="140px">
      <FormHeader title="商品详情" />
      <el-row :gutter="20" class="detail-form">
        <el-col :span="8">
          <el-form-item label="商品名称">
            <el-input v-model="formData.goodsName" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="商品编码">
            <el-input v-model="formData.goodsCode" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="产品保障">
            <el-select v-model="formData.goodsEnsureIds" placeholder="请选择产品保障" style="width: 100%" disabled clearable multiple>
              <el-option v-for="item in guaranteeOptions" :key="item.id" :label="item.attributeName" :value="item.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="商品品牌">
            <el-select v-model="formData.goodsBrandId" placeholder="请选择品牌" style="width: 100%" disabled clearable>
              <el-option v-for="item in brandOptions" :key="item.id" :label="item.attributeName" :value="item.id" :disabled="!item.status" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="创建时间">
            <el-input v-model="formData.createTime" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="商品主图" class="main-image-container">
            <img v-if="mainImage" :src="mainImage" class="main-image" alt="商品主图" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="商品状态">
            <el-select v-model="formData.status" placeholder="请选择商品状态" filterable clearable disabled>
              <el-option v-for="dict in goods_status" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="上架时间">
            <el-input v-model="formData.launchTime" disabled />
          </el-form-item>
        </el-col>
      </el-row>

      <FormHeader title="商品信息" />
      <el-table :data="tableList" border style="width: 100%">
        <el-table-column prop="goodsName" label="商品名称" width="200" :show-overflow-tooltip="true">
          <template #default>
            <div class="spec-name">{{ formData.goodsName }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="goodsCode" label="商品编码" width="220">
          <template #default>
            <div class="spec-code">{{ formData.goodsCode }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="goodsPrice" label="销售价" align="center">
          <template #default="scope">
            <span v-if="operateMode === 'view'">{{ formatPrice(scope.row.goodsPrice) }}¥</span>
            <el-input
              v-if="operateMode === 'edit'"
              v-model="scope.row.goodsPrice"
              type="number"
              :min="0"
              step="0.01"
              placeholder="请输入价格"
              class="price-input"
            >
              <template #suffix>¥</template>
            </el-input>
          </template>
        </el-table-column>
        <el-table-column prop="goodsSpecificationValue" label="商品规格" align="center">
          <template #default="scope">
            <span>{{ scope.row.goodsSpecificationValue }}g/袋</span>
          </template>
        </el-table-column>
        <el-table-column prop="goodsStock" label="可用库存" align="center" />
      </el-table>

      <div style="height: 20px"></div>

      <el-row v-show="operateMode === 'edit'" type="flex" justify="center" :gutter="5">
        <el-col :span="3"><el-button v-throttle type="primary" @click="submitForm">保存</el-button></el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
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
const { goods_status } = toRefs<any>(proxy?.useDict('goods_status'));

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
const brandOptions = ref<any[]>([]);
const guaranteeOptions = ref<any[]>([]);
const operateMode = ref<'view' | 'edit'>(props.type);

// 主图
const mainImage = computed(() => {
  if (!formData.value.sysOssLists || formData.value.sysOssLists.length === 0) return '';
  const mainFile = formData.value.sysOssLists[0];
  return mainFile?.url || '';
});

// 价格格式化
const formatPrice = (price?: number) => {
  if (price === null || price === undefined || isNaN(Number(price))) return '--';
  return Number(price).toFixed(2);
};

// 保存价格
const submitForm = async () => {
  const saveData = {
    id: formData.value.id,
    hnGoodsSpecificationDataList: tableList.value.map((spec) => ({
      id: spec.id,
      goodsId: formData.value.id,
      goodsPrice: spec.goodsPrice || 0
    }))
  };
  const response = await updateGoodsPrice(saveData);
  if (response && response.code === 200) {
    ElMessage.success('价格修改成功');
    emit('success');
  } else {
    ElMessage.error(response?.msg || '价格修改失败');
  }
};

// 初始化
onMounted(async () => {
  operateMode.value = props.type;

  if (props.id) {
    const res = await goodsId(String(props.id));
    formData.value = res.data;
    tableList.value = res.data.hnGoodsSpecificationDataList || [];
  }
  const { data } = await goodsAttributesAllList();
  const { brandList = [], guaranteeList = [] } = (data ?? {}) as Partial<GoodsAttributesResponse>;
  brandOptions.value = brandList;
  guaranteeOptions.value = guaranteeList;
});
</script>

<style scoped lang="scss">
.supplier-edit-details {
  padding: 0 24px;
}
.main-image-container {
  position: relative;
}
.main-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 200px;
  height: auto;
}
</style>
