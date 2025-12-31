<!-- 
标题：			ordermanagementdetail.vue
功能：			订单管理详情页面
说明:         
当前版本：	1.0
开发信息：	Created by 张峰 2025-10-31
张峰     2025-10-31
修改内容：订单管理详情页面
 -->
<template>
  <el-dialog title="订单详情" v-model="dialogVisible" width="70%">
    <div class="supplier-edit-details">
      <!-- 基础信息 -->
      <el-form :model="formData" label-width="140px" class="form-container">
        <!-- <FormHeader title="订单进度" /> -->
        <!-- ✅ 根据状态动态显示 -->
        <template v-if="Number(formData.orderStatus) === 99">
          <!-- <el-steps :active="1" align-center finish-status="error">
            <el-step title="订单已取消"></el-step>
          </el-steps> -->
        </template>
        <template v-else>
          <el-steps :active="Number(formData.orderStatus)" align-center finish-status="success">
            <el-step title="买家下单" :description="formData.createTime || ''">
              <template #title>
                <div class="steps-text">买家下单</div>
              </template>
              <template #description>
                <div class="steps-text">{{ formData.createTime || '' }}</div>
              </template>
            </el-step>
            <el-step title="商家发货" :description="formData.deliveryTime || ''">
              <template #title>
                <div class="steps-text">商家发货</div>
              </template>
              <template #description>
                <div class="steps-text">{{ formData.deliveryTime || '' }}</div>
              </template>
            </el-step>
            <el-step title="交易成功" :description="formData.receiveTime || ''">
              <template #title>
                <div class="steps-text">交易成功</div>
              </template>
              <template #description>
                <div class="steps-text">{{ formData.receiveTime || '' }}</div>
              </template>
            </el-step>
          </el-steps>
        </template>
        <div class="order-status-section">
          <div v-if="Number(formData.orderStatus) === 1" class="status-block waiting">
            <div class="flex items-center mb-[12px]">
              <div class="status-title">等待商家发货</div>
              <div class="status-tip">如需修改收货地址，请联系供应商修改。</div>
            </div>
            <el-button type="primary" size="small" v-hasPermi="['grain:hnSalesOrder:edit']" class="ship-btn" @click="shipment" icon="Van">
              发货
            </el-button>
          </div>

          <div v-else-if="Number(formData.orderStatus) === 2" class="status-block shipped" style="display: flex; align-items: center">
            <div class="status-title">已发货，待买家收货</div>
            <div class="status-tip">供应商发货七天后自动变更为“已完成”。</div>
          </div>

          <div v-else-if="Number(formData.orderStatus) === 3" class="status-block finished">
            <div class="status-title">交易完成</div>
          </div>

          <div v-else-if="Number(formData.orderStatus) === 99" class="status-block">
            <div class="status-title" style="color: #bbbdbf">交易关闭</div>
          </div>
        </div>

        <div class="flex mb-[18px]">
          <el-row v-if="Number(formData.orderStatus) !== 1 && Number(formData.orderStatus) !== 99" class="flex-1 mr-[10px]">
            <el-col :span="24">
              <div class="info-card">
                <div class="flex justify-center mb-[10px]" style="border-bottom: 1px dotted #108c58">
                  <img src="./imgs/logistics.png" alt="" />
                </div>
                <div>
                  <div class="custom-label">包裹信息</div>
                  <el-row :gutter="20" class="detail-form">
                    <el-col :span="20">
                      <el-form-item label="配送方式" label-position="left" label-width="90px" class="clear-mb">
                        <span style="color: #abaeb5; padding-left: 11px">{{ getDeliveryMethodText(formData.deliveryOptions) }}</span>
                      </el-form-item>
                    </el-col>
                    <el-col :span="20">
                      <el-form-item label="发货人电话" label-position="left" label-width="90px" class="clear-mb">
                        <el-input v-model.trim="formData.enterprisePhone" disabled></el-input>
                      </el-form-item>
                    </el-col>
                    <el-col :span="20">
                      <el-form-item label="发货时间" label-position="left" label-width="90px" class="clear-mb">
                        <el-input v-model.trim="formData.deliveryTime" disabled></el-input>
                      </el-form-item>
                    </el-col>
                    <el-col :span="20">
                      <el-form-item label="物流单号" label-position="left" label-width="90px" class="clear-mb">
                        <el-input v-model.trim="formData.deliverySn" disabled></el-input>
                      </el-form-item>
                    </el-col>
                  </el-row>
                </div>
              </div>
            </el-col>
          </el-row>
          <el-row :gutter="20" class="flex-1">
            <el-col
              :span="Number(formData.orderStatus) !== 1 && Number(formData.orderStatus) !== 99 ? 24 : 12"
              :style="{ marginBottom: Number(formData.orderStatus) !== 1 && Number(formData.orderStatus) !== 99 ? '16px' : '0' }"
            >
              <div class="info-card">
                <div class="custom-label">订单信息</div>
                <el-row :gutter="20" class="detail-form">
                  <el-col :span="20">
                    <el-form-item label="销售订单号" label-position="left" label-width="90px" class="clear-mb">
                      <el-input v-model.trim="formData.orderSn" disabled></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="20">
                    <el-form-item label="下单时间" label-position="left" label-width="90px" class="clear-mb">
                      <el-input v-model.trim="formData.createTime" disabled></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="20">
                    <el-form-item label="订单状态" label-position="left" label-width="90px" class="clear-mb">
                      <el-select v-model="formData.orderStatus" placeholder="请选择订单状态" filterable clearable disabled>
                        <el-option v-for="dict in order_status" :key="dict.value" :label="dict.label" :value="dict.value" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="20">
                    <el-form-item label="商品总价" label-position="left" label-width="90px" class="clear-mb">
                      <span style="color: #da0621; padding-left: 12px">{{
                        ((Number(formData.goodsPrice) || 0) * (Number(formData.goodsQuantity) || 0)).toFixed(2)
                      }}</span>
                    </el-form-item>
                  </el-col>
                </el-row>
              </div>
            </el-col>

            <el-col :span="Number(formData.orderStatus) !== 1 && Number(formData.orderStatus) !== 99 ? 24 : 12">
              <div class="info-card">
                <div class="flex justify-between">
                  <div class="custom-label">收货人信息</div>
                  <span v-if="Number(formData.orderStatus) == 1" class="edit-link" v-hasPermi="['grain:hnSalesOrder:edit']" @click="openEditReceiver">
                    <el-icon><EditPen /></el-icon>
                  </span>
                </div>
                <el-row :gutter="20" class="detail-form">
                  <el-col :span="20">
                    <el-form-item label="收货人姓名" label-position="left" label-width="90px" class="clear-mb">
                      <el-input v-model.trim="formData.receiverName" disabled></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="20">
                    <el-form-item label="收货人电话" label-position="left" label-width="90px" class="clear-mb">
                      <el-input v-model.trim="formData.receiverPhone" disabled></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="20">
                    <el-form-item label="收货地址" label-position="left" label-width="90px" class="clear-mb">
                      <span style="color: #abaeb5; padding-left: 11px">{{ getFullAddress(formData) }}</span>
                    </el-form-item>
                  </el-col>
                </el-row>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-form>

      <div class="special-custom-label">商品信息</div>
      <el-table :data="[formData]" :style="{ width: '100%' }">
        <el-table-column prop="goodsName" label="商品名称" width="200" :show-overflow-tooltip="true">
          <template #default="{ row }">
            {{ row.goodsName || '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="goodsPrice" label="单价" width="220">
          <template #default="{ row }">
            <div class="text-[#108C58]">
              {{ row.goodsPrice ? '¥' + Number(row.goodsPrice).toFixed(2) : '0.00' }}
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="goodsQuantity" label="数量" align="center">
          <template #default="{ row }">
            {{ row.goodsQuantity || 0 }}
          </template>
        </el-table-column>

        <!--  小计：数量 × 单价 -->
        <el-table-column label="小计" align="center">
          <template #default="{ row }">
            <div class="text-[#108C58]">
              {{ '¥' + ((Number(row.goodsPrice) || 0) * (Number(row.goodsQuantity) || 0)).toFixed(2) }}
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-dialog v-model="editVisible" title="修改收货人信息" width="600px">
      <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="150px">
        <el-form-item label="收货人姓名：" prop="receiverName" :required="true">
          <el-input v-model.trim="editForm.receiverName" maxlength="20" show-word-limit></el-input>
        </el-form-item>

        <el-form-item label="收货人电话：" prop="receiverPhone" :required="true">
          <el-input v-model.trim="editForm.receiverPhone" maxlength="11" disabled></el-input>
        </el-form-item>

        <el-form-item label="收货地址：" prop="areaCodes" :required="true">
          <RegionSelect v-model="editForm.areaCodes" @regionChange="handleAreaChange" />
        </el-form-item>
        <el-form-item label="详细地址：" prop="receiverDetailAddress" :required="true">
          <el-input v-model.trim="editForm.receiverDetailAddress"></el-input>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" :loading="editloading" @click="saveReceiverInfo">保存</el-button>
      </template>
    </el-dialog>
    <!-- 发货 -->
    <el-dialog v-model="shipmentVisible" title="订单发货" width="600px">
      <span class="special-custom-label">商品信息</span>
      <el-table :data="[formData]" border :style="{ width: '100%' }">
        <el-table-column prop="goodsName" label="商品名称" width="200" :show-overflow-tooltip="true">
          <template #default="{ row }">
            {{ row.goodsName || '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="goodsPrice" label="单价" width="220">
          <template #default="{ row }">
            <div style="color: #108c58">
              {{ row.goodsPrice ? '¥' + Number(row.goodsPrice).toFixed(2) : '0.00' }}
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="goodsQuantity" label="数量" align="center">
          <template #default="{ row }">
            {{ row.goodsQuantity || 0 }}
          </template>
        </el-table-column>

        <!--  小计：数量 × 单价 -->
        <el-table-column label="小计" align="center">
          <template #default="{ row }">
            <div style="color: #108c58">
              {{ '¥' + ((Number(row.goodsPrice) || 0) * (Number(row.goodsQuantity) || 0)).toFixed(2) }}
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div style="border: 1px solid #108c58; padding: 12px 16px; margin-top: 18px">
        <span class="custom-label">配送信息</span>
        <el-form :model="shipmentForm" ref="shipmentFormFormRef" :rules="shipmentRules" label-width="100px">
          <el-form-item label="配送方式：" prop="deliveryOptions">
            <el-select v-model="shipmentForm.deliveryOptions" placeholder="请选择配送方式" @change="handleDeliveryOptionChange">
              <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"> </el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="收货人姓名：" prop="receiverName">
            <el-input v-model.trim="formData.receiverName" maxlength="11" disabled></el-input>
          </el-form-item>

          <el-form-item label="收货人电话：" prop="receiverPhone">
            <el-input v-model.trim="formData.receiverPhone" maxlength="11" disabled></el-input>
          </el-form-item>

          <el-form-item label="收货地址：" prop="areaCodes">
            <span style="color: #abaeb5">{{ getFullAddress(formData) }}</span>
          </el-form-item>
        </el-form>
      </div>
      <template v-if="logisticsVisible">
        <div style="border: 1px solid #108c58; padding: 12px 16px; margin-top: 18px">
          <span class="custom-label">物流信息</span>
          <el-form :model="logisticsForm" :rules="logisticsRules" ref="logisticsFormFormRef" label-width="100px">
            <el-form-item label="快递公司：" prop="deliveryCompany">
              <el-input v-model.trim="logisticsForm.deliveryCompany" placeholder="请输入快递公司" maxlength="20"></el-input>
            </el-form-item>

            <el-form-item label="物流单号：" prop="deliverySn">
              <el-input v-model.trim="logisticsForm.deliverySn" placeholder="请输入物流单号" maxlength="20"></el-input>
            </el-form-item>
          </el-form>
        </div>
      </template>
      <template #footer>
        <el-button @click="shipmentVisible = false">取消</el-button>
        <el-button type="primary" :loading="shipmentloading" @click="shipmentInfo">保存</el-button>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance, toRefs } from 'vue';
import { ElMessage } from 'element-plus';
import FormHeader from '@/components/FormHeader/index.vue';
import { getorderdetail, modifypersonnel } from '@/api/supplier/productManagement/ordermanagement';
import RegionSelect from '@/components/RegionSelect/index.vue';
const { proxy } = getCurrentInstance() as any;
const { order_status } = toRefs<any>(proxy?.useDict('order_status'));

const emit = defineEmits(['update_table']);
const detailId = ref();

const editVisible = ref(false); //修改收货人信息
const editloading = ref(false);
const dialogVisible = ref(false); //订单详情弹窗
const editFormRef = ref(null);
const shipmentVisible = ref(false);
const shipmentloading = ref(false);
const shipmentFormFormRef = ref(null);
const logisticsFormFormRef = ref(null);
const logisticsVisible = ref(false);
const formData = ref({
  id: undefined,
  orderSn: '',
  orderStatus: '',
  deliveryOptions: '',
  enterpriseName: '',
  enterprisePhone: '',
  receiverName: '',
  receiverPhone: '',
  receiverDetailAddress: '',
  receiverCity: '',
  receiverRegion: '',
  receiverProvince: '',
  deliverySn: '',
  deliveryCompany: '',
  totalAmount: '',
  createTime: '',
  orderItems: [],
  deliveryTime: '',
  receiveTime: '',
  goodsPrice: '',
  goodsQuantity: '',
  receiverProvinceCode: '',
  receiverCityCode: '',
  receiverRegionCode: ''
});
const editForm = ref({
  receiverName: '',
  receiverPhone: '',
  receiverDetailAddress: '', //详细地址
  areaCodes: [], //作为回显的数据，不参与参数传递
  receiverProvinceCode: '', //省份code
  receiverProvince: '', //省份名
  receiverCityCode: '', //城市code
  receiverCity: '', //城市名
  receiverRegionCode: '', //区县code
  receiverRegion: '' //区县名
});
/* 发货配送信息 */
const shipmentForm = ref({
  deliveryOptions: '' //配送方式
});
/* 物流信息 */
const logisticsForm = ref({
  deliveryCompany: '', //快递公司
  deliverySn: '' //物流单号
});
const options = ref([
  {
    value: '1',
    label: '同城自提'
  },
  {
    value: '2',
    label: '快递'
  }
]);
/* 校验 */
const editRules = {
  receiverName: [
    { required: true, message: '收货人姓名为必填项', trigger: 'blur' },
    { min: 1, max: 20, message: '姓名长度不能超过20个字符', trigger: 'blur' }
  ],
  receiverDetailAddress: [
    { required: true, message: '详细地址为必填项', trigger: 'blur' },
    { min: 1, max: 200, message: '详细地址长度不能超过200个字符', trigger: 'blur' }
  ],
  receiverPhone: [
    { required: true, message: '收货人电话不能为空', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        const phoneRegex = /^1[3-9]\d{9}$/;
        if (!phoneRegex.test(value)) {
          callback(new Error('请输入有效的11位手机号'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ],
  areaCodes: [{ required: true, message: '请选择收货地址', trigger: 'change' }]
};
/* 发货表单校验 */
const shipmentRules = {
  deliveryOptions: [{ required: true, message: '请选择配送方式', trigger: 'change' }]
};
/* 发货物流校验 */
const logisticsRules = {
  deliveryCompany: [{ required: true, message: '请输入快递公司', trigger: 'blur' }],
  deliverySn: [
    { required: true, message: '请输入物流单号', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        const patterns = {
          '圆通快递': /^YT\d{13}$/,
          '中通快递': /^7353\d{10}$/,
          '申通快递': /^77203\d{10}$/,
          '韵达快递': /^(43415\d{10}|31250\d{10})$/,
          '极兔快递': /^JT\d{13}$/,
          '京东快递': /^JD[A-Za-z]{1,2}\d{12}$/,
          '德邦快递': /^DPK\d{12}$/,
          '德邦物流': /^DPL\d{12}$/,
          '顺丰快递': /^SF\d{13}$/,
          'EMS': /^(E\d{10}CS|\d{13})$/,
          '跨越速运': /^KYE\d{7}$/
        };

        const company = logisticsForm.value.deliveryCompany;
        if (patterns[company] && !patterns[company].test(value)) {
          callback(new Error('物流单号格式不正确'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
};

const openDetailDialog = (id: string) => {
  detailId.value = id;
  getdetail();
  dialogVisible.value = true;
};

// 监听配送方式变化
const handleDeliveryOptionChange = (value) => {
  console.log('配送方式', value);

  if (value === '1') {
    // 如果选择的是同城自提，隐藏物流信息
    logisticsForm.value.deliveryCompany = '';
    logisticsForm.value.deliverySn = '';
    logisticsVisible.value = false; // 隐藏物流信息
  } else if (value === '2') {
    // 如果选择的是快递，显示物流信息
    logisticsForm.value.deliveryCompany = '';
    logisticsForm.value.deliverySn = '';
    logisticsVisible.value = true; // 显示物流信息
  }
};

const getdetail = () => {
  getorderdetail(detailId.value as string)
    .then((res) => {
      formData.value = res.data;
    })
    .catch((error) => {
      console.error('获取订单详情失败:', error);
    });
};
/** 获取配送方式文本 */
const getDeliveryMethodText = (deliveryOptions: string | number) => {
  const methodMap: Record<string, string> = {
    '1': '同城自提',
    '2': '快递'
  };
  return methodMap[String(deliveryOptions)] || '-';
};

const getFullAddress = (row: any) => {
  const parts = [row.receiverProvince, row.receiverCity, row.receiverRegion, row.receiverDetailAddress].filter(Boolean);
  return parts.join('') || '-';
};
/* 修改收货人信息 */
const openEditReceiver = () => {
  const f = formData.value;
  Object.assign(editForm.value, {
    receiverName: f.receiverName?.trim() || '',
    receiverPhone: f.receiverPhone || '',
    receiverProvinceCode: f.receiverProvinceCode,
    receiverProvince: f.receiverProvince,
    receiverCityCode: f.receiverCityCode,
    receiverCity: f.receiverCity,
    receiverRegionCode: f.receiverRegionCode,
    receiverRegion: f.receiverRegion,
    receiverDetailAddress: f.receiverDetailAddress,
    areaCodes: [f.receiverProvinceCode, f.receiverCityCode, f.receiverRegionCode].filter(Boolean)
  });
  console.log('editForm.value', editForm.value);

  editVisible.value = true;
};
/* 选中地区 */
const handleAreaChange = (val) => {
  if (!val || !Array.isArray(val.regionPath) || val.regionPath.length < 3) {
    Object.assign(editForm.value, {
      areaCodes: [],
      receiverProvinceCode: '',
      receiverProvince: '',
      receiverCityCode: '',
      receiverCity: '',
      receiverRegionCode: '',
      receiverRegion: ''
    });
    return;
  }

  const { regionPath, provinceCode, province, cityCode, city, regionCode, region } = val;
  Object.assign(editForm.value, {
    areaCodes: regionPath,
    receiverProvinceCode: provinceCode,
    receiverProvince: province,
    receiverCityCode: cityCode,
    receiverCity: city,
    receiverRegionCode: regionCode,
    receiverRegion: region
  });
};

/* 发货 */
const shipment = () => {
  shipmentVisible.value = true;
};
/* 保存修改收货人信息 */
const saveReceiverInfo = async () => {
  try {
    await editFormRef.value?.validate();
  } catch (_err) {
    // 表单校验未通过，阻止提交
    return;
  }

  try {
    editloading.value = true;

    if (!Array.isArray(editForm.value.areaCodes) || editForm.value.areaCodes.length < 3) {
      ElMessage.warning('请选择收货地址');
      editloading.value = false;
      return;
    }

    if (!editForm.value.receiverDetailAddress || !editForm.value.receiverDetailAddress.trim()) {
      ElMessage.warning('请输入详细地址');
      editloading.value = false;
      return;
    }

    editForm.value.receiverDetailAddress = editForm.value.receiverDetailAddress.trim();

    const [provinceCode, cityCode, regionCode] = editForm.value.areaCodes;

    const params = {
      id: detailId.value,
      receiverName: editForm.value.receiverName.trim(),
      receiverPhone: editForm.value.receiverPhone,
      receiverProvinceCode: provinceCode,
      receiverProvince: editForm.value.receiverProvince,
      receiverCityCode: cityCode,
      receiverCity: editForm.value.receiverCity,
      receiverRegionCode: regionCode,
      receiverRegion: editForm.value.receiverRegion,
      receiverDetailAddress: editForm.value.receiverDetailAddress
    };

    await modifypersonnel(params);
    getdetail(); //更新页面
    // 更新外部页面
    emit('update_table');
    ElMessage.success('收货人信息已更新');
    editVisible.value = false;
  } catch (error) {
    // if (error) ElMessage.error(error);
  } finally {
    editloading.value = false;
  }
};
/* 发货信息修改 */
const shipmentInfo = async () => {
  // 先校验表单，若校验失败直接返回，不弹出全局报错
  try {
    await shipmentFormFormRef.value.validate();
    if (shipmentForm.value.deliveryOptions === '2') {
      await logisticsFormFormRef.value.validate();
    }
  } catch (err) {
    return;
  }

  try {
    shipmentloading.value = true;
    const params: Record<string, any> = {
      id: detailId.value,
      orderStatus: '2',
      deliveryOptions: shipmentForm.value.deliveryOptions
    };
    if (shipmentForm.value.deliveryOptions === '2') {
      params.deliveryCompany = logisticsForm.value.deliveryCompany.trim();
      params.deliverySn = logisticsForm.value.deliverySn.trim();
    }

    await modifypersonnel(params);
    shipmentVisible.value = false;
    getdetail();
    ElMessage.success('发货成功');
  } catch (error) {
    // ElMessage.error(error);
  } finally {
    shipmentloading.value = false;
  }
};

defineExpose({
  openDetailDialog
});
</script>

<style scoped lang="scss">
.supplier-edit-details {
  padding: 0 24px;
  .form-container {
    :deep(.clear-mb) {
      margin-bottom: 0 !important;
    }
    .steps-text {
      font-family:
        PingFang SC,
        PingFang SC;
      font-weight: 500;
      font-size: 14px;
      color: #333333;
    }
  }
}

/* 类似 a 标签的“修改”文字 */
.edit-link {
  // position: relative;
  // left: 10%;
  /* 可根据 FormHeader 宽度微调 */
  // top: -45px;
  /* 让它和标题垂直对齐，可根据实际视觉调整 */
  color: #108c58;
  cursor: pointer;
  font-size: 14px;
  user-select: none;
  transition: color 0.2s;

  &:hover {
    color: #66b1ff;
    text-decoration: underline;
  }
}

.order-status-section {
  margin: 20px 0 18px;
  text-align: left;

  .status-block {
    display: inline-block;
    // background: #f9f9f9;
    // border-radius: 8px;
    // padding: 16px 24px;
    // box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
    min-width: 320px;
  }

  .status-title {
    font-size: 16px;
    font-weight: 600;
    color: #108c58;
    margin-right: 16px;
  }

  .status-tip {
    font-size: 13px;
    color: #888;
  }

  .ship-btn {
    margin-top: 6px;
  }
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

.custom-label {
  font-weight: 500;
  font-size: 14px;
  color: #108c58;
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
}

.info-card {
  border: 1px solid #108c58;
  padding: 12px 16px;
  height: 100%;
  border-radius: 2px;
}
</style>
