<template>
  <!--
  标题: EditDetails.vue
  功能: 商品编辑详情页
  说明: 用于商品编辑自己的详细信息
  当前版本: 1.0
  开发信息: Created by 刘景彪 2025-10-15
-->
  <div class="supplier-edit-details" v-loading="loading">
    <el-form ref="refForm" :model="formData" :rules="rules" label-width="95px">
      <div>
        <div class="content-form-title">基本信息</div>

        <div>
          <!-- 标题 -->
          <el-row>
            <el-col :span="24">
              <el-form-item label="标题" prop="headline">
                <el-input :disabled="readonly" v-model="formData.headline" maxlength="50" placeholder="请输入标题" />
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 类型 产地 -->
          <el-row :gutter="10">
            <el-col :span="12">
              <el-form-item label="类型" prop="productSort">
                <el-cascader
                  v-if="creditList"
                  :disabled="readonly"
                  style="width: 100%"
                  v-model="formData.productSort"
                  filterable
                  :options="creditList"
                  :props="{
                    emitPath: false,
                    value: 'id'
                  }"
                ></el-cascader>
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="产地" prop="productOrigin">
                <el-input :disabled="readonly" v-model="formData.productOrigin" placeholder="请输入产地" />
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 价格 库存 -->
          <el-row :gutter="10">
            <el-col :span="12">
              <el-form-item label="价格" prop="price">
                <el-input :disabled="readonly" type="number" v-model="formData.price" placeholder="请输入价格" />
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="库存" prop="inventory">
                <el-input :disabled="readonly" type="number" v-model="formData.inventory" placeholder="请输入库存" />
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 发货期 -->
          <el-row :gutter="10">
            <el-col :span="12">
              <el-form-item label="发货期" prop="deliveryTime">
                <el-input :disabled="readonly" v-model="formData.deliveryTime" placeholder="请输入发货期" />
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 商品简介 -->
          <el-row :gutter="10">
            <el-col :span="24">
              <el-form-item label="商品简要描述" prop="productDesc">
                <el-input :disabled="readonly" v-model="formData.productDesc" type="textarea" :rows="5" placeholder="请输入商品简要描述"> </el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <div class="line" style="margin-top: 18px"></div>

        <div class="content-form-title">商品属性</div>

        <div>
          <!-- 名称 品牌 -->
          <el-row :gutter="10">
            <el-col :span="12">
              <el-form-item label="名称" prop="productName">
                <el-input :disabled="readonly" maxlength="100" v-model="formData.productName" placeholder="请输入名称" />
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="品牌" prop="brand">
                <el-input :disabled="readonly" v-model="formData.brand" placeholder="请输入品牌" />
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 货号 型号 -->
          <el-row :gutter="10">
            <el-col :span="12">
              <el-form-item label="货号" prop="artNo">
                <el-input :disabled="readonly" v-model="formData.artNo" placeholder="请输入货号" />
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="型号" prop="productType">
                <el-input :disabled="readonly" v-model="formData.productType" placeholder="请输入型号" />
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 适用行业 用途 -->
          <el-row :gutter="10">
            <el-col :span="12">
              <el-form-item label="适用行业" prop="applicableIndustry">
                <el-input :disabled="readonly" v-model="formData.applicableIndustry" placeholder="请选择适用行业" />
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="用途" prop="uses">
                <el-input :disabled="readonly" v-model="formData.uses" placeholder="请输入用途" />
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 用途 新增属性 -->
          <el-row>
            <el-col :span="24">
              <el-form-item label="其他属性" prop="attrList">
                <div class="form-flex">
                  <div class="flex-text">自定义添加属性，以更精准描述产品。</div>
                  <el-button v-throttle  class="flex-buttom" @click="addTableCell" :disabled="readonly" type="primary" plain>新增属性</el-button>
                </div>

                <el-table :data="tableList" border style="width: 100%">
                  <el-table-column prop="attrNameOne" label="属性">
                    <template v-slot="scope">
                      <el-input :disabled="readonly" v-model="scope.row.attrNameOne" placeholder="请输入"></el-input>
                    </template>
                  </el-table-column>
                  <el-table-column prop="attrDescribeOne" label="内容">
                    <template v-slot="scope">
                      <el-input :disabled="readonly" v-model="scope.row.attrDescribeOne" placeholder="请输入"></el-input>
                    </template>
                  </el-table-column>
                  <el-table-column prop="attrNameTwo" label="属性">
                    <template v-slot="scope">
                      <el-input :disabled="readonly" v-model="scope.row.attrNameTwo" placeholder="请输入"></el-input>
                    </template>
                  </el-table-column>
                  <el-table-column prop="attrDescribeTwo" label="内容">
                    <template v-slot="scope">
                      <el-input :disabled="readonly" v-model="scope.row.attrDescribeTwo" placeholder="请输入"></el-input>
                    </template>
                  </el-table-column>

                  <el-table-column label="操作" align="center">
                    <template v-slot="scope">
                      <!-- 删除 -->
                      <el-button v-throttle  type="text" :disabled="readonly" @click="removeTableCell(scope.$index, scope.row)">删除行</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <div class="line" style="margin-top: 18px"></div>

        <div class="content-form-title">上传商品图片</div>

        <div>
          <!-- 商品主图 -->
          <el-row>
            <el-col :span="24">
              <el-form-item label="商品主图" prop="titleFileList">
                <div>1、首张主图需保证图片品质,共需上传5张商品图片</div>
                <div>2、需上传800px以上的实拍大图,包含商品整体款式和商品细节</div>
                <el-upload
                  ref="refShop"
                  list-type="picture-card"
                  action="#"
                  multiple
                  :limit="limit1"
                  :disabled="readonly"
                  :file-list="shopList"
                  :on-preview="handlePictureCardPreview"
                  :before-upload="handleBeforeUpload"
                  :http-request="
                    (flie) => {
                      uploadFile(flie, 'shop');
                    }
                  "
                  :on-remove="
                    (flie, fileList) => {
                      handleDelete(flie, fileList, 'shop');
                    }
                  "
                  :on-exceed="handleExceed"
                >
                  <i class="el-icon-plus"></i>
                </el-upload>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 白底图 -->
          <el-row>
            <el-col :span="24">
              <el-form-item label="白底图" prop="titleWhiteFileList">
                <div>1.将用于首页、活动等特定场景的展示</div>
                <div>2.比例1:1,尺寸800px及以上,小于5MB,格式为PNG/JPEG/JPG/BMP</div>
                <div>3.背景纯白底，无阴影和明显抠图痕迹</div>
                <div>4.主体清晰，展示完整，不要拼图</div>
                <el-upload
                  ref="refShopWhite"
                  list-type="picture-card"
                  action="#"
                  :disabled="readonly"
                  :file-list="shopWhiteList"
                  :on-preview="handlePictureCardPreview"
                  :before-upload="handleBeforeUpload"
                  :http-request="
                    (flie) => {
                      uploadFile(flie, 'shopWhite');
                    }
                  "
                  :on-remove="
                    (flie, fileList) => {
                      handleDelete(flie, fileList, 'shopWhite');
                    }
                  "
                >
                  <i class="el-icon-plus"></i>
                </el-upload>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <div class="line" style="margin-top: 18px"></div>

        <div class="content-form-title">上传详情页</div>

        <div>
          <!-- 详情页图片 -->
          <el-row>
            <el-col :span="24">
              <el-form-item label="详情页图片" prop="infoFileList">
                <div>1、图片小于5MB，格式格式为PNG/JPEG/JPG</div>
                <div>2、内容包含商品详细信息介绍、厂家介绍等</div>
                <el-upload
                  ref="refShopInfo"
                  list-type="picture-card"
                  action="#"
                  multiple
                  :disabled="readonly"
                  :file-list="shopInfoList"
                  :on-preview="handlePictureCardPreview"
                  :before-upload="handleBeforeUpload"
                  :http-request="
                    (flie) => {
                      uploadFile(flie, 'shopInfo');
                    }
                  "
                  :on-remove="
                    (flie, fileList) => {
                      handleDelete(flie, fileList, 'shopInfo');
                    }
                  "
                >
                  <i class="el-icon-plus"></i>
                </el-upload>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <div class="line" style="margin-top: 18px; margin-bottom: 10px"></div>

        <!-- 按钮 -->
        <el-row type="flex" justify="center" :gutter="5">
          <el-col :span="3"><el-button v-throttle  @click="submitClose">取消</el-button></el-col>
          <el-col :span="3"><el-button v-throttle  type="primary" plain @click="submitForm('1')">暂存</el-button></el-col>
          <el-col :span="3"><el-button v-throttle  type="primary" @click="submitForm('2')">提交</el-button></el-col>
        </el-row>
      </div>
    </el-form>

    <el-dialog
      title="预览"
      v-model:visible="picOpen"
      :before-close="picPreBeforeClose"
      class="pic-dialog"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      append-to-body
    >
      <img width="100%" :src="dialogImageUrl" alt="" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { ElMessage, ElMessageBox, ElForm } from 'element-plus';
