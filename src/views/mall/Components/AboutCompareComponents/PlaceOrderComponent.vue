<template>
  <teleport to="body">
    <transition name="dialog-fade">
      <div v-if="dialogVisible" class="order-dialog-overlay" @click.self="handleClose">
        <div class="order-dialog">
          <!-- 弹窗头部 -->
          <div class="order-dialog__header">
            <div class="order-dialog__title">确认收货地址</div>
            <el-icon class="order-dialog__close" @click="handleClose">
              <Close />
            </el-icon>
          </div>
          <!-- 弹窗内容 -->
          <div class="order-dialog__body">
            <!-- 收货地址信息 -->
            <div class="address-section">
              <div class="address-header">
                <div class="address-label">
                  <el-icon class="location-icon">
                    <Location />
                  </el-icon>
                  <span v-if="selectedAddress?.isDefault === '1'" class="default-tag">默认地址</span>
                  <el-link type="primary" :underline="false" class="modify-link"
                    @click="handleModifyAddress">修改地址</el-link>
                </div>
                <div class="address-actions">
                  <el-button type="primary" plain @click="handleSwitchAddress">切换地址</el-button>
                  <el-button type="primary" @click="handleNewAddress">新建地址</el-button>
                </div>
              </div>
              <div v-if="selectedAddress" class="address-info">
                <div class="info-item">
                  <span class="info-label">收货人姓名</span>
                  <span class="info-value">{{ selectedAddress.receiverName }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">收货人电话</span>
                  <span class="info-value">{{ selectedAddress.receiverPhone }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">收货地址</span>
                  <span class="info-value">{{ fullAddress }}</span>
                </div>
              </div>
            </div>

            <!-- 商品列表 -->
            <div class="product-section">
              <el-table :data="orderItems" border style="width: 100%">
                <el-table-column label="商品名称" min-width="400">
                  <template #default="{ row }">
                    <div class="product-info">
                      <el-image :src="row.image" fit="cover" class="product-image" />
                      <div class="product-details">
                        <div class="product-name">{{ row.name }}</div>
                        <div class="product-spec">{{ row.spec }}</div>
                      </div>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="单价" width="150" align="center">
                  <template #default="{ row }">
                    <span class="price-text">¥{{ row.unitPrice }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="数量" width="200" align="center">
                  <template #default="{ row }">
                    <el-input-number v-model="row.quantity" :min="1" @change="updateTotalAmount" />
                  </template>
                </el-table-column>
                <el-table-column label="金额合计" width="150" align="center">
                  <template #default="{ row }">
                    <span class="price-text">¥{{ (row.unitPrice * row.quantity).toFixed(2) }}</span>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>

          <!-- 底部总金额和提交按钮 -->
          <div class="order-dialog__footer">
            <div class="order-footer">
              <div class="total-amount">
                商品总金额: <span class="total-price">¥{{ totalAmount.toFixed(2) }}</span>
              </div>
              <el-button type="primary" size="large" class="submit-btn" @click="handleSubmitOrder">
                提交订单
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>

  <!-- 切换地址弹窗 -->
  <el-dialog v-model="switchAddressDialogVisible" title="选择地址" width="600px" append-to-body>
    <div v-if="addressList.length > 0" class="address-list">
      <div
        v-for="address in addressList"
        :key="address.id"
        :class="['address-item', { 'address-item-selected': tempSelectedAddressId === address.id }]"
        @click="tempSelectedAddressId = address.id"
      >
        <div v-if="address.isDefault === '1'" class="default-address-tag">默认地址</div>
        <div class="address-item-content">
          <div class="address-line">收货人姓名: {{ address.receiverName }}</div>
          <div class="address-line">收货人电话: {{ maskPhone(address.receiverPhone) }}</div>
          <div class="address-line">收货地址: {{ getFullAddress(address) }}</div>
        </div>
        <el-icon v-if="tempSelectedAddressId === address.id" class="address-check-icon">
          <Check />
        </el-icon>
      </div>
    </div>
    <el-empty v-else description="暂无收货地址" :image-size="120">
      <el-button type="primary" @click="handleNewAddress">新建地址</el-button>
    </el-empty>
    <template #footer>
      <el-button @click="switchAddressDialogVisible = false">取消</el-button>
      <el-button v-if="addressList.length > 0" type="primary" @click="handleConfirmSwitchAddress">确定</el-button>
    </template>
  </el-dialog>

  <!-- 新建/修改地址弹窗 -->
  <el-dialog v-model="addressFormDialogVisible" :title="addressFormTitle" width="600px" append-to-body>
    <el-form ref="addressFormRef" :model="addressForm" :rules="addressFormRules" label-width="120px">
      <el-form-item label="收货人姓名：" prop="receiverName" required>
        <el-input v-model="addressForm.receiverName" placeholder="请输入收货人姓名" maxlength="20" show-word-limit />
      </el-form-item>
      <el-form-item label="收货人电话：" prop="receiverPhone" required>
        <el-input v-model="addressForm.receiverPhone" placeholder="请输入收货人电话" maxlength="11" @input="handlePhoneInput" />
      </el-form-item>
      <el-form-item label="收货地址：" prop="regionPath" required>
        <RegionSelect v-model="addressForm.regionPath" @regionChange="handleRegionChange" />
      </el-form-item>
      <el-form-item label="详细地址：" prop="detailAddress" required>
        <el-input v-model="addressForm.detailAddress" type="textarea" :rows="3" placeholder="请输入详细地址" />
      </el-form-item>
      <el-form-item label="设为默认地址：">
        <el-switch v-model="isDefaultSwitch" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="addressFormDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleSaveAddress">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { Location, Close, Check } from '@element-plus/icons-vue';
import { userAddressList, userAddressAdd, userAddressUpdate, type Address } from '@/api/mall/personalCenter/addressManagement';
import { productOrder } from '@/api/mall/goods/index';
import RegionSelect from '@/components/RegionSelect/index.vue';

const props = defineProps<{
  modelValue: boolean;
  goods?: any; // 使用 any 类型避免类型检查过于严格
  selectedSpecId?: number | null;
  quantity?: number;
  selectedAddressId?: number | null; // 从商品详情页传入的选中地址ID
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'submit': [data: any];
}>();

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

// 地址相关
const addressList = ref<Address[]>([]);
const selectedAddress = ref<Address | null>(null);
const switchAddressDialogVisible = ref(false);
const tempSelectedAddressId = ref<number | null>(null);

// 地址表单
const addressFormDialogVisible = ref(false);
const addressFormTitle = ref('新建地址');
const addressForm = ref<Partial<Address>>({
  receiverName: '',
  receiverPhone: '',
  regionPath: [],
  detailAddress: '',
  isDefault: '0'
});
const editingAddressId = ref<number | null>(null);
const addressFormRef = ref();

// 手机号验证规则
const validatePhone = (rule: any, value: string, callback: Function) => {
  if (!value) {
    callback(new Error('请输入收货人电话'));
    return;
  }
  // 必须是11位数字，且首位为1，第二位必须是3、4、5、6、7、8、9中的一个
  const phoneRegex = /^1[3-9]\d{9}$/;
  if (!phoneRegex.test(value)) {
    callback(new Error('手机号格式不正确'));
    return;
  }
  callback();
};

// 姓名验证规则
const validateName = (rule: any, value: string, callback: Function) => {
  if (!value) {
    callback(new Error('请输入收货人姓名'));
    return;
  }
  if (value.length > 20) {
    callback(new Error('收货人姓名不能超过20个字符'));
    return;
  }
  callback();
};

// 地区选择验证规则
const validateRegion = (rule: any, value: any, callback: Function) => {
  if (!value || !Array.isArray(value) || value.length === 0) {
    callback(new Error('请选择收货地址'));
    return;
  }
  // 检查是否选择了完整的省市区
  if (value.length < 3) {
    callback(new Error('请选择完整的省市区'));
    return;
  }
  callback();
};

// 详细地址验证规则
const validateDetailAddress = (rule: any, value: string, callback: Function) => {
  if (!value || value.trim() === '') {
    callback(new Error('请输入详细地址'));
    return;
  }
  if (value.trim().length === 0) {
    callback(new Error('详细地址不能为空'));
    return;
  }
  callback();
};

// 表单验证规则
const addressFormRules = {
  receiverName: [
    { validator: validateName, trigger: 'blur' }
  ],
  receiverPhone: [
    { validator: validatePhone, trigger: 'blur' }
  ],
  regionPath: [
    { validator: validateRegion, trigger: 'change' }
  ],
  detailAddress: [
    { validator: validateDetailAddress, trigger: 'blur' }
  ]
};

// 默认地址开关（用于 el-switch）
const isDefaultSwitch = computed({
  get: () => addressForm.value.isDefault === '1',
  set: (value: boolean) => {
    addressForm.value.isDefault = value ? '1' : '0';
  }
});

// 订单商品列表
const orderItems = ref<Array<{
  id: number;
  name: string;
  spec: string;
  image: string;
  unitPrice: number;
  quantity: number;
}>>([]);

// 计算总金额
const totalAmount = computed(() => {
  return orderItems.value.reduce((sum, item) => {
    return sum + item.unitPrice * item.quantity;
  }, 0);
});

// 计算完整地址
const fullAddress = computed(() => {
  if (!selectedAddress.value) return '';
  return getFullAddress(selectedAddress.value);
});

// 获取完整地址字符串
const getFullAddress = (address: Address) => {
  const parts = [];
  if (address.province) parts.push(address.province);
  if (address.city) parts.push(address.city);
  if (address.region) parts.push(address.region);
  if (address.detailAddress) parts.push(address.detailAddress);
  return parts.join('');
};

// 隐藏手机号中间部分
const maskPhone = (phone: string) => {
  if (!phone || phone.length < 7) return phone;
  return phone.substring(0, 3) + ' **** ' + phone.substring(phone.length - 4);
};

// 更新总金额（当数量变化时）
const updateTotalAmount = () => {
  // 计算属性会自动更新
};

// 获取地址列表
const fetchAddressList = async () => {
  try {
    const res = await userAddressList();
    if (res.code === 200 && res.rows) {
      addressList.value = res.rows;
      // 优先使用传入的地址ID，否则使用默认地址
      if (props.selectedAddressId) {
        const address = addressList.value.find(addr => addr.id === props.selectedAddressId);
        selectedAddress.value = address || null;
      }
      // 如果没有传入地址ID或找不到对应地址，使用默认地址
      if (!selectedAddress.value) {
        const defaultAddress = addressList.value.find(addr => addr.isDefault === '1');
        selectedAddress.value = defaultAddress || addressList.value[0] || null;
      }
    }
  } catch (error) {
    console.error('获取地址列表失败:', error);
  }
};

// 初始化订单商品
const initOrderItems = () => {
  if (!props.goods || !props.selectedSpecId) {
    orderItems.value = [];
    return;
  }

  const spec = props.goods.hnGoodsSpecificationDataList?.find(s => s.id === props.selectedSpecId);
  if (!spec) {
    orderItems.value = [];
    return;
  }

  const specText = `${spec.goodsSpecificationValue || ''}${spec.goodsSpecification || ''}`;
  const unitPrice = parseFloat(String(spec.goodsPrice || 0));

  orderItems.value = [{
    id: props.goods.id || 0,
    name: props.goods.goodsName || '',
    spec: specText,
    image: props.goods.sysOssLists?.[0]?.url || '',
    unitPrice: unitPrice,
    quantity: props.quantity || 1
  }];
};

// 切换地址
const handleSwitchAddress = () => {
  switchAddressDialogVisible.value = true;
  tempSelectedAddressId.value = selectedAddress.value?.id || null;
};

// 确认切换地址
const handleConfirmSwitchAddress = () => {
  if (tempSelectedAddressId.value) {
    selectedAddress.value = addressList.value.find(addr => addr.id === tempSelectedAddressId.value) || null;
  }
  switchAddressDialogVisible.value = false;
};

// 新建地址
const handleNewAddress = () => {
  addressFormTitle.value = '新建地址';
  editingAddressId.value = null;
  addressForm.value = {
    receiverName: '',
    receiverPhone: '',
    regionPath: [],
    detailAddress: '',
    isDefault: '0'
  };
  addressFormDialogVisible.value = true;
};

// 修改地址
const handleModifyAddress = () => {
  if (!selectedAddress.value) {
    ElMessage.warning('请先选择地址');
    return;
  }
  addressFormTitle.value = '修改地址';
  editingAddressId.value = selectedAddress.value.id || null;
  
  // 构建地区路径，优先使用 regionPath，如果没有则根据省市区编码构建
  let regionPath: [string?, string?, string?] = [undefined, undefined, undefined];
  if (selectedAddress.value.regionPath && Array.isArray(selectedAddress.value.regionPath) && selectedAddress.value.regionPath.length > 0) {
    regionPath = [
      selectedAddress.value.regionPath[0],
      selectedAddress.value.regionPath[1],
      selectedAddress.value.regionPath[2]
    ];
  } else if (selectedAddress.value.provinceCode && selectedAddress.value.cityCode && selectedAddress.value.regionCode) {
    regionPath = [
      selectedAddress.value.provinceCode,
      selectedAddress.value.cityCode,
      selectedAddress.value.regionCode
    ];
  }
  
  addressForm.value = {
    receiverName: selectedAddress.value.receiverName,
    receiverPhone: selectedAddress.value.receiverPhone,
    regionPath: regionPath,
    province: selectedAddress.value.province,
    city: selectedAddress.value.city,
    region: selectedAddress.value.region,
    provinceCode: selectedAddress.value.provinceCode,
    cityCode: selectedAddress.value.cityCode,
    regionCode: selectedAddress.value.regionCode,
    detailAddress: selectedAddress.value.detailAddress,
    isDefault: selectedAddress.value.isDefault || '0'
  };
  addressFormDialogVisible.value = true;
};

// 地区选择变化
const handleRegionChange = (value: any) => {
  if (value && value.regionPath && Array.isArray(value.regionPath) && value.regionPath.length > 0) {
    // RegionSelect 组件返回的是包含 regionPath, province, city, region 等字段的对象
    // 有选择值时，更新所有相关字段
    if (value.regionPath) {
      addressForm.value.regionPath = value.regionPath;
    }
    if (value.province) {
      addressForm.value.province = value.province;
    }
    if (value.city) {
      addressForm.value.city = value.city;
    }
    if (value.region) {
      addressForm.value.region = value.region;
    }
    if (value.provinceCode) {
      addressForm.value.provinceCode = value.provinceCode;
    }
    if (value.cityCode) {
      addressForm.value.cityCode = value.cityCode;
    }
    if (value.regionCode) {
      addressForm.value.regionCode = value.regionCode;
    }
  } else {
    // 清空时，清空所有地址相关字段
    addressForm.value.regionPath = [];
    addressForm.value.province = undefined;
    addressForm.value.city = undefined;
    addressForm.value.region = undefined;
    addressForm.value.provinceCode = undefined;
    addressForm.value.cityCode = undefined;
    addressForm.value.regionCode = undefined;
  }
};

// 手机号输入处理（只允许数字）
const handlePhoneInput = (value: string) => {
  // 只保留数字
  addressForm.value.receiverPhone = value.replace(/\D/g, '');
};

// 保存地址
const handleSaveAddress = async () => {
  if (!addressFormRef.value) return;

  try {
    // 表单验证
    await addressFormRef.value.validate();
  } catch (error) {
    // 验证失败，不继续执行
    return;
  }

  // 验证必填字段
  if (!addressForm.value.receiverName || !addressForm.value.receiverPhone) {
    ElMessage.warning('请填写完整信息');
    return;
  }

  // 验证地区选择
  if (!addressForm.value.regionPath || !Array.isArray(addressForm.value.regionPath) || addressForm.value.regionPath.length === 0) {
    ElMessage.warning('请选择收货地址');
    return;
  }
  if (addressForm.value.regionPath.length < 3) {
    ElMessage.warning('请选择完整的省市区');
    return;
  }

  // 验证详细地址
  if (!addressForm.value.detailAddress || addressForm.value.detailAddress.trim() === '') {
    ElMessage.warning('请输入详细地址');
    return;
  }

  // 再次验证手机号格式
  const phoneRegex = /^1[3-9]\d{9}$/;
  if (!phoneRegex.test(addressForm.value.receiverPhone)) {
    ElMessage.error('手机号格式不正确');
    return;
  }

  // 验证姓名长度
  if (addressForm.value.receiverName.length > 20) {
    ElMessage.error('收货人姓名不能超过20个字符');
    return;
  }

  try {
    // 构建地址数据，确保清空时字段也为空
    const addressData: Partial<Address> = {
      receiverName: addressForm.value.receiverName,
      receiverPhone: addressForm.value.receiverPhone,
      detailAddress: addressForm.value.detailAddress,
      isDefault: addressForm.value.isDefault || '0'
    };

    // 只有当 regionPath 存在且不为空时，才添加地址相关字段
    if (addressForm.value.regionPath && Array.isArray(addressForm.value.regionPath) && addressForm.value.regionPath.length > 0) {
      addressData.regionPath = addressForm.value.regionPath;
      addressData.province = addressForm.value.province || '';
      addressData.city = addressForm.value.city || '';
      addressData.region = addressForm.value.region || '';
      addressData.provinceCode = addressForm.value.provinceCode || '';
      addressData.cityCode = addressForm.value.cityCode || '';
      addressData.regionCode = addressForm.value.regionCode || '';
    } else {
      // 清空地址时，明确设置为空值
      addressData.regionPath = [];
      addressData.province = '';
      addressData.city = '';
      addressData.region = '';
      addressData.provinceCode = '';
      addressData.cityCode = '';
      addressData.regionCode = '';
    }

    if (editingAddressId.value) {
      // 更新地址
      addressData.id = editingAddressId.value;
      const res = await userAddressUpdate(addressData as Address);
      if (res.code === 200) {
        ElMessage.success('修改地址成功');
        await fetchAddressList();
        addressFormDialogVisible.value = false;
      }
    } else {
      // 新增地址
      const res = await userAddressAdd(addressData as Address);
      if (res.code === 200) {
        ElMessage.success('新增地址成功');
        await fetchAddressList();
        addressFormDialogVisible.value = false;
      }
    }
  } catch (error) {
    console.error('保存地址失败:', error);
    ElMessage.error('保存地址失败');
  }
};

// 提交订单
const handleSubmitOrder = async () => {
  if (!selectedAddress.value) {
    ElMessage.warning('请选择收货地址');
    return;
  }

  if (orderItems.value.length === 0) {
    ElMessage.warning('订单商品不能为空');
    return;
  }

  if (!props.goods || !props.selectedSpecId) {
    ElMessage.warning('商品信息不完整');
    return;
  }

  const spec = props.goods.hnGoodsSpecificationDataList?.find(s => s.id === props.selectedSpecId);
  if (!spec) {
    ElMessage.warning('商品规格信息不存在');
    return;
  }

  try {
    const currentItem = orderItems.value[0];
    const orderData = {
      totalAmount: totalAmount.value,
      enterpriseId: props.goods.enterpriseId || props.goods.hnBaseEnterpriseInfo?.id,
      receiverName: selectedAddress.value.receiverName,
      receiverPhone: selectedAddress.value.receiverPhone,
      receiverProvinceCode: selectedAddress.value.provinceCode,
      receiverProvince: selectedAddress.value.province,
      receiverCityCode: selectedAddress.value.cityCode,
      receiverCity: selectedAddress.value.city,
      receiverRegionCode: selectedAddress.value.regionCode,
      receiverRegion: selectedAddress.value.region,
      receiverDetailAddress: selectedAddress.value.detailAddress,
      note: '', // 备注，可以后续添加输入框
      goodsId: props.goods.id,
      goodsSpecificationId: props.selectedSpecId,
      goodsPrice: parseFloat(String(spec.goodsPrice || 0)),
      goodsQuantity: currentItem?.quantity || props.quantity || 1
    };

    const res = await productOrder(orderData);
    if (res.code === 200) {
      ElMessage.success('订单提交成功');
      emit('submit', orderData);
      handleClose();
    } else {
      ElMessage.error(res.msg || '订单提交失败');
    }
  } catch (error) {
    console.error('提交订单失败:', error);
    ElMessage.error('订单提交失败');
  }
};

// 关闭弹窗
const handleClose = () => {
  emit('update:modelValue', false);
};

// 监听弹窗显示状态
watch(() => props.modelValue, (visible) => {
  if (visible) {
    fetchAddressList();
    initOrderItems();
  }
});

// 监听商品和规格变化
watch([() => props.goods, () => props.selectedSpecId, () => props.quantity], () => {
  if (dialogVisible.value) {
    initOrderItems();
  }
}, { deep: true });
</script>

<style scoped lang="scss">
.order-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.order-dialog {
  width: 1200px;
  height: 70vh;
  max-height: 70vh;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &__header {
    flex-shrink: 0;
    padding: 20px 20px 10px;
    border-bottom: 1px solid #ebeef5;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .order-dialog__title {
      font-size: 18px;
      font-weight: 500;
      color: #303133;
    }

    .order-dialog__close {
      font-size: 20px;
      color: #909399;
      cursor: pointer;
      transition: color 0.3s;

      &:hover {
        color: #303133;
      }
    }
  }

  &__body {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 20px;
    min-height: 0;
  }

  &__footer {
    flex-shrink: 0;
    padding: 10px 20px 20px;
    border-top: 1px solid #ebeef5;
  }
}

// 弹窗动画
.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.3s;
}

.dialog-fade-enter-active .order-dialog,
.dialog-fade-leave-active .order-dialog {
  transition: transform 0.3s;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}

.dialog-fade-enter-from .order-dialog,
.dialog-fade-leave-to .order-dialog {
  transform: scale(0.9);
}

.address-section {
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f8f8;
  border-radius: 4px;

  .address-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .address-label {
      display: flex;
      align-items: center;
      gap: 8px;

      .location-icon {
        color: #108C58;
        font-size: 16px;
      }

      .default-tag {
        padding: 2px 8px;
        background: #108C58;
        color: #fff;
        border-radius: 2px;
        font-size: 12px;
      }

      .modify-link {
        margin-left: 8px;
      }
    }

    .address-actions {
      display: flex;
      gap: 12px;
    }
  }

  .address-info {
    .info-item {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      font-size: 14px;

      &:last-child {
        margin-bottom: 0;
      }

      .info-label {
        color: #666;
        margin-right: 8px;
        min-width: 80px;
      }

      .info-value {
        color: #333;
        flex: 1;
      }
    }
  }
}

