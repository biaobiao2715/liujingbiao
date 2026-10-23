import { computed, ref, type Ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { goodsAdd, goodsUpdate } from '@/api/supplier/productManagement/product';
import { useGoodsInit } from './useGoodsInit';
import { useGoodsImages } from './useGoodsImages';
import { useGoodsSpecTable } from './useGoodsSpecTable';
import { useGoodsSpecValidate } from './useGoodsSpecValidate';
import { useGoodsImageUpload } from './useGoodsImageUpload';
import { useInputFilter } from './useInputFilter';
import type { GoodsRequest } from './type';

// 新增 onCancel、onSuccess 回调参数，供父组件传递
export function useGoodsEditPage(
  formRef: Ref<any | null>,
  options?: {
    onCancel?: () => void;
    onSuccess?: () => void;
  }
) {
  const { state, actions } = useGoodsInit();

  // 图片列表
  const imagesModule = useGoodsImages();

  // 规格表格
  const specTableModule = useGoodsSpecTable();
  const specValidateModule = useGoodsSpecValidate(specTableModule.state.tableData);

  // 输入过滤
  const inputFilter = useInputFilter();

  // 图片上传（裁剪等）
  const uploadModule = useGoodsImageUpload({
    onSuccess: (file) => {
      imagesModule.actions.addImage(file);
    }
  });

  const pageType = ref<'add' | 'edit' | 'copy'>('add');
  const goodsId = ref<string | null>(null);

  /* =========================
   * page 状态
   ========================= */
  const isEditMode = computed(() => pageType.value === 'edit');
  const isCopyMode = computed(() => pageType.value === 'copy');
  const isAddMode = computed(() => pageType.value === 'add');

  /* =========================
   * 初始化（根据类型决定）
   ========================= */
  const init = async (type: 'add' | 'edit' | 'copy', id: string | number | null) => {
    pageType.value = type;
    console.log('type', id);
    goodsId.value = id ? String(id) : null;

    await actions.initBaseOptions(); // 初始化下拉选项数据

    if (type === 'edit' || type === 'copy') {
      if (!id) return; // 确保有ID
      const detail = await actions.fetchDetail(String(id));
      applyDetail(detail, type);
    } else {
      applyDetailForAdd();
    }
  };

  // 填充表单数据（编辑/复制）
  const applyDetail = (detail: any, type: 'edit' | 'copy') => {
    actions.applyDetail(detail.form);

    // 图片与规格回填
    imagesModule.actions.setImages(detail.images || []);
    specTableModule.actions.init(detail.specs || []);

    if (type === 'copy') {
      // 如果是复制模式，清空部分字段
      actions.applyDetail({
        ...detail.form,
        goodsName: '',
        goodsCode: ''
        // 根据需求可以清空其他字段
      });
    }
  };

  // 初始化新建（add）时的空表单
  const applyDetailForAdd = () => {
    actions.applyDetail({
      goodsName: '',
      goodsCode: '',
      goodsCategoryId: '',
      goodsBrandId: '',
      goodsInfo: '',
      goodsDetail: '',
      goodsAlert: '',
      status: '1',
      launchTime: '',
      takeDownTime: '',
      goodsEnsureIds: [],
      goodsAbilityIds: [],
      goodsSpecification: '',
      imageList: []
    });

    imagesModule.actions.clearImages();
    specTableModule.actions.init();
  };

  /* =========================
   * 提交
   ========================= */
  const submit = async () => {
    const valid = await formRef.value?.validate().catch(() => false);
    if (!valid) return;

    // 规格校验
    const specResult = specValidateModule.validateAll();

    // 先清空旧的错误
    specTableModule.state.tableData.value.forEach((row: any) => {
      if (row.errors) row.errors = {};
    });

    if (!specResult.ok) {
      // 如果有行级错误，把错误写回每一行，供表格展示
      if (specResult.rowErrors && specResult.rowErrors.length) {
        specResult.rowErrors.forEach((err, index) => {
          const row = specTableModule.state.tableData.value[index] as any;
          if (row) {
            row.errors = err;
          }
        });
      }

      ElMessage.error(specResult.message || '请检查规格信息');
      return;
    }

    // 构建图片列表
    const hnGoodsFilesList = imagesModule.state.images.value.map((img) => ({
      ossId: img.ossId ? Number(img.ossId) : undefined,
      url: img.url,
      path: img.path,
      fileType: img.fileType,
      originalName: img.name
    }));

    // 构建规格列表
    const hnGoodsSpecificationDataList = specTableModule.state.tableData.value.map((row: any) => ({
      goodsSpecification: row.goodsSpecification,
      goodsSpecificationValue: row.goodsSpecificationValue,
      goodsPrice: row.goodsPrice,
      goodsStock: row.goodsStock,
      goodsWeight: row.goodsWeight,
      status: row.status,
      id: row.id,
      goodsId: row.goodsId
    }));

    const requestData: GoodsRequest = actions.mapToRequest({
      hnGoodsFilesList,
      hnGoodsSpecificationDataList
    });

    if (isEditMode.value) {
      await goodsUpdate(requestData);
      ElMessage.success('修改成功');
    } else if (isAddMode.value) {
      await goodsAdd(requestData);
      ElMessage.success('新增成功');
    } else if (isCopyMode.value) {
      await goodsAdd(requestData);
      ElMessage.success('复制成功');
    }
    options?.onSuccess?.();
  };

  /* =========================
   * 取消
   ========================= */
  const cancel = () => {
    ElMessageBox.confirm('确定关闭表单？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(() => {
        options?.onCancel?.();
      })
      .catch(() => {});
  };

  // 图片删除/预览适配 Element Plus Upload
  const handleRemoveImage = (file: any, fileList: any[]) => {
    const index = fileList.findIndex((f) => f.path === file.path);
    if (index !== -1) {
      imagesModule.actions.removeImage(index);
    }
  };

  const handlePreviewImage = (file: any) => {
    if (file.url) {
      uploadModule.preview(file.url);
    }
  };

  const handleExceed = () => {
    uploadModule.handleExceed();
  };

  // 校验：商品主图至少一张，且不超过限制
  const validateTitleFileList = (_: any, __: any, callback: any) => {
    const files = imagesModule.state.images.value;

    // 这里只校验“是否有图”，数量上限由 el-upload 的 :limit 控制即可
    if (!files || files.length === 0) {
      callback(new Error('请上传至少一张商品主图'));
      return;
    }

    callback();
  };

  // 校验：上架时间，仅在状态为上架时必填
  const validateLaunchTime = (_: any, value: any, callback: any) => {
    const status = state.formData.value.status;
    if (status === '1' && !value) {
      callback(new Error('请选择上架时间'));
      return;
    }
    callback();
  };

  // 校验：下架时间，仅在状态为下架时必填
  const validateTakeDownTime = (_: any, value: any, callback: any) => {
    const status = state.formData.value.status;
    if (status === '0' && !value) {
      callback(new Error('请选择下架时间'));
      return;
    }
    callback();
  };

  // 表单校验规则（可根据实际需要扩展）
  const formRules = {
    goodsName: [
      {
        validator: (rule: any, value: any, callback: any) => {
          if (!value || value.trim() === '') return callback(new Error('请输入商品名称，30个汉字。'));
          const zh = value.match(/[\u4e00-\u9fa5]/g) || [];
          if (zh.length > 30) return callback(new Error('请输入商品名称，30个汉字。'));
          callback();
        },
        trigger: 'blur'
      }
    ],
    goodsCategoryId: [{ required: true, message: '请选择商品类目', trigger: 'change' }],
    goodsBrandId: [{ required: true, message: '请选择产品品牌', trigger: 'change' }],
    goodsEnsureIds: [{ required: true, message: '请选择产品保障', trigger: 'change' }],
    goodsAbilityIds: [{ required: true, message: '请选择产品功能', trigger: 'change' }],
    goodsInfo: [{ required: true, message: '请输入商品介绍', trigger: 'change' }],
    goodsDetail: [{ required: true, message: '请输入商品详情', trigger: 'change' }],
    goodsAlert: [
      { required: true, message: '请输入库存预警下限', trigger: 'change' },
      {
        validator: (_: any, value: any, callback: any) => {
          // 正整数
          if (!/^[1-9]\d*$/.test(String(value ?? ''))) {
            callback(new Error('库存预警下限必须为正整数'));
          } else {
            callback();
          }
        },
        trigger: 'blur'
      }
    ],
    goodsSpecification: [{ required: true, message: '请选择商品规格', trigger: 'change' }],
    status: [{ required: true, message: '请选择上架状态', trigger: 'change' }],
    launchTime: [
      {
        validator: validateLaunchTime,
        trigger: 'change'
      }
    ],
    takeDownTime: [
      {
        validator: validateTakeDownTime,
        trigger: 'change'
      }
    ],
    titleFileList: [
      {
        // 不使用内置 required，完全交给自定义校验，避免双重提示
        validator: validateTitleFileList,
        // 不用 change，避免选择文件但裁剪未完成时提前报错；
        // 提交时 formRef.validate() 会统一触发一次校验。
        trigger: 'blur'
      }
    ],
    goodsSpecificationValue: [{ required: true, message: '请输入单位规格', trigger: 'blur' }]
  };

  return {
    formData: state.formData,
    formRules,

    // 下拉选项
    creditList: state.creditList,
    brandOptions: state.brandOptions,
    guaranteeOptions: state.guaranteeOptions,
    functionOptions: state.functionOptions,

    // 图片
    images: imagesModule.state.images,
    imagesActions: {
      preview: handlePreviewImage,
      beforeUpload: uploadModule.beforeUpload,
      remove: handleRemoveImage,
      exceed: handleExceed,
      picOpen: uploadModule.picOpen,
      cropOpen: uploadModule.cropOpen,
      dialogImageUrl: uploadModule.dialogImageUrl,
      onCropSuccess: uploadModule.onCropSuccess,
      urlData: uploadModule.rawFile
    },

    // 规格
    specTable: specTableModule.state.tableData,
    specActions: {
      addRow: specTableModule.actions.addRow,
      removeRow: specTableModule.actions.removeRow,
      updateSpecification: specTableModule.actions.updateSpecification,
      toggleStatus: (row: any) => {
        row.status = row.status === 1 ? 0 : 1;
      }
    },

    // 输入过滤
    inputFilter,

    init,
    submit,
    cancel,
    isEditMode,
    isAddMode,
    isCopyMode
  };
}
