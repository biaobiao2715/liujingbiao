<template>
  <el-dialog
    :model-value="props.visible"
    @update:model-value="(val) => emit('update:visible', val)"
    title="全链条溯源服务系统权限申请页"
    width="60%"
    :close-on-click-modal="false"
    append-to-body
    @close="handleClose"
  >
    <div class="permission-popup">
      <div class="note-text">
        注:信息补充完整后提交申请,审核通过后可使用该系统具体功能
      </div>
      
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="140px"
        class="permission-form"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="企业名称" prop="companyName">
              <el-input v-model="formData.companyName" placeholder="请输入企业名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="统一社会信用代码号" prop="creditCode">
              <el-input v-model="formData.creditCode" placeholder="请输入统一社会信用代码号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="企业性质(类型)" prop="enterpriseType">
              <el-select v-model="formData.enterpriseType" placeholder="请选择企业性质" style="width: 100%">
                <el-option label="企业" value="enterprise" />
                <el-option label="供应商" value="supplier" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="法人/联系人" prop="legalPerson">
              <el-input v-model="formData.legalPerson" placeholder="请输入法人/联系人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="contactPhone">
              <el-input v-model="formData.contactPhone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="地址" prop="address">
              <el-input v-model="formData.address" placeholder="请输入地址" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 位置选择 -->
        <el-form-item label="位置" prop="location">
          <div class="location-section">
            <div class="map-search">
              <el-autocomplete
                v-model="searchKeyword"
                :fetch-suggestions="handleSearch"
                :trigger-on-focus="true"
                clearable
                placeholder="输入城市+关键字搜索"
                @select="handleSelect"
                class="search-input"
                style="width: 100%"
              />
            </div>
            <div ref="mapContainer" class="map-container" id="permission-map"></div>
            <el-row :gutter="20" class="location-coords">
              <el-col :span="12">
                <el-form-item label="经度">
                  <el-input v-model="formData.longitude" readonly />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="纬度">
                  <el-input v-model="formData.latitude" readonly />
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </el-form-item>

        <!-- 简介 -->
        <el-form-item label="简介" prop="introduction">
          <el-input
            v-model="formData.introduction"
            type="textarea"
            :rows="4"
            placeholder="请输入简介"
          />
        </el-form-item>

        <!-- 营业执照附件 -->
        <el-form-item label="营业执照附件" prop="businessLicense">
          <el-upload
            class="license-uploader"
            action="#"
            :auto-upload="false"
            :on-change="handleLicenseChange"
            :on-remove="handleLicenseRemove"
            :file-list="licenseFileList"
            :limit="1"
            accept=".jpg,.jpeg,.png,.pdf"
          >
            <el-button type="primary">选择文件</el-button>
            <template #tip>
              <div class="upload-tip">支持 JPG、PNG、PDF 格式，文件大小不超过10MB</div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消申请</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">提交申请</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted, onUnmounted, nextTick, shallowRef } from 'vue';
import type { FormInstance, FormRules, UploadFile } from 'element-plus';
import { ElMessage } from 'element-plus';
import AMapLoader from '@amap/amap-jsapi-loader';

// 高德地图安全密钥配置
(window as any)._AMapSecurityConfig = {
  securityJsCode: 'b777544314df09b85d97efb099f4eaea'
};

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  (event: 'update:visible', value: boolean): void;
  (event: 'close'): void;
  (event: 'submit', data: any): void;
}>();

const formRef = ref<FormInstance>();
const submitting = ref(false);
const searchKeyword = ref('');
const mapContainer = ref<HTMLElement | null>(null);

// 高德地图配置
const GAODE_KEY = 'e0332f739162f365fa5899fba6c055dd';

// 默认经纬度（武汉市汉南区）
const DEFAULT_LAT = 30.3089;
const DEFAULT_LNG = 114.0819;

// 地图相关变量
const map = shallowRef<any>(null);
let AMapObj: any = null;
let marker: any = null;
let placeSearch: any = null;
let geocoder: any = null;

const formData = reactive({
  companyName: '',
  creditCode: '',
  enterpriseType: '',
  legalPerson: '',
  contactPhone: '',
  address: '',
  longitude: '',
  latitude: '',
  introduction: '',
  businessLicense: null as File | null
});

