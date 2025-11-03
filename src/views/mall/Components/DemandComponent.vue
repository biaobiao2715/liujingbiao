<template>
  <div>
    <!-- 筛选条件 -->
    <el-form :model="queryParams" inline :label-width="80">
      <el-form-item label="区域">
        <RegionSelect v-model="region" />
      </el-form-item>
      <el-form-item label="商品分类">
        <GoodsCategorySelect v-model="category" />
      </el-form-item>
      <el-form-item>
        <el-button v-throttle type="primary" @click="handleOpenDialog()" style="margin: 0">发布采购需求</el-button>
      </el-form-item>
    </el-form>
    <!-- 数据表格 -->
    <el-table :data="tableList" style="width: 100%">
      <el-table-column prop="categoryName" label="发布类型" width="200"></el-table-column>
      <el-table-column prop="region" label="配送范围"></el-table-column>
      <el-table-column prop="demandDescription" label="备注"></el-table-column>
      <el-table-column prop="quantity" label="库存" width="100"></el-table-column>
      <el-table-column prop="views" label="询问次数" width="100"></el-table-column>
      <el-table-column prop="publishTime" label="发布时间" width="150"></el-table-column>
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
          <div>{{ contactForm.name }}</div>
        </el-form-item>
        <el-form-item label="联系人">
          <div>{{ contactForm.contactPerson }}</div>
        </el-form-item>
        <el-form-item label="联系电话">
          <div>{{ contactForm.contactPhone }}</div>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- 热销推荐 -->
    <h3>热销推荐</h3>
    <el-carousel :interval="5000" height="180px">
      <el-carousel-item v-for="(group, index) in groupArray(hotRecommendations, 5)" :key="index">
        <div class="recommendation-grid">
          <GoodsItemComponent v-for="item in group" :key="item.id" :goods="item" />
        </div>
      </el-carousel-item>
    </el-carousel>

    <!-- 好物推荐 -->
    <h3>好物推荐</h3>
    <el-carousel :interval="5000" height="180px">
      <el-carousel-item v-for="(group, index) in groupArray(goodRecommendations, 5)" :key="index">
        <div class="recommendation-grid">
          <GoodsItemComponent v-for="item in group" :key="item.id" :goods="item" />
        </div>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<script setup lang="ts">
import GoodsItemComponent from './GoodsItemComponent.vue';
import RegionSelect from '@/components/RegionSelect/index.vue';
import GoodsCategorySelect from '@/components/GoodsCategorySelect/index.vue';
import PublishDemandComponent from './PublishDemandComponent.vue';
import { purchaseList, hotRecommendationList } from '@/api/mall/demand';

const publishDemandRef = ref();

const tableList = ref([]);

const category = ref([]);

const region = ref([]);

const contactVisible = ref(false);

const contactForm = ref({
  supplierName: '',
  contactName: '',
  phone: ''
});

const queryParams = reactive({
  total: 0,
  pageNum: 1,
  pageSize: 10,
  type: ''
});

const hotRecommendations = ref([]);

const goodRecommendations = ref([]);

onMounted(() => {
  getDemandList();
  getHotGoodsList();
});

// 获取采购需求列表
const getDemandList = async () => {
  const res = await purchaseList(queryParams.value);
  if (res.code === 200) {
    tableList.value = res.rows || [];
    queryParams.total = res.total || 0;
  }
};

// 获取商品列表
const getHotGoodsList = async () => {
  const res = await hotRecommendationList({
    pageNum: 1,
    pageSize: 9999
  });
  if (res.code === 200) {
    hotRecommendations.value = res.rows || [];
  }
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
    return result;
  }, []);
};
</script>

<style scoped lang="scss">
.el-button {
  margin-bottom: 20px;
}

.recommendation-grid {
  display: flex;
  justify-content: flex-start;
  gap: 20px;
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