.product-section {
  margin-bottom: 20px;
  width: 100%;

  :deep(.el-table) {
    width: 100%;
  }

  .product-info {
    display: flex;
    align-items: center;
    gap: 12px;

    .product-image {
      width: 60px;
      height: 60px;
      border-radius: 4px;
    }

    .product-details {
      flex: 1;

      .product-name {
        font-size: 14px;
        color: #333;
        margin-bottom: 4px;
      }

      .product-spec {
        font-size: 12px;
        color: #999;
      }
    }
  }

  .price-text {
    color: #e53935;
    font-weight: 500;
  }
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;

  .total-amount {
    font-size: 16px;
    color: #333;

    .total-price {
      color: #e53935;
      font-size: 18px;
      font-weight: bold;
    }
  }

  .submit-btn {
    width: 160px;
    height: 50px;
    background: #108C58;
    border-color: #108C58;
    font-size: 16px;
  }
}

.address-list {
  width: 100%;

  .address-item {
    position: relative;
    margin-bottom: 16px;
    padding: 16px;
    box-sizing: border-box;
    border: 2px solid #e0e0e0;
    border-radius: 4px;
    background: #fff;
    cursor: pointer;
    transition: border-color 0.3s ease;
    min-height: 120px;

    &:hover {
      border-color: #ccc;
    }

    &.address-item-selected {
      border-color: #e53935;
      background: #fff;
    }

    .address-item-content {
      .address-line {
        font-size: 14px;
        color: #333;
        line-height: 24px;
        margin-bottom: 4px;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }

    .address-check-icon {
      position: absolute;
      bottom: 12px;
      right: 12px;
      font-size: 20px;
      color: #e53935;
    }

    .default-address-tag {
      position: absolute;
      top: 12px;
      right: 12px;
      padding: 4px 8px;
      background: #108C58;
      color: #fff;
      font-size: 12px;
      border-radius: 4px;
      z-index: 1;
    }
  }
}
</style>