// import { wzfProductReleaseAdd, wzfProductReleaseId, wzfProductSortAll, uploadBatchImg } from '@/api/gapi/supplier';
// 获取router路由参数
const route = useRoute();
const { selID, readonly, addEnProducts } = route.query;

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { review_status, plat_qualification_grade, plat_credit_rating } = toRefs<any>(
  proxy?.useDict('review_status', 'plat_qualification_grade', 'plat_credit_rating')
);
// 定义 refs
const refForm = ref<InstanceType<typeof ElForm> | null>(null);
const refShop = ref();
const refShopWhite = ref();
const refShopInfo = ref();
const refTrademark = ref();

// 定义数据
const loading = ref(false);
const productBoolean = ref(false);
const creditList = ref([]);
const tableList = ref<any[]>([]);
const editConfig = ref({
  trigger: 'click',
  mode: 'cell'
});

// 图片上传相关
const limit1 = ref(5); // 标题图片数量限制
const fileSize = ref(5); // 大小限制(MB)
const fileType = ref(['png', 'jpg', 'jpeg', 'bmp']); // 文件类型
const baseUrl = ref('https://xuzhoushumao.oss-cn-beijing.aliyuncs.com');
// 图片储存
const shopList = ref<any[]>([]);
const shopWhiteList = ref<any[]>([]);
const shopInfoList = ref<any[]>([]);
const trademarkList = ref<any[]>([]);
const imgList = ref<any[]>([]);
let timer: NodeJS.Timeout | null = null;

