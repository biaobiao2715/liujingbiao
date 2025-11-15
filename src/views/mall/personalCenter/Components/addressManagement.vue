<!--
        标题: addressManagement.vue
        功能: 我的地址管理
        说明: 新增/修改/删除/设为默认地址，分页展示
        当前版本: 2.0
        开发信息: Created by 刘景彪 2025-10-27, Refactor 2025-10-29
    -->
<template>
  <div class="address-page">
    <div class="menu-title">我的地址</div>
    <div class="pading20">
      <!-- 新增/编辑地址 -->
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px" class="address-form">
        <div style="color: #108c58; padding: 8px 4px 20px 8px">新增收货地址</div>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="收货人" prop="receiverName">
              <el-input v-model="form.receiverName" placeholder="请输入" maxlength="50" show-word-limit />
            </el-form-item>
          </el-col>
          <el-col :span="12"></el-col>

          <el-col :span="12">
            <el-form-item label="地区" prop="regionPath">
              <RegionSelect style="width: 100%" v-model="form.regionPath" @regionChange="onRegionChange" />
            </el-form-item>
          </el-col>
          <el-col :span="12"></el-col>
          <el-col :span="12">
            <el-form-item label="手机号" prop="receiverPhone">
              <el-input v-model="form.receiverPhone" placeholder="请输入" maxlength="11" />
            </el-form-item>
          </el-col>
          <el-col :span="12"></el-col>
          <el-col :span="24">
            <el-form-item label="详细地址" prop="detailAddress">
              <el-input v-model="form.detailAddress" type="textarea" :rows="3" placeholder="乡镇、街道、门牌号等" maxlength="200" show-word-limit />
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="" label-width="25px" colon="false">
              <el-checkbox class="round-checkbox" v-model="form.isDefault" true-value="1" false-value="0">设为默认地址</el-checkbox>
              <div style="margin-left: 20px; color: #909399">设置后系统将在下单时自动选择该收货地址</div>
            </el-form-item>
          </el-col>

          <el-col :span="24" style="text-align: right">
            <el-button v-hasPermi="['grain:userAddress:add']" type="primary" @click="onSubmit" :loading="saving">保存</el-button>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <div class="pading20" style="margin-top: 20px; border-radius: 8px">
      <!-- 已保存地址：替换原先的 div.table-title 为告警提示 -->
      <div class="summary-alert">已发布{{ total }}条 ，还能保存{{ remainCount }}条</div>
      <!-- 表格：加边框与紧凑尺寸 -->
      <el-table
        :data="tableData"
        v-loading="loading"
        border
        size="small"
        style="table-layout: fixed; width: 100%"
        header-cell-class-name="table-header"
      >
        <el-table-column prop="receiverName" label="收货人" align="center" />
        <el-table-column label="所在地址" min-width="280" align="center">
          <template #default="{ row }">
            {{ [row.province, row.city, row.region].filter(Boolean).join(' ') }}
          </template>
        </el-table-column>
        <el-table-column prop="receiverPhone" label="手机/电话" align="center" />
        <el-table-column label="设为默认地址" min-width="160" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.isDefault" active-value="1" inactive-value="0" @change="() => onSetDefault(row)" />
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="160" align="center">
          <template #default="{ row }">
            <div class="ops">
              <el-button v-hasPermi="['grain:userAddress:edit']" @click="onEdit(row)" v-throttle text style="color: #ff7b00">修改</el-button>
              <el-button v-hasPermi="['grain:userAddress:remove']" @click="onDelete(row)" v-throttle text style="color: #ef4d0b">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="flex-center pagination">
        <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, getCurrentInstance, type ComponentInternalInstance, computed } from 'vue';
import {
  Address,
  userAddressList,
  userAddressAdd,
  userAddressUpdate,
  userAddressDelete,
  userAddressSetDefault
} from '@/api/mall/personalCenter/addressManagement';
import { useUserStore } from '@/store/modules/user';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const userStore = useUserStore();
// 列表 & 分页
const loading = ref(false);
const saving = ref(false);
const tableData = ref<Address[]>([]);
const total = ref(0);
// 新增：剩余可保存数量（最多20条）
const maxCount = 20;
const remainCount = computed(() => Math.max(maxCount - (total.value || 0), 0));

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10
});

// 表单
const formRef = ref();
// 新增：表单模型扩展 regionPath
const form = reactive<Address>({
  receiverName: '',
  receiverPhone: '',
  provinceCode: '',
  province: '',
  cityCode: '',
  city: '',
  regionCode: '',
  region: '',
  detailAddress: '',
  isDefault: '0',
  tag: '',
  regionPath: [] // 新增：与 RegionSelect 绑定
});

