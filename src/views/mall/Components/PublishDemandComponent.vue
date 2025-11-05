<template>
  <div class="publish-demand">
    <el-dialog :title="isEdit ? '修改采购需求' : '发布采购需求'" v-model="dialogVisible" width="600px">
      <el-form :model="form" ref="formRef" :rules="rules" label-width="120px">
        <el-form-item label="采购类目" required prop="demandCategoryId">
          <GoodsCategorySelect v-model="form.demandCategoryId" :emitPath="false" @categoryChange="handleCategoryChange" />
        </el-form-item>
        <el-form-item label="区域" required prop="region">
          <RegionSelect v-model="form.region" @regionChange="handleAreaChange" style="width: 100%" />
        </el-form-item>
        <el-form-item label="采购数量" required prop="quantity">
          <el-input v-model="form.quantity" placeholder="请输入采购数量"></el-input>
        </el-form-item>
        <el-form-item label="交付时间/天" required prop="deliveryDay">
          <el-input v-model="form.deliveryDay" placeholder="请输入可交付时间"></el-input>
        </el-form-item>
        <el-form-item label="采购说明" prop="demandDescription">
          <el-input v-model="form.demandDescription" type="textarea" placeholder="请输入采购说明"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">提交发布</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { addPurchaseDemand, updatePurchaseDemand } from '@/api/mall/demand';

const emit = defineEmits(['submitSuccess']);

const form = reactive({
  id: undefined,
  demandCategoryId: '' as any,
  demandDescription: '',
  quantity: '',
  deliveryDay: '',
  deliveryProvinceCode: '',
  deliveryProvince: '',
  deliveryCityCode: '',
  deliveryCity: '',
  deliveryDistrictCode: '',
  deliveryDistrict: '',
  region: []
});

const formRef = ref<ElFormInstance>();
const isEdit = computed(() => !!form.id);
const dialogVisible = ref(false);

const rules = ref({
  demandCategoryId: [{ required: true, message: '请选择采购类目', trigger: 'change' }],
  region: [{ required: true, message: '请选择区域', trigger: 'change' }],
  quantity: [{ required: true, message: '请输入采购数量', trigger: 'blur' }],
  deliveryDay: [{ required: true, message: '请输入交付时间', trigger: 'blur' }]
});

// 处理分类变化
const handleCategoryChange = (value: string) => {
  console.log('form before:', value);
  form.demandCategoryId = value;
};

// 处理地址选择变化
const handleAreaChange = (val: any) => {
  console.log(val);
  form.region = val.regionPath;
  form.deliveryProvinceCode = val.provinceCode;
  form.deliveryProvince = val.province;
  form.deliveryCityCode = val.cityCode;
  form.deliveryCity = val.city;
  form.deliveryDistrictCode = val.regionCode;
  form.deliveryDistrict = val.region;
};

// 打开发布采购需求弹窗
const openDialog = (formData: any) => {
  // 初始化表单数据
  dialogVisible.value = true;
  Object.assign(form, formData);
  if (formData) {
    form.region = [form.deliveryProvinceCode || '', form.deliveryCityCode || '', form.deliveryDistrictCode || ''];
  } else {
    // 重置表单验证状态
    setTimeout(() => {
      formRef.value.resetFields();
    }, 500);
  }
};

// 提交表单
const handleSubmit = () => {
  formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        const formData = {
          ...form,
          demandStatus: '1'
        };
        const res = await (form.id ? updatePurchaseDemand(formData) : addPurchaseDemand(formData));
        if (res.code == 200) {
          ElMessage.success(form.id ? '修改成功' : '发布成功');
          dialogVisible.value = false;
          emit('submitSuccess');
        }
      } catch (error) {
        ElMessage.error('提交失败');
      }
    }
  });
};

defineExpose({
  openDialog
});
</script>

<style scoped lang="scss">
.publish-demand {
  .el-dialog {
    .el-form {
      margin-top: 20px;
    }
  }
}
</style>