// 图片预览
const picOpen = ref(false);
const dialogImageUrl = ref('');

// 表单数据
const formData = ref({
  // 基础信息
  headline: '', //标题
  productSort: '', //类型
  productOrigin: '', //产地
  price: '', //价格
  inventory: '', //库存
  deliveryTime: '', //发货期
  productDesc: '', //商品描述

  // 商品属性
  productName: '', //商品名称
  brand: '', //品牌
  artNo: '', //货号
  productType: '', //产品型号
  applicableIndustry: '', //适用行业
  uses: '', //用途

  selfProduct: false, //是否申请
  applicationReason: '', //申请理由
  auditTime: '', //申请时间

  trademarkOrNot: false, //是否拥有商标
  trademarkName: '', //商标名称
  certificationStandards: '', //商标图片
  auditStatus: '',
  auditMsg: '',
  withdrawReason: '',
  imagePathMain: '',
  imagePathWhite: '',
  imagePathDetail: '',
  trademarkImagePath: ''
});

// 表单校验规则
const rules = ref({
  headline: [{ required: true, message: '标题不能为空', trigger: 'blur' }],
  productSort: [{ required: true, message: '类型不能为空', trigger: 'change' }],
  productOrigin: [{ required: true, message: '产地不能为空', trigger: 'blur' }],
  price: [{ required: true, message: '价格不能为空', trigger: 'blur' }],
  inventory: [{ required: true, message: '库存不能为空', trigger: 'blur' }],
  deliveryTime: [{ required: true, message: '发货期不能为空', trigger: 'blur' }],
  productDesc: [{ required: true, message: '商品简要描述不能为空', trigger: 'blur' }],

  productName: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
  brand: [{ required: true, message: '品牌不能为空', trigger: 'blur' }],
  artNo: [{ required: true, message: '货号不能为空', trigger: 'blur' }],
  productType: [{ required: true, message: '型号不能为空', trigger: 'blur' }],
  applicationReason: [{ required: true, message: '申请理由不能为空', trigger: 'blur' }],
  trademarkName: [{ required: true, message: '商标名称不能为空', trigger: 'blur' }]
});

