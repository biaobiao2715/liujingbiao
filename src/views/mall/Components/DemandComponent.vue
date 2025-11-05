<template>
  <div class="demand-component">
    <div class="content" v-show="!showDetail">
      <!-- 筛选条件 -->
      <el-form :model="queryParams" inline :label-width="80">
        <el-form-item label="区域">
          <RegionSelect v-model="region" @regionChange="handleRegionChange" />
        </el-form-item>
        <el-form-item label="商品分类">
          <GoodsCategorySelect v-model="category" @categoryChange="handleCategoryChange" />
        </el-form-item>
        <el-form-item>
          <el-button v-throttle @click="resetQuery">重置</el-button>
          <el-button v-throttle type="primary" @click="getDemandList">查询</el-button>
          <el-button v-throttle type="primary" @click="handleOpenDialog()">发布采购需求</el-button>
        </el-form-item>
      </el-form>
      <!-- 数据表格 -->
      <el-table :data="tableList" style="width: 100%" v-loading="loading">
        <el-table-column prop="categoryName" label="发布类型" width="200"></el-table-column>
        <el-table-column prop="region" label="配送范围" width="200">
          <template #default="scope">
            <div v-for="value in scope.row.deliveryAddresses?.split(',')" :key="value">
              {{ value }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="supplyDescription" label="备注" width="300" show-overflow-tooltip></el-table-column>
        <el-table-column prop="stock" label="库存"></el-table-column>
        <!-- <el-table-column prop="views" label="询问次数" width="100"></el-table-column> -->
        <el-table-column prop="createTime" label="发布时间" width="200"></el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button type="text" @click="contact(scope.row)">立即联系</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <pagination
        v-show="queryParams.total > 0"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        :total="queryParams.total"
        @pagination="getDemandList"
      />

      <!-- 采购需求弹窗 -->
      <PublishDemandComponent ref="publishDemandRef" @submitSuccess="getDemandList"></PublishDemandComponent>

      <!-- 展示供应商联系信息 -->
      <el-dialog title="供应商联系信息" v-model="contactVisible" width="400px">
        <el-form :model="contactForm" label-width="100">
          <el-form-item label="供应商名称">
            <div>{{ contactForm.companyName }}</div>
          </el-form-item>
          <el-form-item label="联系人">
            <div>{{ contactForm.loginUserName }}</div>
          </el-form-item>
          <el-form-item label="联系电话">
            <div>{{ contactForm.phoneNumber }}</div>
          </el-form-item>
        </el-form>
      </el-dialog>

      <!-- 热销推荐 -->
      <h3>热销推荐</h3>
      <el-carousel :interval="5000" v-if="hotRecommendations.length > 0">
        <el-carousel-item v-for="(group, index) in groupArray(hotRecommendations, 5)" :key="index">
          <div class="recommendation-grid flex gap-12">
            <HotGoodsComponent
              v-for="item in group"
              :key="item.id"
              :goods="item"
              style="width: calc(20% - 10px)"
              @clickGoods="handleClick(item.id)"
            />
          </div>
        </el-carousel-item>
      </el-carousel>

      <el-empty v-else></el-empty>

      <!-- 好物推荐 -->
      <h3>好物推荐</h3>
      <el-carousel :interval="5000" v-if="goodRecommendations.length > 0">
        <el-carousel-item v-for="(group, index) in groupArray(goodRecommendations, 5)" :key="index">
          <div class="recommendation-grid flex gap-12">
            <HotGoodsComponent
              v-for="item in group"
              :key="item.id"
              :goods="item"
              style="width: calc(20% - 12px)"
              @clickGoods="handleClick(item.id)"
            />
          </div>
        </el-carousel-item>
      </el-carousel>
      <el-empty v-else></el-empty>
    </div>

    <!-- 商品详情组件 -->
    <GoodsDetailComponent v-if="showDetail" ref="goodsDetailRef" :goodsId="goodsId" />
  </div>
</template>

<script setup lang="ts">
// import GoodsItemComponent from './GoodsItemComponent.vue';
import RegionSelect from '@/components/RegionSelect/index.vue';
import GoodsCategorySelect from '@/components/GoodsCategorySelect/index.vue';
import PublishDemandComponent from './PublishDemandComponent.vue';
import HotGoodsComponent from './HotGoodsComponent.vue';
import GoodsDetailComponent from './GoodsDetailComponent.vue';
import { supplyHallList, hotRecommendationList, greatGoodsRecommendList } from '@/api/mall/demand';

const publishDemandRef = ref();

const tableList = ref([]);

const loading = ref(false);

const category = ref([]);

const region = ref([]);

const contactVisible = ref(false);

const showDetail = ref(false); // 是否显示商品详情

const goodsDetailRef = ref(null); // 商品详情组件引用

const goodsId = ref(); // 商品ID

const contactForm = ref({
  companyName: '',
  loginUserName: '',
  phoneNumber: ''
});

const queryParams = reactive({
  total: 0,
  pageNum: 1,
  pageSize: 10,
  provinceCode: '',
  cityCode: '',
  districtCode: '',
  supplyCategoryId: ''
});

const hotRecommendations = ref([]);

const goodRecommendations = ref([]);

onMounted(() => {
  getDemandList();
  getHotGoodsList();
  getGoodGoodsList();
});

// 重置筛选条件
const resetQuery = () => {
  category.value = [];
  region.value = [];
  queryParams.pageNum = 1;
  queryParams.pageSize = 10;
  queryParams.supplyCategoryId = '';
  queryParams.provinceCode = '';
  queryParams.cityCode = '';
  queryParams.districtCode = '';
  getDemandList();
};

// 区域选择
const handleRegionChange = (val: any) => {
  queryParams.provinceCode = val.provinceCode || '';
  queryParams.cityCode = val.cityCode || '';
  queryParams.districtCode = val.regionCode || '';
};

// 分类选择
const handleCategoryChange = (value: string[]) => {
  queryParams.supplyCategoryId = value[value?.length - 1];
};

// 获取采购需求列表
const getDemandList = async () => {
  loading.value = true;
  console.log(category.value);

  const res = await supplyHallList({
    ...queryParams
    // supplyCategoryId: category.value[category.value?.length - 1]
  });
  if (res.code === 200) {
    tableList.value = res.rows || [];
    queryParams.total = res.total || 0;
    loading.value = false;
  }
};

// 热销推荐
const getHotGoodsList = async () => {
  const res = await hotRecommendationList({
    pageNum: 1,
    pageSize: 9999
  });
  if (res.code === 200) {
    hotRecommendations.value = res.rows || [];
  }
};

// 好物推荐
const getGoodGoodsList = async () => {
  const res = await greatGoodsRecommendList({
    pageNum: 1,
    pageSize: 9999
  });
  if (res.code === 200) {
    goodRecommendations.value = res.rows || [];
  }
};

// 点击商品
const handleClick = (id: string) => {
  goodsId.value = id;
  showDetail.value = true;
};

// 打开新增需求弹窗
const handleOpenDialog = () => {
  publishDemandRef.value?.openDialog();
};

const contact = (row: any) => {
  console.log('联系数据:', row);
  contactForm.value = row;
  contactVisible.value = true;
};

// 分组数组，每组groupSize个
const groupArray = (array: any[], groupSize: number = 5) => {
  return array.reduce((result, item, index) => {
    const groupIndex = Math.floor(index / groupSize); // 计算当前对象属于第几组
    if (!result[groupIndex]) {
      result[groupIndex] = []; // 初始化组
    }
    result[groupIndex].push(item); // 将对象添加到对应组
    console.log(result);

    return result;
  }, []);
};
</script>

<style scoped lang="scss">
.recommendation-grid {
}

.recommendation-item {
  width: calc((100% - 80px) / 5);
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  text-align: center;
}

.recommendation-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.recommendation-info {
  padding: 10px;
}

.recommendation-title {
  font-size: 14px;
  font-weight: bold;
}

.recommendation-price {
  color: #f56c6c;
}

.recommendation-sales {
  color: #909399;
}

/* 调整 el-carousel 的箭头位置 */
.el-carousel__arrow {
  top: 50% !important;
  transform: translateY(-50%);
}

/* 确保 el-carousel 的高度与内容一致 */
.el-carousel {
  height: auto !important;
}
</style>
