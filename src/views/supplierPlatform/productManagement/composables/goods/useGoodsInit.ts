import { ref } from 'vue';
import { goodsId } from '@/api/supplier/productManagement/product';
import { getProductCategoryList } from '@/api/platform/mallConfiguration/productCategory';
import { goodsAttributesAllList } from '@/api/platform/mallConfiguration/productAttributeLabel';
import { GoodsForm, GoodsSpec, GoodsImage, GoodsAttributesResponse } from '@/views/supplierPlatform/productManagement/composables/goods/type';
import {
  mapGoodsDetail,
  mapGoodsAdd,
  mapGoodsCopy,
  mapGoodsSpecFromApi,
  mapGoodsMainImg
} from '@/views/supplierPlatform/productManagement/composables/mappers/goodsMapper';
import { SpecStatus, OperateMode } from '@/enums/goodsEnum';
export function useGoodsInit() {
  const { proxy } = getCurrentInstance() as ComponentInternalInstance;

  const formData = ref<GoodsForm>({} as GoodsForm);
  const hnGoodsSpecificationDataList = ref<GoodsSpec[]>([
    { goodsSpecification: '', goodsSpecificationValue: '', goodsPrice: '', goodsStock: '', goodsWeight: '', status: SpecStatus.Enabled }
  ]);
  const hnGoodsFilesList = ref<GoodsImage[]>([]);
  const creditList = ref<any[]>([]);
  const brandOptions = ref<any[]>([]);
  const guaranteeOptions = ref<any[]>([]);
  const functionOptions = ref<any[]>([]);

  // 初始化基础数据
  const initBaseOptions = async () => {
    const [categoryRes, attrRes] = await Promise.all([getProductCategoryList(), goodsAttributesAllList()]);

    if (categoryRes?.code === 200) {
      creditList.value = proxy?.handleTree<any>(categoryRes.data, 'id') || [];
    }

    const { brandList = [], guaranteeList = [], functionList = [] } = (attrRes ?? {}) as Partial<GoodsAttributesResponse>;

    brandOptions.value = brandList;
    guaranteeOptions.value = guaranteeList;
    functionOptions.value = functionList;
  };

  // 获取商品详情
  const fetchDetail = async (id: string | number) => {
    const res = await goodsId(String(id));
    if (res?.code !== 200) return null;
    return res.data;
  };

  // 不同操作模式初始化
  const initAddMode = () => {
    formData.value = mapGoodsAdd();
    return;
  };

  const initEditMode = (data: any) => {
    formData.value = mapGoodsDetail(data);
    hnGoodsSpecificationDataList.value = mapGoodsSpecFromApi(data.hnGoodsSpecificationDataList);
    hnGoodsFilesList.value = mapGoodsMainImg(data.remoteFileList);
  };

  const initCopyMode = (data: any) => {
    formData.value = mapGoodsCopy(data);
    hnGoodsSpecificationDataList.value = mapGoodsSpecFromApi(data.hnGoodsSpecificationDataList);
    hnGoodsFilesList.value = mapGoodsMainImg(data.remoteFileList);
  };

  // 初始化入口
  const init = async (type: OperateMode, id: string | number) => {
    await initBaseOptions();

    const handlers: Record<OperateMode, () => void> = {
      [OperateMode.Add]: initAddMode,
      [OperateMode.Edit]: async () => {
        const data = await fetchDetail(id);
        if (data) initEditMode(data);
      },
      [OperateMode.Copy]: async () => {
        const data = await fetchDetail(id);
        if (data) initCopyMode(data);
      }
    };
    handlers[type]();
  };

  // expose
  return {
    formData,
    hnGoodsSpecificationDataList,
    hnGoodsFilesList,
    creditList,
    brandOptions,
    guaranteeOptions,
    functionOptions,

    init
  };
}
