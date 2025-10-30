<!--
  标题: EditDetails.vue
  功能: 企业编辑详情页
  说明: 用于企业编辑自己的详细信息
  当前版本: 1.0
  开发信息: Created by 刘景彪 2025-10-15
-->
<template>
  <div class="supplier-edit-details">
    <!-- 基础信息 -->
    <el-form :model="formData" label-width="140px">
      <FormHeader title="商品详情" />
      <el-row :gutter="20" class="detail-form">
        <el-col :span="8">
          <el-form-item label="商品名称">
            <el-input v-model="formData.goodsName" disabled></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="商品编码">
            <el-input v-model="formData.goodsCode" disabled></el-input>
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
            <el-input v-model="formData.createTime" disabled></el-input>
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
            <el-input v-model="formData.launchTime" disabled></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 商品信息 -->
      <FormHeader title="商品信息" />
      <el-table :data="tableList" border style="width: 100%">
        <el-table-column prop="goodsName" label="商品名称" width="200" :show-overflow-tooltip="true">
          <template #default="scope">
            <div class="spec-name">{{ formData.goodsName }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="goodsCode" label="商品编码" width="220">
          <template #default="scope">
            <div class="spec-code">{{ formData.goodsCode }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="goodsSpecificationValue" label="商品规格" align="center">
          <template #default="scope">
            <span>{{ scope.row.goodsSpecificationValue }}g/袋</span>
          </template>
        </el-table-column>
        <el-table-column prop="goodsPrice" label="销售价" align="center">
          <template #default="scope">
            <span>{{ formatPrice(scope.row.goodsPrice) }}¥</span>
          </template>
        </el-table-column>
        <el-table-column prop="goodsStock" label="可用库存" align="center"> </el-table-column>
      </el-table>

      <div style="height: 20px"></div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { goodsId } from '@/api/supplier/productManagement/product';
import FormHeader from '@/components/FormHeader/index.vue';
import { useRoute } from 'vue-router';
import { goodsAttributesAllList } from '@/api/platform/mallConfiguration/productAttributeLabel'; //商品保障+功能+品牌：
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { goods_status } = toRefs<any>(proxy?.useDict('goods_status'));

// 获取router路由参数
const route = useRoute();
const { id } = route.query;

// 定义接口返回数据的类型（基于新接口定义）
interface HnGoodsFiles {
  id?: number;
  goodsId?: number;
  fileType?: string;
  ossId?: number;
  ossInfo?: {
    ossId?: number;
    fileName?: string;
    originalName?: string;
    url?: string;
  };
  [property: string]: any;
}

interface HnGoodsSpecificationData {
  id?: number;
  goodsId?: number;
  goodsSpecification?: string;
  goodsSpecificationValue?: string;
  goodsPrice?: number;
  goodsStock?: number;
  [property: string]: any;
}

interface HnGoodsVo {
  id?: number;
  goodsName?: string;
  goodsCode?: string;
  goodsEnsureId?: number;
  goodsEnsureName?: string;
  goodsBrandId?: number;
  goodsBrandName?: string;
  createTime?: string;
  launchTime?: string;
  takeDownTime?: string;
  status?: string;
  goodsAlert?: number;
  goodsCategoryId?: number;
  goodsCategoryName?: string;
  goodsDetail?: string;
  goodsInfo?: string;
  goodsSpecification?: string;
  goodsSpecificationName?: string;
  hnGoodsFilesList?: HnGoodsFiles[];
  hnGoodsSpecificationDataList?: HnGoodsSpecificationData[];
  [property: string]: any;
}
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

const tableList = ref<HnGoodsSpecificationData[]>([]); // 商品信息
const brandOptions = ref<any[]>([]); // 商品品牌
const guaranteeOptions = ref<any[]>([]); // 商品保障
// 获取主图
const mainImage = computed(() => {
  if (!formData.value.sysOssLists || formData.value.sysOssLists.length === 0) {
    return '';
  }
  const mainFile = formData.value.sysOssLists[0];
  return mainFile && mainFile?.url;
});

// 页面加载时获取列表数据
onMounted(async () => {
  const data = await goodsAttributesAllList();
  console.log('商品保障+功能+品牌', data);

  // 模拟保障数据
  guaranteeOptions.value = data.guaranteeList || [];

  // 模拟品牌数据
  brandOptions.value = data.brandList || [];

  // 模拟功能数据
  // functionOptions.value = data.functionList || [];

  // id获取详情信息
  goodsId(id as string)
    .then((res) => {
      formData.value = res.data;
      tableList.value = res.data.hnGoodsSpecificationDataList || [];
    })
    .catch((error) => {
      console.error('获取商品详情失败:', error);
    });
});

// 价格格式化（两位小数）
const formatPrice = (price?: number) => {
  if (price === null || price === undefined || isNaN(Number(price))) return '--';
  return Number(price).toFixed(2);
};

// 组合规格（数值 + 单位）
const combineSpec = (value?: string | number, unit?: string) => {
  const v = value === undefined || value === null ? '' : String(value);
  const u = unit || '';
  return `${v}${u}`.trim();
};
</script>

<style scoped lang="scss">
.supplier-edit-details {
  padding: 0 24px;
}

// 去掉表单的默认样式
::v-deep .el-input__wrapper {
  box-shadow: none !important;
  background-color: transparent !important;
  cursor: default !important;
  resize: none !important;
}

::v-deep .el-input__inner {
  cursor: default !important;
}

// 去除 el-date-picker 的样式
::v-deep .el-date-editor {
  border: none;
  background-color: transparent;
  pointer-events: none;
  color: #333;
}

.textarea-item {
  ::v-deep .el-textarea__inner {
    box-shadow: none !important;
    background-color: transparent !important;
    cursor: default !important;
    resize: none !important;
  }
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