// 校验
const rules = {
  receiverName: [
    { required: true, message: '请输入收货人', trigger: 'blur' },
    { min: 1, max: 50, message: '不超过50字', trigger: 'blur' }
  ],
  regionPath: [{ required: true, message: '请选择地区', trigger: 'change' }],
  receiverPhone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1\d{10}$/, message: '请输入11位手机号', trigger: 'blur' }
  ],
  detailAddress: [
    { required: true, message: '请输入详细地址', trigger: 'blur' },
    { min: 1, max: 200, message: '不超过200字', trigger: 'blur' }
  ],
  tag: [{ min: 0, max: 20, message: '标签不超过20字', trigger: 'blur' }]
};

// 生命周期
onMounted(() => {
  getList();
  // 可在此预加载省级数据（若你的接口支持）
  // getAreaTree();
});

// 方法
const getList = async () => {
  loading.value = true;
  try {
    const res: any = await userAddressList({ pageNum: queryParams.pageNum, pageSize: queryParams.pageSize });
    if (res?.code === 200) {
      tableData.value = res.rows || [];
      total.value = res.total || 0;
      const def = tableData.value.find((x) => x.isDefault === '1');
    }
  } finally {
    loading.value = false;
  }
};

const onRegionChange = (val) => {
  form.regionPath = val.regionPath;
  form.provinceCode = val.provinceCode;
  form.cityCode = val.cityCode;
  form.regionCode = val.regionCode;
  form.province = val.province;
  form.city = val.city;
  form.region = val.region;
};

const resetForm = () => {
  Object.assign(form, {
    id: undefined,
    receiverName: '',
    receiverPhone: '',
    provinceCode: '',
    province: '',
    cityCode: '',
    city: '',
    regionCode: '',
    region: '',
    detailAddress: '',
    isDefault: '0',
    tag: '',
    regionPath: [] // 新增：重置地区
  });
  formRef.value?.clearValidate?.();
};

const onSubmit = async () => {
  await formRef.value.validate();
  saving.value = true;
  console.log('submit', form);
  try {
    const api = form.id ? userAddressUpdate : userAddressAdd;
    const res: any = await api({
      ...form,
      userId: Number(userStore.userId)
    });
    if (res?.code === 200) {
      ElMessage.success(form.id ? '修改成功' : '新增成功');
      resetForm();
      getList();
    }
  } finally {
    saving.value = false;
  }
};

const onEdit = (row: Address) => {
  Object.assign(form, row);
  console.log('edit row', row, form);
  // 新增：编辑时回填地区路径
  form.regionPath = [row.provinceCode, row.cityCode, row.regionCode];
};

const onDelete = async (row: Address) => {
  await ElMessageBox.confirm('确定删除该地址吗？', '提示', { type: 'warning' });
  const res: any = await userAddressDelete(row.id);
  if (res?.code === 200) {
    ElMessage.success('删除成功');
    // 若删除的是默认，清空默认标记
    getList();
  }
};

const onSetDefault = async (row: Address) => {
  const res: any = await userAddressSetDefault(row.id);
  if (res?.code === 200) {
    ElMessage.success('设置成功');
    getList();
  }
};
</script>

<style scoped>
/* 页面布局样式 */
.menu-title {
  display: flex;
  align-items: center;
  height: 60px;
  padding-left: 20px;
  font-size: 20px;
  font-weight: 500;
  color: #333333;
  background: #fff;
  position: relative;
  border-bottom: 2px solid #d8d8d8;
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  border-radius: 8px 8px 0 0;
}

.menu-title::before {
  content: '';
  display: inline-block;
  width: 26px;
  height: 26px;
  background: #108c58;
  border-radius: 4px 4px 4px 4px;
  margin-right: 12px;
}

.pading20 {
  padding: 20px;
  border-radius: 0 0 8px 8px;
  background: #ffffff;
}
/* 表单容器增加描边与圆角，间距更紧凑 */
.address-form {
  background: #fff;
  padding: 12px 16px 8px 12px;
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
}
.address-form :deep(.el-form-item) {
  margin-bottom: 12px;
}

/* 将该表单中的“设为默认地址”复选框外观由方形改为圆形 */
.address-form :deep(.round-checkbox .el-checkbox__inner) {
  border-radius: 50%;
}

/* 顶部提示样式 */
.summary-alert {
  margin: 15px 0;
  height: 36px;
  line-height: 36px;
  background: rgba(255, 123, 0, 0.1);
  border-radius: 4px 4px 4px 4px;
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  font-size: 14px;
  color: #ff7b00;
  text-align: center;
}
/* 表格标题背景与单元格内边距优化 */
:deep(.table-header) {
  background: #fafafa !important;
  color: var(--el-text-color-primary);
  font-weight: 600;
}
:deep(.el-table--small .cell) {
  padding: 8px 12px;
}

/* 操作按钮间距 */
.ops :deep(.el-button + .el-button) {
  margin-left: 12px;
}

.flex-center.pagination {
  margin-top: 16px;
  justify-content: end;
  display: flex;
}
</style>
