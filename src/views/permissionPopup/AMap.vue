<template>
  <div class="map-wrapper">
    <div ref="mapContainer" class="map-container" :id="mapId"></div>
    
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick, shallowRef, h, render } from 'vue';
import AMapLoader from '@amap/amap-jsapi-loader';
import { Promotion, LocationInformation } from '@element-plus/icons-vue';
import { ElIcon } from 'element-plus';

// 高德地图安全密钥配置
(window as any)._AMapSecurityConfig = {
  securityJsCode: 'b777544314df09b85d97efb099f4eaea'
};

const props = withDefaults(
  defineProps<{
    modelValue?: {
      longitude?: string | number;
      latitude?: string | number;
      address?: string;
      zone?: string[];
      name?: string;
    };
    showCoords?: boolean;
    mapId?: string;
    addressSyncSignal?: number; // 外部触发地址同步信号（如输入框 blur 后递增）
  }>(),
  {
    modelValue: () => ({}),
    showCoords: true,
    mapId: 'amap-container',
    addressSyncSignal: 0
  }
);

const emit = defineEmits<{
  (event: 'update:modelValue', value: { longitude: string; latitude: string; address?: string; zone?: string[]; name?: string }): void;
}>();

// 高德地图配置
const GAODE_KEY = 'e0332f739162f365fa5899fba6c055dd';

// 默认经纬度（武汉市汉南区）
const DEFAULT_LAT = 30.3089;
const DEFAULT_LNG = 114.0819;

// 地图相关变量
const map = shallowRef<any>(null);
const mapContainer = ref<HTMLElement | null>(null);
let AMapObj: any = null;
let marker: any = null;
let placeSearch: any = null;
let geocoder: any = null;
let autoComplete: any = null;
let searchInput: HTMLInputElement | null = null;
const mapReady = ref(false);

// 计算属性：位置数据
const location = computed({
  get() {
    return {
      longitude: props.modelValue?.longitude?.toString() || '',
      latitude: props.modelValue?.latitude?.toString() || '',
      address: props.modelValue?.address || '',
      zone: props.modelValue?.zone || [],
      name: props.modelValue?.name || ''
    };
  },
  set(val) {
    emit('update:modelValue', val);
  }
});