// 方法定义
const submitForm = (status: string) => {
  if (!refForm.value) return;

  refForm.value.validate((valid: boolean) => {
    if (!valid) {
      return;
    }

    const newtiem = new Date();

    // 其他属性进行优化
    submitAttrList();

    // 上传图片优化
    submitImg(newtiem);

    const jsonData = {
      ...formData.value,
      auditStatus: status,
      auditTime: formData.value.selfProduct ? newtiem : null,
      trademarkOrNot: formData.value.trademarkOrNot ? 'T' : 'F'
    };

    // status：1-暂存，2-发布
    if (selID) {
      wzfProductReleaseAdd(jsonData).then((response) => {
        ElMessage.success('修改成功');
      });
    } else {
      delete jsonData.imagePathMain;
      delete jsonData.imagePathWhite;
      delete jsonData.imagePathDetail;
      wzfProductReleaseAdd(jsonData).then((row) => {
        ElMessage.success('新增成功');
      });
    }
  });
};

// 取消
const submitClose = () => {
  ElMessageBox.confirm('确定关闭表单？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {})
    .catch(() => {});
};

// 关闭预览
const picPreBeforeClose = () => {
  dialogImageUrl.value = '';
  picOpen.value = false;
};

// 点击预览
const handlePictureCardPreview = (file: any) => {
  console.log('预览图片', file);
  dialogImageUrl.value = file.url;
  picOpen.value = true;
};

// 删除图片
const handleDelete = (file: any, fileList: any, type: string) => {
  if (type === 'shop') {
    const findex = shopList.value.map((f: any) => f.path).indexOf(file.path);
    if (findex > -1) {
      shopList.value.splice(findex, 1);
    }
  } else if (type === 'shopWhite') {
    const findex = shopWhiteList.value.map((f: any) => f.path).indexOf(file.path);
    if (findex > -1) {
      shopWhiteList.value.splice(findex, 1);
    }
  } else if (type === 'shopInfo') {
    const findex = shopInfoList.value.map((f: any) => f.path).indexOf(file.path);
    if (findex > -1) {
      shopInfoList.value.splice(findex, 1);
    }
  } else if (type === 'trademarkImg') {
    const findex = trademarkList.value.map((f: any) => f.path).indexOf(file.path);
    if (findex > -1) {
      trademarkList.value.splice(findex, 1);
    }
  }
};

// 上传
const uploadFile = (file: any, type: string) => {
  imgList.value.push(file.file);

  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  timer = setTimeout(function () {
    uploadedSuccessfully(type);
  }, 500);
};

// 上传结束处理
const uploadedSuccessfully = (type: string) => {
  const arr = imgList.value;
  const formDataUpload = new FormData();

  arr.forEach((v) => {
    formDataUpload.append(`files`, v);
  });

  uploadBatchImg(formDataUpload)
    .then((response) => {
      imgList.value = [];

      response.data.forEach((item: any, index: number) => {
        const crr = {
          url: baseUrl.value + item,
          path: item
        };
        if (type === 'shop') {
          shopList.value.push(crr);
        } else if (type === 'shopWhite') {
          shopWhiteList.value = [crr];
        } else if (type === 'shopInfo') {
          shopInfoList.value.push(crr);
        } else if (type === 'trademarkImg') {
          trademarkList.value = [crr];
        }

        // 关闭loading
        const loadingInstance = (window as any).loadingInstance;
        if (loadingInstance) {
          loadingInstance.close();
        }
      });
    })
    .catch((res) => {
      imgList.value = [];
      // 关闭loading
      proxy?.$modal.closeLoading();
      ElMessage.error(res.msg);

      if (type === 'shop') {
        refShop.value.handleRemove(file);
      } else if (type === 'shopWhite') {
        refShopWhite.value.handleRemove(file);
      } else if (type === 'shopInfo') {
        refShopInfo.value.handleRemove(file);
      } else if (type === 'trademarkImg') {
        refTrademark.value.handleRemove(file);
      }
    });
};

// 文件个数超出
const handleExceed = () => {
  ElMessage.error(`上传文件数量不能超过 ${limit1.value} 个!`);
};

// 上传前loading加载
const handleBeforeUpload = (file: any) => {
  let isImg = false;
  if (fileType.value.length) {
    let fileExtension = '';
    if (file.name.lastIndexOf('.') > -1) {
      fileExtension = file.name.slice(file.name.lastIndexOf('.') + 1);
    }
    isImg = fileType.value.some((type) => {
      if (file.type.indexOf(type) > -1) return true;
      if (fileExtension && fileExtension.indexOf(type) > -1) return true;
      return false;
    });
  } else {
    isImg = file.type.indexOf('image') > -1;
  }

  if (!isImg) {
    ElMessage.error(`文件格式不正确, 请上传${fileType.value.join('/')}图片格式文件!`);
    return false;
  }
  if (fileSize.value) {
    const isLt = file.size / 1024 / 1024 < fileSize.value;
    if (!isLt) {
      ElMessage.error(`上传图片大小不能超过 ${fileSize.value} MB!`);
      return false;
    }
  }
  // 显示loading
  proxy?.$modal.loading('正在上传图片，请稍候...');
  return true;
};

// table新增
const addTableCell = () => {
  tableList.value.push({});
};

// table删除
const removeTableCell = (index: number, row: any) => {
  ElMessageBox.confirm('您确定要删除该数据?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      tableList.value.splice(index, 1);
    })
    .catch(() => {});
};

