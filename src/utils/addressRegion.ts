import areaData from 'china-area-data';

/**
 * 将营业执照上的住所/地址字符串解析为省/市/区编码数组
 * 仅做包含匹配；无法匹配的层级会跳过。
 * @param address 原始地址，例如：中国（湖北）自贸区宜昌片区生物产业园花艳一路9号
 */
export function parseAddressToRegionCodes(address: string): {
  regionPath: string[];
  provinceCode: string;
  cityCode: string;
  districtCode: string;
  province: string;
  city: string;
  region: string;
} {
  if (!address) {
    return {
      regionPath: [],
      provinceCode: '',
      cityCode: '',
      districtCode: '',
      province: '',
      city: '',
      region: ''
    };
  }
  const text = normalizeAddress(address);

  // 第一阶段：省匹配
  const provinceMap = areaData['86'];
  let provinceCode = '';
  for (const code of Object.keys(provinceMap)) {
    const label = provinceMap[code];
    const variants = buildLabelVariants(label);
    if (variants.some((v) => text.includes(v))) {
      provinceCode = code;
      break;
    }
  }

  let cityCode = '';
  let districtCode = '';

  if (!provinceCode) {
    // 回退：地址中可能缺省（如“南京市栖霞区...”），尝试城市全局匹配
    outerCitySearch: for (const pCode of Object.keys(provinceMap)) {
      const cMap = areaData[pCode];
      for (const cCode of Object.keys(cMap || {})) {
        const label = cMap[cCode];
        const variants = buildLabelVariants(label);
        if (variants.some((v) => text.includes(v))) {
          provinceCode = pCode;
          cityCode = cCode;
          break outerCitySearch;
        }
      }
    }
  }

  // 市级匹配（若已通过城市回退得到 cityCode，则跳过常规匹配）
  if (provinceCode && !cityCode) {
    const cityMap = areaData[provinceCode];
    for (const code of Object.keys(cityMap || {})) {
      const label = cityMap![code];
      const variants = buildLabelVariants(label);
      if (variants.some((v) => text.includes(v))) {
        cityCode = code;
        break;
      }
    }
  }

  if (!provinceCode) {
    return {
      regionPath: [],
      provinceCode: '',
      cityCode: '',
      districtCode: '',
      province: '',
      city: '',
      region: ''
    };
  }

  if (!cityCode) {
    const provinceNameOnly = areaData['86'][provinceCode] || '';
    return {
      regionPath: [provinceCode],
      provinceCode,
      cityCode: '',
      districtCode: '',
      province: provinceNameOnly,
      city: '',
      region: ''
    };
  }

  // 区县匹配（若未找到则尝试回退通过区名反推城市）
  const districtMap = areaData[cityCode];
  if (districtMap) {
    for (const code of Object.keys(districtMap)) {
      const label = districtMap[code];
      const variants = buildLabelVariants(label);
      if (variants.some((v) => text.includes(v))) {
        districtCode = code;
        break;
      }
    }
  }

  if (!districtCode) {
    // 回退：若区未找到，尝试所有区反推（适用于直辖市写法缺市名的情况等）
    if (!districtMap) {
      outerDistrictSearch: for (const pCode of Object.keys(provinceMap)) {
        const cMap = areaData[pCode];
        for (const cCode of Object.keys(cMap || {})) {
          const dMap = areaData[cCode];
          for (const dCode of Object.keys(dMap || {})) {
            const label = dMap[dCode];
            const variants = buildLabelVariants(label);
            if (variants.some((v) => text.includes(v))) {
              provinceCode = pCode;
              cityCode = cCode;
              districtCode = dCode;
              break outerDistrictSearch;
            }
          }
        }
      }
    }
  }

  // 计算名称
  const provinceName = provinceCode ? areaData['86'][provinceCode] || '' : '';
  const cityName = cityCode ? areaData[provinceCode]?.[cityCode] || '' : '';
  const districtName = districtCode ? areaData[cityCode]?.[districtCode] || '' : '';

  const arr = {
    regionPath: [provinceCode, cityCode, districtCode].filter(Boolean),
    provinceCode: provinceCode || '',
    cityCode: cityCode || '',
    districtCode: districtCode || '',
    province: provinceName,
    city: cityName,
    region: districtName
  };

  return arr;
}

function normalizeAddress(address: string): string {
  return address
    .replace(/[（）()]/g, '')
    .replace(/中国|中华人民共和国/g, '')
    .replace(/自治区|特别行政区/g, '')
    .replace(/\s+/g, '')
    .trim();
}

// 构建去除常见后缀的匹配集合，提高包含匹配成功率
function buildLabelVariants(label: string): string[] {
  const variants = new Set<string>();
  variants.add(label);
  variants.add(label.replace(/省|市|区|县|盟|自治州|地区|特别行政区|旗|自治旗|林区/g, ''));
  // 例：杭州市 => 杭州； 内蒙古自治区 => 内蒙古
  return Array.from(variants).filter((v) => v.length > 0);
}

/**
 * 示例：
 * parseAddressToRegionCodes('中国（湖北）自贸区宜昌片区生物产业园花艳一路9号') => [湖北省编码, 宜昌市编码]
 * parseAddressToRegionCodes('南京市栖霞区栖霞街道润华路12-85号') => [江苏省编码, 南京市编码, 栖霞区编码]
 */
