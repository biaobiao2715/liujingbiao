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
        <el-button v-throttle type="primary" @click="handleOpenDialog" style="margin: 0">发布采购需求</el-button>
      </el-form-item>
    </el-form>
    <!-- 数据表格 -->
    <el-table :data="demandList" style="width: 100%">
      <el-table-column prop="type" label="发布类型" width="150"></el-table-column>
      <el-table-column prop="region" label="配送范围"></el-table-column>
      <el-table-column prop="note" label="备注"></el-table-column>
      <el-table-column prop="stock" label="库存" width="100"></el-table-column>
      <el-table-column prop="views" label="询问次数" width="100"></el-table-column>
      <el-table-column prop="publishDate" label="发布时间" width="150"></el-table-column>
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
    <el-dialog title="发布采购需求" v-model="dialogVisible" width="600px">
      <el-form :model="form" ref="formRef" :rules="rules" label-width="120px">
        <el-form-item label="采购类别" required>
          <el-select v-model="form.category" placeholder="请选择类别">
            <el-option label="类别1" value="1"></el-option>
            <el-option label="类别2" value="2"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="区域" required>
          <el-select v-model="form.region" placeholder="请选择所在区域">
            <el-option label="区域1" value="1"></el-option>
            <el-option label="区域2" value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="采购数量" required>
          <el-input v-model="form.quantity" placeholder="请输入"></el-input>
        </el-form-item>
        <el-form-item label="交付时间/天" required>
          <el-input v-model="form.deliveryTime" placeholder="请输入可交付时间"></el-input>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.note" type="textarea" placeholder="请输入"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">提交发布</el-button>
      </template>
    </el-dialog>

    <!-- 展示供应商联系信息 -->
    <el-dialog title="供应商联系信息" v-model="contactVisible" width="400px">
      <el-form :model="contactForm" label-width="100">
        <el-form-item label="供应商名称">
          <div>{{ contactForm.supplierName }}</div>
        </el-form-item>
        <el-form-item label="联系人">
          <div>{{ contactForm.contactName }}</div>
        </el-form-item>
        <el-form-item label="联系电话">
          <div>{{ contactForm.phone }}</div>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- 热销推荐 -->
    <h3>热销推荐</h3>
    <el-carousel :interval="5000" height="180px">
      <el-carousel-item v-for="(group, index) in chunkArray(hotRecommendations, 5)" :key="index">
        <div class="recommendation-grid">
          <GoodsItemComponent v-for="item in group" :key="item.id" :goods="item" />
        </div>
      </el-carousel-item>
    </el-carousel>

    <!-- 好物推荐 -->
    <h3>好物推荐</h3>
    <el-carousel :interval="5000" height="180px">
      <el-carousel-item v-for="(group, index) in chunkArray(goodRecommendations, 5)" :key="index">
        <div class="recommendation-grid">
          <GoodsItemComponent v-for="item in group" :key="item.id" :goods="item" />
        </div>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import GoodsItemComponent from './GoodsItemComponent.vue';
import RegionSelect from '@/components/RegionSelect/index.vue';
import GoodsCategorySelect from '@/components/GoodsCategorySelect/index.vue';

const dialogVisible = ref(false);

const demandList = ref([
  { type: '种子--辣椒种子', region: '湖北省-武汉市-江汉区', note: '买的越多，越便宜', stock: 11, views: 1, publishDate: '2025-10-23' }
]);

const category = ref([]);

const region = ref([]);

const contactVisible = ref(false);

const contactForm = ref({
  supplierName: '',
  contactName: '',
  phone: ''
});

const queryParams = ref({
  total: 23,
  pageNum: 1,
  pageSize: 10,
  type: ''
});

const form = ref({
  category: '',
  note: '',
  region: '',
  quantity: '',
  deliveryTime: ''
});

const hotRecommendations = ref([
  { id: 1, image: 'path/to/image1.jpg', title: '抗菌抗病辣椒种子', price: '20.00元/袋', sales: '销售1k+' },
  { id: 2, image: 'path/to/image2.jpg', title: '抗菌抗病辣椒种子', price: '20.00元/袋', sales: '销售1k+' },
  { id: 3, image: 'path/to/image3.jpg', title: '抗菌抗病辣椒种子', price: '20.00元/袋', sales: '销售1k+' },
  { id: 4, image: 'path/to/image4.jpg', title: '抗菌抗病辣椒种子', price: '20.00元/袋', sales: '销售1k+' },
  { id: 5, image: 'path/to/image5.jpg', title: '抗菌抗病辣椒种子', price: '20.00元/袋', sales: '销售1k+' },
  { id: 6, image: 'path/to/image6.jpg', title: '抗菌抗病辣椒种子', price: '20.00元/袋', sales: '销售1k+' },
  { id: 7, image: 'path/to/image7.jpg', title: '抗菌抗病辣椒种子', price: '20.00元/袋', sales: '销售1k+' },
  { id: 8, image: 'path/to/image8.jpg', title: '抗菌抗病辣椒种子', price: '20.00元/袋', sales: '销售1k+' },
  { id: 9, image: 'path/to/image9.jpg', title: '抗菌抗病辣椒种子', price: '20.00元/袋', sales: '销售1k+' }
]);

const goodRecommendations = ref([
  { id: 1, image: 'path/to/image3.jpg', title: '微耕机松土机开沟机除草机', price: '2000.00元/台', sales: '销售1k+' },
  { id: 2, image: 'path/to/image4.jpg', title: '杂竹净5%环嗪酮除树剂', price: '2.00元/袋', sales: '销售1k+' }
  // ...其他好物推荐数据...
]);

const rules = ref({
  category: [{ required: true, message: '请选择采购类别', trigger: 'blur' }],
  note: [{ required: true, message: '请输入备注', trigger: 'blur' }],
  region: [{ required: true, message: '请选择所在区域', trigger: 'blur' }],
  quantity: [{ required: true, message: '请输入采购数量', trigger: 'blur' }],
  deliveryTime: [{ required: true, message: '请输入可交付时间', trigger: 'blur' }]
});

onMounted(() => {
  getDemandList();
  getGoodsList('hot');
  getGoodsList('good');
});

// 获取采购需求列表
const getDemandList = () => {
  console.log('获取采购需求数据');
};

// 获取商品列表
const getGoodsList = (type: string) => {
  console.log(`获取${type}商品数据`);
};

// 数组分块函数
const chunkArray = (array: any[], size: number) => {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  console.log(result);

  return result;
};

// 打开新增需求弹窗
const handleOpenDialog = () => {
  dialogVisible.value = true;
};

const submitForm = () => {
  console.log('表单数据:', form.value);
  dialogVisible.value = false;
};

const contact = (row: any) => {
  console.log('联系数据:', row);
  contactForm.value = row;
  contactVisible.value = true;
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