// 初始化 其他属性转化
const attrListClick = () => {
  if (!formData.value.attrList || formData.value.attrList.length === 0) {
    return;
  }
  const brr: any[] = [];
  let tabnum = 0;
  let obj: any = {};

  formData.value.attrList.forEach((item: any) => {
    if (tabnum === 0) {
      obj = {
        attrDescribeOne: item.attrDescribe,
        attrNameOne: item.attrName,
        idOne: item.id,
        refIdOne: item.refId
      };
      tabnum = 1;
    } else {
      obj.attrDescribeTwo = item.attrDescribe;
      obj.attrNameTwo = item.attrName;
      obj.idTwo = item.id;
      obj.refIdTwo = item.refId;
      tabnum = 0;
      brr.push(obj);
      obj = {};
    }
  });

  if (tabnum === 1) {
    brr.push(obj);
    obj = {};
  }

  formData.value.attrList = brr;
  tableList.value = brr;
};

// 初始化 图片镶套
const imgChange = () => {
  shopList.value = [];
  shopWhiteList.value = [];
  shopInfoList.value = [];
  trademarkList.value = [];

  // 商品主图
  if (formData.value.imagePathMain) {
    const arr = formData.value.imagePathMain;
    const aList = arr.includes(',') ? arr.split(',') : [arr];

    aList.forEach((e: string) => {
      const file = {
        url: baseUrl.value + e,
        path: e
      };
      shopList.value.push(file);
    });
  }

  // 白底图片
  if (formData.value.imagePathWhite) {
    const crr = {
      url: baseUrl.value + formData.value.imagePathWhite,
      path: formData.value.imagePathWhite
    };
    shopWhiteList.value.push(crr);
  }

  // 商品详情图
  if (formData.value.imagePathDetail) {
    const brr = formData.value.imagePathDetail;
    const bList = brr.includes(',') ? brr.split(',') : [brr];

    bList.forEach((e: string) => {
      const file = {
        url: baseUrl.value + e,
        path: e
      };
      shopInfoList.value.push(file);
    });
  }

  // 商标图片
  if (formData.value.trademarkImagePath) {
    const crr = {
      url: baseUrl.value + formData.value.trademarkImagePath,
      path: formData.value.trademarkImagePath
    };
    trademarkList.value.push(crr);
  }
};

// 其他属性优化   提交
const submitAttrList = () => {
  const brr: any[] = [];
  tableList.value.forEach((item: any) => {
    if (item.attrDescribeOne && item.attrNameOne) {
      brr.push({
        attrDescribe: item.attrDescribeOne || '',
        attrName: item.attrNameOne || '',
        id: !selID ? '' : item.idOne || '',
        refId: item.refIdOne || ''
      });
    }

    if (item.attrDescribeTwo && item.attrNameTwo) {
      brr.push({
        attrDescribe: item.attrDescribeTwo || '',
        attrName: item.attrNameTwo || '',
        id: !selID ? '' : item.idOne || '',
        refId: item.refIdTwo || ''
      });
    }
  });

  formData.value.attrList = brr;
};

