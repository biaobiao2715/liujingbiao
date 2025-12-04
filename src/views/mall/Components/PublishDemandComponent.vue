<template>
  <div class="publish-demand">
    <el-dialog :title="isEdit ? '修改采购需求' : '发布采购需求'" v-model="dialogVisible" width="600px">
      <el-form :model="form" ref="formRef" :rules="rules" label-width="120px">
        <el-form-item label="采购类目" required prop="demandCategoryId">
          <GoodsCategorySelect v-model="form.demandCategoryId" :emitPath="false" @categoryChange="handleCategoryChange" />
        </el-form-item>
        <el-form-item label="区域" required prop="region">
          <RegionSelect v-model="form.region" :checkStrictly="true" @regionChange="handleAreaChange" style="width: 100%" />
        </el-form-item>
        <el-form-item label="采购数量" required prop="quantity">
          <el-input v-model="form.quantity" placeholder="请输入采购数量" inputmode="numeric" @input="onQuantityInput"></el-input>
        </el-form-item>
        <el-form-item label="交付时间/天" required prop="deliveryDay">
          <el-input v-model="form.deliveryDay" placeholder="请输入可交付时间（支持一位小数，例如 1.5）" @input="onDeliveryDayInput"></el-input>
        </el-form-item>
        <el-form-item label="采购说明" prop="demandDescription">
          <el-input
            v-model="form.demandDescription"
            type="textarea"
            placeholder="请输入采购说明（最多200字符）"
            :maxlength="200"
            show-word-limit
          ></el-input>
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
  quantity: [
    {
      validator: (_rule: any, value: any, callback: any) => {
        if (!value) return callback(new Error('请输入采购数量'));
        if (!/^\d+$/.test(value)) return callback(new Error('仅支持自然数'));
        const num = Number(value);
        if (!(num > 0)) return callback(new Error('采购数量需大于0'));
        if (num > 9999) return callback(new Error('最大支持9999'));
        callback();
      },
      trigger: ['blur', 'change']
    }
  ],
  deliveryDay: [
    {
      validator: (_rule: any, value: any, callback: any) => {
        if (!value) return callback(new Error('请输入交付时间'));
        // 支持最多一位小数，最大9999，且>0
        if (!/^\d{1,4}(\.\d)?$/.test(value)) return callback(new Error('最多一位小数，最大9999'));
        const num = Number(value);
        if (!(num > 0)) return callback(new Error('交付时间需大于0'));
        if (num > 9999) return callback(new Error('最大支持9999'));
        callback();
      },
      trigger: ['blur', 'change']
    }
  ],
  demandDescription: [
    {
      validator: (_rule: any, value: any, callback: any) => {
        if (value && String(value).length > 200) return callback(new Error('采购说明最多200字符'));
        callback();
      },
      trigger: ['blur', 'change']
    }
  ]
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

// 数量输入仅保留数字
const onQuantityInput = (val: string) => {
  const raw = (val || '').replace(/[^\d]/g, '');
  // 去除前导零
  const normalized = raw.replace(/^0+(\d)/, '$1');
  // 限制最大值 9999
  form.quantity = normalized ? String(Math.min(Number(normalized), 9999)) : '';
};

// 交付时间输入：允许一位小数，最大9999
const onDeliveryDayInput = (val: string) => {
  let s = (val || '').replace(/[^\d.]/g, '');
  // 只保留第一个小数点
  const firstDot = s.indexOf('.');
  if (firstDot !== -1) {
    s = s.slice(0, firstDot + 1) + s.slice(firstDot + 1).replace(/\./g, '');
  }
  // 保留至多一位小数
  const m = s.match(/^\d{0,4}(?:\.\d?)?/);
  s = m ? m[0] : '';
  // 去除前导零的整数部分规范化
  const parts = s.split('.');
  if (parts[0]) parts[0] = parts[0].replace(/^0+(\d)/, '$1');
  s = parts.join('.');
  // 限制最大值 9999
  const num = Number(s);
  if (!isNaN(num) && num > 9999) s = '9999';
  form.deliveryDay = s;
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