// 初始化地图
const initMap = async () => {
  if (!mapContainer.value) return;

  try {
    AMapObj = await AMapLoader.load({
      key: GAODE_KEY,
      version: '2.0'
    });

    // 获取初始经纬度
    const lat = parseFloat(location.value.latitude) || DEFAULT_LAT;
    const lng = parseFloat(location.value.longitude) || DEFAULT_LNG;

    // 创建地图实例
    map.value = new AMapObj.Map(props.mapId, {
      zoom: 14,
      center: [lng, lat]
    });

    // 等待地图加载完成
    map.value.on('complete', () => {
      mapReady.value = true;
      // 如果已有经纬度，绘制标记
      if (location.value.latitude && location.value.longitude) {
        drawMarker();
      } else if (location.value.address) {
        // 如果仅有地址，进行一次地理编码
        geocodeAddress(location.value.address);
      }
    });

    // 添加点击事件
    map.value.on('click', onMapClick);

    // 加载插件
    AMapObj.plugin(
      ['AMap.ToolBar', 'AMap.Scale', 'AMap.Geolocation', 'AMap.PlaceSearch', 'AMap.Geocoder', 'AMap.AutoComplete'],
      () => {
        // 确保地图容器存在
        if (!mapContainer.value) {
          console.error('地图容器不存在');
          return;
        }
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

        // 创建搜索容器（高德地图原生样式）
        const searchContainer = document.createElement('div');
        searchContainer.style.cssText = `
          position: absolute;
          top: 10px;
          left: 10px;
          z-index: 1000;
          width: 300px;
          height: 40px;
          background: #fff;
          border-radius: 4px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.15);
          display: flex;
          align-items: center;
          padding: 0 8px;
        `;

        // 创建左侧图标容器（使用 Element Plus Promotion 图标）
        const leftIconContainer = document.createElement('div');
        leftIconContainer.style.cssText = `
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%);
          border-radius: 4px;
          margin-right: 8px;
          flex-shrink: 0;
        `;
        // 使用 <el-icon><Promotion /></el-icon>
        const iconVNode = h(
          ElIcon,
          { size: 16, color: '#ffffff' },
          () => h(Promotion)
        );
        const iconMount = document.createElement('div');
        render(iconVNode, iconMount);
        if (iconMount.firstElementChild) {
          leftIconContainer.appendChild(iconMount.firstElementChild);
        }

        // 创建搜索输入框
        searchInput = document.createElement('input');
        searchInput.id = 'amap-search-input';
        searchInput.type = 'text';
        searchInput.placeholder = '搜索位置、公交站、地铁站';
        searchInput.style.cssText = `
          flex: 1;
          height: 100%;
          border: none;
          outline: none;
          font-size: 14px;
          color: #333;
          background: transparent;
          padding: 0 8px;
        `;

        // 创建右侧图标容器
        const rightIconContainer = document.createElement('div');
        rightIconContainer.style.cssText = `
          display: flex;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
        `;

        // 创建放大镜图标
        const searchIcon = document.createElement('div');
        searchIcon.style.cssText = `
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        `;
        searchIcon.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="7" cy="7" r="4.5" stroke="#666" stroke-width="1.5" fill="none"/>
            <path d="M10.5 10.5L13 13" stroke="#666" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        `;

        // 创建蓝色向上箭头图标（定位按钮）
        const locationIcon = document.createElement('div');
        locationIcon.style.cssText = `
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f5f5f5;
          border-radius: 4px;
          cursor: pointer;
          margin-left: 4px;
        `;
        // 使用 <el-icon><LocationInformation /></el-icon>
        const locIconVNode = h(
          ElIcon,
          { size: 16, color: '#4A90E2' },
          () => h(LocationInformation)
        );
        const locIconMount = document.createElement('div');
        render(locIconVNode, locIconMount);
        if (locIconMount.firstElementChild) {
          locationIcon.appendChild(locIconMount.firstElementChild);
        }

        // 搜索功能
        const handleSearch = () => {
          const keyword = searchInput?.value.trim();
          if (!keyword || !placeSearch) return;

          placeSearch.search(keyword, (status: string, result: any) => {
            if (status === 'complete' && result && result.poiList && result.poiList.pois && result.poiList.pois.length > 0) {
              const poi = result.poiList.pois[0];
              if (poi && poi.location) {
                const { lng, lat } = poi.location;
                const { pname, cityname, adname, address, name } = poi;
                
                location.value = {
                  longitude: lng.toFixed(7),
                  latitude: lat.toFixed(7),
                  address: address || name || '',
                  zone: [pname, cityname, adname],
                  name: name || ''
                };

                // 更新地图视图和标记
                if (map.value) {
                  map.value.setZoomAndCenter(16, [lng, lat]);
                  drawMarker();
                }
              }
            }
          });
        };

        // 放大镜图标点击搜索
        searchIcon.onclick = handleSearch;
        
        // 定位图标点击（定位到当前位置）
        locationIcon.onclick = () => {
          if (geolocation) {
            geolocation.getCurrentPosition((status: string, result: any) => {
              if (status === 'complete' && result.position) {
                const { lng, lat } = result.position;
                location.value = {
                  longitude: lng.toFixed(7),
                  latitude: lat.toFixed(7),
                  address: result.formattedAddress || '',
                  zone: [],
                  name: ''
                };
                if (map.value) {
                  map.value.setZoomAndCenter(16, [lng, lat]);
                  drawMarker();
                }
              }
            });
          }
        };
        
        // 输入框回车搜索
        searchInput.onkeypress = (e: KeyboardEvent) => {
          if (e.key === 'Enter') {
            handleSearch();
          }
        };

        // 创建自动完成实例（高德地图自带的搜索样式）
        // 确保输入框已添加到 DOM 后再创建 AutoComplete
        nextTick(() => {
          if (searchInput && document.getElementById('amap-search-input')) {
            try {
              autoComplete = new AMapObj.AutoComplete({
                city: '全国',
                input: 'amap-search-input'
              });

              // 监听自动完成选择事件
              if (autoComplete && AMapObj.event) {
                AMapObj.event.addListener(autoComplete, 'select', (e: any) => {
                  const poi = e.poi;
                  if (poi && poi.location) {
                    const { lng, lat } = poi.location;
                    const { pname, cityname, adname, address, name } = poi;
                    
                    location.value = {
                      longitude: lng.toFixed(7),
                      latitude: lat.toFixed(7),
                      address: address || name || '',
                      zone: [pname, cityname, adname],
                      name: name || ''
                    };

                    // 更新地图视图和标记
                    if (map.value) {
                      map.value.setZoomAndCenter(16, [lng, lat]);
                      drawMarker();
                    }
                  }
                });
              }
            } catch (error) {
              console.warn('AutoComplete 初始化失败，将使用手动搜索:', error);
            }
          }
        });

        // 将图标和输入框添加到容器
        rightIconContainer.appendChild(searchIcon);
        rightIconContainer.appendChild(locationIcon);
        searchContainer.appendChild(leftIconContainer);
        searchContainer.appendChild(searchInput);
        searchContainer.appendChild(rightIconContainer);
        
        // 确保地图容器存在后再添加搜索框
        // 使用 nextTick 确保 DOM 已渲染
        nextTick(() => {
          if (mapContainer.value) {
            // 检查是否已经添加过搜索框，避免重复添加
            const existingSearch = mapContainer.value.querySelector('#amap-search-container');
            if (!existingSearch) {
              searchContainer.id = 'amap-search-container';
              mapContainer.value.appendChild(searchContainer);
            }
          }
        });

        map.value.addControl(geolocation);
        map.value.addControl(toolbar);
        map.value.addControl(scale);
      }
    );
  } catch (error) {
    console.error('地图初始化失败:', error);
  }
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

      location.value = {
        longitude: lng.toFixed(7),
        latitude: lat.toFixed(7),
        address: formattedAddress || '',
        zone: [province, city, district],
        name: ''
      };

      // 更新标记
      drawMarker();
    }
  });
};

// 绘制地点marker
const drawMarker = () => {
  if (!AMapObj || !map.value) return;

  const longitude = parseFloat(location.value.longitude);
  const latitude = parseFloat(location.value.latitude);

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

// 监听 modelValue 变化，更新地图
watch(
  () => props.modelValue,
  (newVal) => {
    if (map.value && newVal?.latitude && newVal?.longitude) {
      const lat = parseFloat(String(newVal.latitude));
      const lng = parseFloat(String(newVal.longitude));
      if (!isNaN(lat) && !isNaN(lng)) {
        map.value.setZoomAndCenter(16, [lng, lat]);
        drawMarker();
      }
    }
  },
  { deep: true }
);

// 监听外部同步信号（例如输入框 blur 后递增）再去地理编码
watch(
  () => props.addressSyncSignal,
  () => {
    const addr = props.modelValue?.address;
    if (!addr || !addr.toString().trim()) return;
    if (!mapReady.value || !geocoder) return;
    syncAddressToMap(addr.toString().trim());
  }
);

// 地址转经纬度
const geocodeAddress = (addr: string) => {
  if (!geocoder || !map.value) return;
  geocoder.getLocation(addr, (status: string, result: any) => {
    if (status === 'complete' && result?.geocodes?.length) {
      const { location: loc } = result.geocodes[0];
      if (loc && loc.lng != null && loc.lat != null) {
        location.value = {
          longitude: Number(loc.lng).toFixed(7),
          latitude: Number(loc.lat).toFixed(7),
          // 不改用户输入的地址，保持原值
          address: props.modelValue?.address || location.value.address || addr,
          zone: location.value.zone || [],
          name: location.value.name || ''
        };
        drawMarker();
      }
    }
  });
};

// 与搜索一致的地址同步逻辑：优先 PlaceSearch，失败再地理编码
const syncAddressToMap = (addr: string) => {
  if (!addr) return;
  // 优先使用 placeSearch，结果与搜索一致
  if (placeSearch) {
    placeSearch.search(addr, (status: string, result: any) => {
      if (status === 'complete' && result?.poiList?.pois?.length) {
        const poi = result.poiList.pois[0];
        if (poi?.location) {
          const { lng, lat } = poi.location;
          const { pname, cityname, adname, address, name } = poi;
          location.value = {
            longitude: Number(lng).toFixed(7),
            latitude: Number(lat).toFixed(7),
            // 不改用户输入的地址，保持原值
            address: props.modelValue?.address || location.value.address || addr,
            zone: [pname, cityname, adname],
            name: name || ''
          };
          drawMarker();
          return;
        }
      }
      // 若未找到，回退到地理编码
      geocodeAddress(addr);
    });
  } else {
    geocodeAddress(addr);
  }
};

onMounted(async () => {
  await nextTick();
  if (mapContainer.value) {
    initMap();
  }
});

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
  .map-wrapper {
  width: 100%;

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
</style>