// 上传图片优化   提交
const submitImg = (newtiem: Date) => {
  const arr: any[] = [];
  // Logo图片
  const len1 = shopList.value.length;
  for (let i = 0; i < len1; i++) {
    arr.push({
      imageType: 'main',
      imagePath: shopList.value[i].path,
      createTime: newtiem,
      imageSn: i + 1
    });
  }

  // 白底图片
  const len2 = shopWhiteList.value.length;
  for (let i = 0; i < len2; i++) {
    arr.push({
      imageType: 'white',
      imagePath: shopWhiteList.value[i].path,
      createTime: newtiem,
      imageSn: i + 1
    });
  }

  // 详情图片
  const len3 = shopInfoList.value.length;
  for (let i = 0; i < len3; i++) {
    arr.push({
      imageType: 'detail',
      imagePath: shopInfoList.value[i].path,
      createTime: newtiem,
      imageSn: i + 1
    });
  }

  // 商标图片
  if (trademarkList.value.length > 0) {
    formData.value.trademarkImagePath = trademarkList.value[0].path;
  }

  formData.value.imageList = arr;
};

// 生命周期钩子
onMounted(() => {
  // 商品类型
  wzfProductSortAll().then((res) => {
    const arr: any[] = [];
    res.data.forEach((item: any) => {
      if (item.children.length === 0) {
        const brr = item;
        delete brr.children;
        arr.push(brr);
      } else {
        const brr = item;
        brr.children.map((i: any) => {
          delete i.children;
        });
        arr.push(brr);
      }
    });
    creditList.value = arr;
  });

  if (selID) {
    wzfProductReleaseId(selID).then((response) => {
      formData.value = response.data;

      if (formData.value.selfProduct === 'true') {
        formData.value.selfProduct = true;
      } else {
        formData.value.selfProduct = false;
      }

      if (formData.value.trademarkOrNot === 'T') {
        formData.value.trademarkOrNot = true;
      } else {
        formData.value.trademarkOrNot = false;
      }

      attrListClick(); //其他属性进行 更改

      imgChange(); //图片镶套
    });
  }
});
</script>
<style lang="scss" scoped>
.supplier-edit-details {
  padding: 24px;
}
// 表单
::v-deep .el-form-item__label {
  white-space: nowrap;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

// 表格
::v-deep .vxe-header--column .vxe-cell--edit-icon {
  display: none;
}

// 图片上传
::v-deep .el-upload-list--picture-card .el-upload-list__item {
  width: 106px;
  height: 106px;
}

::v-deep .el-upload--picture-card {
  width: 106px;
  height: 106px;
  line-height: 106px;
  float: left;
  margin: 0 8px 8px 0;
}

.line {
  height: 1px;
  background-color: #dcdfe6;
  margin: 40px 0px 30px 0px;
}

.content-form-title {
  position: relative;
  height: 14px;
  line-height: 14px;
  font-weight: bold;
  font-size: 14px;
  color: #333333;
  margin-left: 15px;
  margin-bottom: 20px;
}

.content-form-title::before {
  position: absolute;
  left: -15px;
  top: 0;
  bottom: 0;
  content: '';
  width: 5px;
  background: #2d6cf5;
}

.form-flex {
  display: flex;
  align-items: center;
  height: 30px;
  margin-bottom: 20px;
  .flex-text {
    height: 30px;
    line-height: 30px;
    font-size: 14px;
    color: #666666;

    margin-right: 30px;
  }
  .flex-buttom {
    width: 90px;
    height: 30px;
    display: flex;
    justify-content: center;
    align-items: center;

    font-size: 14px;
    border-radius: 4px;
  }
}

.button-header {
  width: 100px;
  height: 36px;
  background: #ffffff;
  border-radius: 4px;
  font-size: 14px;
  color: #2a81fe;
  text-align: center;
  border: 1px solid #2a81fe;
  margin-left: 40px;
}
</style>