const licenseFileList = ref<UploadFile[]>([]);

const rules: FormRules = {
  companyName: [{ required: true, message: '请输入企业名称', trigger: 'blur' }],
  creditCode: [{ required: true, message: '请输入统一社会信用代码号', trigger: 'blur' }],
  enterpriseType: [{ required: true, message: '请选择企业性质', trigger: 'change' }],
  legalPerson: [{ required: true, message: '请输入法人/联系人', trigger: 'blur' }],
  contactPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  address: [{ required: true, message: '请输入地址', trigger: 'blur' }],
  introduction: [{ required: true, message: '请输入简介', trigger: 'blur' }],
  businessLicense: [{ required: true, message: '请上传营业执照附件', trigger: 'change' }]
};

const handleClose = () => {
  emit('update:visible', false);
  emit('close');
  // 重置表单
  formRef.value?.resetFields();
  licenseFileList.value = [];
  formData.businessLicense = null;
  // 清空搜索关键词
  searchKeyword.value = '';
};

const handleLicenseChange = (file: UploadFile) => {
  const rawFile = file.raw;
  if (rawFile) {
    // 检查文件大小（10MB）
    const maxSize = 10 * 1024 * 1024;
    if (rawFile.size > maxSize) {
      ElMessage.error('文件大小不能超过10MB');
      return;
    }
    formData.businessLicense = rawFile;
    licenseFileList.value = [file];
  }
};

const handleLicenseRemove = () => {
  formData.businessLicense = null;
  licenseFileList.value = [];
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    submitting.value = true;

    // 这里调用提交接口
    // const formDataToSubmit = new FormData();
    // Object.keys(formData).forEach(key => {
    //   if (key === 'businessLicense' && formData.businessLicense) {
    //     formDataToSubmit.append(key, formData.businessLicense);
    //   } else {
    //     formDataToSubmit.append(key, formData[key]);
    //   }
    // });

    // 模拟提交
    setTimeout(() => {
      ElMessage.success('提交成功');
      submitting.value = false;
      emit('submit', { ...formData });
      handleClose();
    }, 1000);
  } catch (error) {
    console.error('表单验证失败:', error);
  }
};

// 初始化地图
const initMap = async () => {
  if (!mapContainer.value) return;

  try {
    AMapObj = await AMapLoader.load({
      key: GAODE_KEY,
      version: '2.0'
    });

    // 获取初始经纬度
    const lat = parseFloat(formData.latitude) || DEFAULT_LAT;
    const lng = parseFloat(formData.longitude) || DEFAULT_LNG;

    // 创建地图实例
    map.value = new AMapObj.Map('permission-map', {
      zoom: 14,
      center: [lng, lat]
    });

    // 如果已有经纬度，绘制标记
    if (formData.latitude && formData.longitude) {
      drawMarker();
    }

    // 添加点击事件
    map.value.on('click', onMapClick);

    // 加载插件
    AMapObj.plugin(
      ['AMap.ToolBar', 'AMap.Scale', 'AMap.Geolocation', 'AMap.PlaceSearch', 'AMap.Geocoder'],
      () => {
        // 缩放条
        const toolbar = new AMapObj.ToolBar();
        // 比例尺
        const scale = new AMapObj.Scale();
        // 定位
        const geolocation = new AMapObj.Geolocation({
          enableHighAccuracy: true,
          timeout: 10000,
          position: 'RT',
          buttonOffset: new AMapObj.Pixel(10, 20),
          zoomToAccuracy: true
        });

        // 地理编码
        geocoder = new AMapObj.Geocoder({
          city: '全国'
        });

        // 地点搜索
        placeSearch = new AMapObj.PlaceSearch({
          map: map.value,
          city: '',
          pageSize: 30,
          pageIndex: 1,
          citylimit: false,
          autoFitView: true
        });

        map.value.addControl(geolocation);
        map.value.addControl(toolbar);
        map.value.addControl(scale);
      }
    );
  } catch (error) {
    console.error('地图初始化失败:', error);
    ElMessage.error('地图初始化失败');
  }
};

