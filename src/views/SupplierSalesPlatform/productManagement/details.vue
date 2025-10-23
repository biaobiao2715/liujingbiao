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
            <el-input v-model="formData.goodsEnsureName" disabled></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="商品品牌">
            <el-input v-model="formData.goodsBrandName" disabled></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="创建时间">
            <el-input v-model="formData.createTime" disabled></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="商品主图">
            <img v-if="mainImage" :src="mainImage" width="200" alt="商品主图" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="商品状态">
            <el-input v-model="statusName" disabled></el-input>
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
        <el-table-column prop="goodsSpecificationValue" label="商品规格" align="center"> </el-table-column>
        <el-table-column prop="goodsPrice" label="销售价" align="center"> </el-table-column>
        <el-table-column prop="goodsStock" label="可用库存" align="center"> </el-table-column>
      </el-table>

      <div style="height: 20px"></div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { goodsId } from '@/api/Supplier/productManagement/product';
import FormHeader from '@/components/FormHeader/index.vue';
import { useRoute } from 'vue-router';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { review_status, plat_qualification_grade, plat_credit_rating } = toRefs<any>(
  proxy?.useDict('review_status', 'plat_qualification_grade', 'plat_credit_rating')
);

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

// 计算商品状态显示名称
const statusName = computed(() => {
  return formData.value.status === '1' ? '上架' : '下架';
});

// 获取主图
const mainImage = computed(() => {
  if (!formData.value.hnGoodsFilesList || formData.value.hnGoodsFilesList.length === 0) {
    return '';
  }
  const mainFile = formData.value.hnGoodsFilesList.find((file) => file.fileType === '0');
  return mainFile && mainFile.ossInfo ? mainFile.ossInfo.url : '';
});

// id获取详情信息
goodsId(id as string)
  .then((res) => {
    formData.value = res.data;
    tableList.value = res.data.hnGoodsSpecificationDataList || [];
  })
  .catch((error) => {
    console.error('获取商品详情失败:', error);
  });
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
</style>
