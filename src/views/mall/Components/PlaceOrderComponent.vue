<template>
  <!-- 新增收货地址 Dialog -->
  <el-dialog v-model="addAddressDialogVisible" title="新增收货地址">
    <el-form :model="newAddressForm" label-width="120px">
      <el-form-item label="收货人姓名：" required>
        <el-input v-model="newAddressForm.name" placeholder="姓名"></el-input>
      </el-form-item>
      <el-form-item label="收货人电话：" required>
        <el-input v-model="newAddressForm.phone" placeholder="手机号"></el-input>
      </el-form-item>
      <el-form-item label="收货地址：" required>
        <el-cascader v-model="newAddressForm.region" :options="regionOptions" placeholder="选择省/市/区/街道"></el-cascader>
      </el-form-item>
      <el-form-item label="详细地址：" required>
        <el-input v-model="newAddressForm.detail" placeholder="街道、门牌号等"></el-input>
      </el-form-item>
    </el-form>
    <div class="dialog-footer">
      <el-button @click="addAddressDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleAddAddress">确定</el-button>
    </div>
  </el-dialog>

  <!-- 选择收货地址 Dialog -->
  <el-dialog v-model="selectAddressDialogVisible" title="选择地址">
    <el-radio-group v-model="selectedAddress">
      <el-radio v-for="(address, index) in addressList" :key="index" :label="address">
        <div><strong>收货人姓名：</strong>{{ address.name }}</div>
        <div><strong>收货人电话：</strong>{{ address.phone }}</div>
        <div><strong>收货地址：</strong>{{ address.fullAddress }}</div>
      </el-radio>
    </el-radio-group>
    <div class="dialog-footer">
      <el-button @click="selectAddressDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleSelectAddress">确定</el-button>
    </div>
  </el-dialog>

  <!-- 确认收货地址 -->
  <div class="confirm-address">
    <div>
      <strong>默认地址</strong>
      <el-link type="primary" @click="selectAddressDialogVisible = true">切换地址</el-link>
      <el-link type="primary" @click="addAddressDialogVisible = true">新建地址</el-link>
    </div>
    <div><strong>收货人姓名：</strong>{{ selectedAddress.name }}</div>
    <div><strong>收货人电话：</strong>{{ selectedAddress.phone }}</div>
    <div><strong>收货地址：</strong>{{ selectedAddress.fullAddress }}</div>
  </div>
</template>

<script setup lang="ts">
const addAddressDialogVisible = ref(false);

const selectAddressDialogVisible = ref(false);

const newAddressForm = ref({
  name: '',
  phone: '',
  region: [],
  detail: ''
});

const regionOptions = ref([
  {
    value: '广东省',
    label: '广东省',
    children: [
      {
        value: '深圳市',
        label: '深圳市',
        children: [
          { value: '福田区', label: '福田区' },
          { value: '罗湖区', label: '罗湖区' }
        ]
      }
    ]
  },
  {
    value: '湖北省',
    label: '湖北省',
    children: [
      {
        value: '武汉市',
        label: '武汉市',
        children: [{ value: '光谷区', label: '光谷区' }]
      }
    ]
  }
]);

const addressList = ref([
  {
    name: '张三',
    phone: '186 **** 8868',
    fullAddress: '广东省深圳市福田区亮亮路15号亮亮小区2号楼502号'
  },
  {
    name: '萌萌',
    phone: '189 **** 1698',
    fullAddress: '广东省深圳市罗湖区萌萌大道29号萌萌小区8号楼805号'
  },
  {
    name: '小雪',
    phone: '189 **** 1698',
    fullAddress: '湖北省武汉市光谷中心木木路126号木木小区5号楼1503号'
  }
]);

const selectedAddress = ref(addressList.value[0]);

const handleAddAddress = () => {
  const fullAddress = `${newAddressForm.value.region.join('')} ${newAddressForm.value.detail}`;
  addressList.value.push({
    name: newAddressForm.value.name,
    phone: newAddressForm.value.phone,
    fullAddress
  });
  addAddressDialogVisible.value = false;
};

const handleSelectAddress = () => {
  selectAddressDialogVisible.value = false;
};
</script>

<style scoped lang="scss">
.dialog-footer {
  text-align: right;
}

.confirm-address {
  margin: 20px 0;
}
</style>