// 搜索地图（用于 el-autocomplete）
const handleSearch = (queryString: string, cb: (results: any[]) => void) => {
  if (!placeSearch) {
    cb([]);
    return;
  }

  placeSearch.search(queryString, (status: string, result: any) => {
    if (result && typeof result === 'object' && result.poiList) {
      const list = result.poiList.pois || [];
      list.forEach((item: any) => {
        item.value = item.name;
        item.label = item.name;
      });
      cb(list);
    } else {
      cb([]);
    }
  });
};

// 点击地图
const onMapClick = (e: any) => {
  if (!geocoder || !AMapObj) return;

  const { lng, lat } = e.lnglat;

  // 逆地理编码
  geocoder.getAddress([lng, lat], (status: string, result: any) => {
    if (status === 'complete' && result.info === 'OK') {
      const { addressComponent, formattedAddress } = result.regeocode;
      let { city, province, district } = addressComponent;
      if (!city) {
        // 直辖市
        city = province;
      }

      formData.longitude = lng.toFixed(7);
      formData.latitude = lat.toFixed(7);
      formData.address = formattedAddress || '';

      // 更新标记
      drawMarker();
    }
  });
};

// 点击搜索项
const handleSelect = (item: any) => {
  if (!item || !item.location || !AMapObj) {
    return;
  }

  const { pname, cityname, adname, address, name } = item;
  const { lng, lat } = item.location;

  formData.longitude = lng.toFixed(7);
  formData.latitude = lat.toFixed(7);
  formData.address = address || name || '';

  // 更新地图视图和标记
  if (map.value) {
    map.value.setZoomAndCenter(16, [lng, lat]);
    drawMarker();
  }
};

// 绘制地点marker
const drawMarker = () => {
  if (!AMapObj || !map.value) return;

  const longitude = parseFloat(formData.longitude);
  const latitude = parseFloat(formData.latitude);

  if (isNaN(longitude) || isNaN(latitude)) return;

  // 移除旧标记
  if (marker) {
    marker.setMap(null);
  }

  // 创建新标记
  marker = new AMapObj.Marker({
    position: new AMapObj.LngLat(longitude, latitude),
    anchor: 'bottom-center'
  });

  map.value.add(marker);
  map.value.setZoomAndCenter(16, [longitude, latitude]);
};

// 监听 visible 变化
watch(
  () => props.visible,
  async (val) => {
    if (val) {
      // 弹窗打开时初始化地图
      await nextTick();
      if (mapContainer.value && !map.value) {
        initMap();
      } else if (map.value && formData.latitude && formData.longitude) {
        // 如果地图已存在，更新视图
        const lat = parseFloat(formData.latitude);
        const lng = parseFloat(formData.longitude);
        if (!isNaN(lat) && !isNaN(lng)) {
          map.value.setZoomAndCenter(16, [lng, lat]);
          drawMarker();
        }
      }
    }
  }
);

// 监听经纬度变化，更新地图
watch(
  [() => formData.latitude, () => formData.longitude],
  ([lat, lng]) => {
    if (map.value && lat && lng) {
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);
      if (!isNaN(latNum) && !isNaN(lngNum)) {
        map.value.setZoomAndCenter(16, [lngNum, latNum]);
        drawMarker();
      }
    }
  }
);

onUnmounted(() => {
  // 清理地图实例
  try {
    if (map.value) {
      map.value.destroy();
      map.value = null;
    }
    if (marker) {
      marker.setMap(null);
      marker = null;
    }
    placeSearch = null;
    geocoder = null;
    AMapObj = null;
  } catch (error) {
    console.error('清理地图实例失败:', error);
  }
});
</script>

<style scoped lang="scss">
.permission-popup {
  .note-text {
    color: #f56c6c;
    font-size: 14px;
    margin-bottom: 20px;
    text-align: right;
  }

  .permission-form {
    .location-section {
      width: 100%;

      .map-search {
        margin-bottom: 12px;
        position: relative;

        .search-input {
          width: 100%;
        }
      }

      .map-container {
        width: 100%;
        height: 400px;
        border: 1px solid #dcdfe6;
        border-radius: 4px;
        margin-bottom: 12px;
        position: relative;
        background-color: #f5f7fa;
        z-index: 0;
      }

      .location-coords {
        margin-top: 12px;
      }
    }

    .license-uploader {
      :deep(.el-upload) {
        .el-button {
          margin-right: 12px;
        }
      }

      .upload-tip {
        color: #909399;
        font-size: 12px;
        margin-top: 8px;
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>


