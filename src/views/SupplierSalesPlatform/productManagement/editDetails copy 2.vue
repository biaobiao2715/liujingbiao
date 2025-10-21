<template>
  <div v-loading="loading">
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
                    value: 'id',
                    label: labelLanguage
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

        <!-- 申请自营商品 -->
        <div>
          <el-checkbox
            :disabled="readonly || productBoolean"
            v-model="formData.selfProduct"
            text-color="#111111"
            fill="#EE201D"
            style="margin-bottom: 20px"
            >申请成为自营商品</el-checkbox
          >
          <el-row v-if="formData.selfProduct">
            <el-col :span="24">
              <el-form-item label="申请理由" prop="applicationReason">
                <el-input v-model="formData.applicationReason" :disabled="readonly" placeholder="请输入申请理由" type="textarea" :rows="5" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 是否拥有商标 -->
        <div>
          <el-checkbox :disabled="readonly" v-model="formData.trademarkOrNot" text-color="#111111" fill="#EE201D" style="margin-bottom: 20px"
            >是否拥有商标</el-checkbox
          >
          <el-row v-if="formData.trademarkOrNot">
            <el-col :span="12">
              <el-form-item label="商标名称" prop="trademarkName">
                <el-input :disabled="readonly" v-model="formData.trademarkName" placeholder="请输入商标名称" />
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 商标证书 -->
          <el-row v-if="formData.trademarkOrNot">
            <el-col :span="24">
              <el-form-item label="商标证书" prop="titletrademarkImg">
                <div>1.请上传商标证书或第三方授权</div>
                <div>2.小于5MB,格式为PNG/JPEG/JPG/BMP</div>
                <el-upload
                  ref="refTrademark"
                  list-type="picture-card"
                  action="#"
                  :disabled="readonly"
                  :file-list="trademarkList"
                  :on-preview="handlePictureCardPreview"
                  :before-upload="handleBeforeUpload"
                  :http-request="
                    (flie) => {
                      uploadFile(flie, 'trademarkImg');
                    }
                  "
                  :on-remove="
                    (flie, fileList) => {
                      handleDelete(flie, fileList, 'trademarkImg');
                    }
                  "
                >
                  <i class="el-icon-plus"></i>
                </el-upload>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item label="认证标准" prop="certificationStandards">
                <el-input :disabled="readonly" v-model="formData.certificationStandards" placeholder="请输入认证标准/可填无" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <div v-show="formData.auditStatus == '-1'">
          <div class="line" style="margin-top: 18px"></div>

          <div class="content-form-title">拒绝理由</div>

          <div>
            <div class="refuse-text" style="margin-bottom: 20px">若您拒绝通过本商品的申请，请填写拒绝理由</div>

            <el-row>
              <el-col :span="24">
                <el-form-item label="拒绝理由" prop="auditMsg">
                  <el-input v-model="formData.auditMsg" :disabled="true" placeholder="请输入拒绝理由" type="textarea" :rows="5" />
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </div>

        <div v-show="isWithdraw">
          <div class="line" style="margin-top: 18px"></div>

          <div class="content-form-title">撤回理由</div>

          <el-row>
            <el-col :span="24">
              <el-form-item label="撤回理由" prop="withdrawReason">
                <el-input v-model="formData.withdrawReason" :disabled="!isWithdraw" placeholder="请输入撤回理由" type="textarea" :rows="5" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 按钮 -->
        <el-row type="flex" justify="center" :gutter="5">
          <el-col :span="3" v-show="!readonly"><el-button v-throttle  @click="submitClose">取消</el-button></el-col>
          <el-col :span="3" v-show="!readonly"><el-button v-throttle  type="primary" plain @click="submitForm('1')">暂存</el-button></el-col>

          <el-col :span="3" v-show="!readonly"><el-button v-throttle  type="primary" @click="submitForm('2')">提交</el-button></el-col>

          <el-col :span="3" v-show="isWithdraw"><el-button v-throttle  @click="submitClose">取消</el-button></el-col>

          <el-col :span="3" v-show="isWithdraw"><el-button v-throttle  type="primary" @click="submitWithdraw">提交</el-button></el-col>
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

<script>
import {
  translateEntity,
  wzfProductReleaseAdd,
  wzfProductReleaseId,
  wzfProductReleaseWithdraw,
  wzfProductSortAll,
  uploadBatchImg
} from '@/api/gapi/supplier';

import { getToken } from '@/utils/auth';
export default {
  name: 'logisticsProductForm',
  components: {},
  dicts: [
    'wzf_language_type' //目标语言
  ],
  props: {
    selID: {
      type: String | Number,
      default: ''
    },
    readonly: {
      type: Boolean,
      require: true
    },
    language: {
      type: String,
      default: 'zh'
    },
    addEnProducts: {
      type: String | Number,
      default: '',
      required: false
    },
    isWithdraw: {
      type: Boolean,
      default: false,
      required: false
    }
  },
  components: {},
  data() {
    const imgRules1 = (rule, value, callback) => {
      if (this.shopList.length == 0) {
        callback(new Error('请上传商品主图'));
      } else {
        callback();
      }
    };

    const imgRules2 = (rule, value, callback) => {
      if (this.shopWhiteList.length == 0) {
        callback(new Error('请上传白底图'));
      } else {
        callback();
      }
    };

    const imgRules3 = (rule, value, callback) => {
      if (this.shopInfoList.length == 0) {
        callback(new Error('请上传详情页图片'));
      } else {
        callback();
      }
    };

    const imgRules4 = (rule, value, callback) => {
      if (this.trademarkList.length == 0) {
        callback(new Error('请上传商标证书或第三方授权'));
      } else {
        callback();
      }
    };
    return {
      // 表单校验
      rules: {
        headline: [{ required: true, message: '标题不能为空' }],
        productSort: [{ required: true, message: '类型不能为空' }],
        productOrigin: [{ required: true, message: '产地不能为空' }],
        price: [{ required: true, message: '价格不能为空' }],
        inventory: [{ required: true, message: '库存不能为空' }],
        deliveryTime: [{ required: true, message: '发货期不能为空' }],
        productDesc: [{ required: true, message: '商品简要描述不能为空' }],

        productName: [{ required: true, message: '名称不能为空' }],
        brand: [{ required: true, message: '品牌不能为空' }],
        artNo: [{ required: true, message: '货号不能为空' }],
        productType: [{ required: true, message: '型号不能为空' }],
        titleFileList: [{ validator: imgRules1, trigger: 'blur', required: true }],
        titleWhiteFileList: [{ validator: imgRules2, trigger: 'blur', required: true }],
        infoFileList: [{ validator: imgRules3, trigger: 'blur', required: true }],
        titletrademarkImg: [{ validator: imgRules4, trigger: 'blur', required: true }],

        applicationReason: [{ required: true, message: '申请理由不能为空' }],
        trademarkName: [{ required: true, message: '商标名称不能为空' }]
      },

      formData: {
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
        certificationStandards: '' //商标图片

        // attrList: [],
      },

      formDataZh: {},
      formDataEn: {},

      // 遮罩层
      loading: false,
      productBoolean: false,
      creditList: [], //商品类型
      tableList: [], //其他属性类型

      editConfig: {
        trigger: 'click',
        mode: 'cell'
      },

      // 图片上传相关
      limit1: 5, // 标题图片数量限制
      fileSize: 5, // 大小限制(MB)
      fileType: ['png', 'jpg', 'jpeg', 'bmp'], // 文件类型
      baseUrl: 'https://xuzhoushumao.oss-cn-beijing.aliyuncs.com',
      // baseUrl: process.env.VUE_APP_BASE_API,
      uploadImgUrl: process.env.VUE_APP_BASE_API + '/oss/upload', // 上传的图片服务器地址
      headers: {
        Authorization: 'Bearer ' + getToken()
      },
      // 图片储存
      shopList: [],
      shopWhiteList: [],
      shopInfoList: [],
      trademarkList: [],
      imgList: [],
      timer: null,
      // 图片预览
      picOpen: false,
      dialogImageUrl: ''
    };
  },
  mounted() {
    // 商品类型
    wzfProductSortAll().then((res) => {
      const arr = [];
      res.data.forEach((item) => {
        if (item.children.length == 0) {
          const brr = item;
          delete brr.children;
          arr.push(brr);
        } else {
          const brr = item;
          brr.children.map((i) => {
            delete i.children;
          });
          arr.push(brr);
        }
      });
      this.creditList = arr;
    });

    if (this.$store.state.user.userInfo.NEWuserType == 'platform') {
      this.productBoolean = true;
      this.formData.selfProduct = true;
    }

    if (this.selID) {
      wzfProductReleaseId(this.selID).then((response) => {
        this.formData = response.data;

        if (this.formData.selfProduct == 'true') {
          this.formData.selfProduct = true;
        } else {
          this.formData.selfProduct = false;
        }

        if (this.formData.trademarkOrNot == 'T') {
          this.formData.trademarkOrNot = true;
        } else {
          this.formData.trademarkOrNot = false;
        }

        this.attrListClick(); //其他属性进行 更改

        this.imgChange(); //图片镶套
      });
    } else {
      if (this.language == 'en') {
        this.addProductsEn();
      } else {
      }
    }
  },
  methods: {
    // 提交暂存功能
    submitForm(status) {
      this.$refs.refForm.validate((valid) => {
        if (!valid) {
          return;
        }

        const newtiem = new Date();

        // 其他属性进行优化
        this.submitAttrList();

        // 上传图片优化
        this.submitImg(newtiem);

        const jsonData = {
          ...this.formData,
          auditStatus: status,
          auditTime: this.formData.selfProduct ? newtiem : null,
          trademarkOrNot: this.formData.trademarkOrNot ? 'T' : 'F'
        };

        // status：1-暂存，2-发布
        if (this.selID) {
          delete jsonData.productStatus;
          jsonData.userId = this.$store.state.user.userInfo.userId;
          jsonData.userName = this.$store.state.user.userInfo.createBy;
          wzfProductReleaseAdd(jsonData).then((response) => {
            this.$modal.msgSuccess('修改成功');
            this.$emit('refresh');
          });
        } else {
          delete jsonData.imagePathMain;
          delete jsonData.imagePathWhite;
          delete jsonData.imagePathDetail;
          jsonData.language = this.language;
          jsonData.createTime = newtiem;
          jsonData.createBy = this.$store.state.user.userInfo.createBy;
          jsonData.userId = this.$store.state.user.userInfo.userId;
          jsonData.shopId = this.$store.state.user.userInfo.NEWshopId;

          wzfProductReleaseAdd(jsonData).then((row) => {
            this.$modal.msgSuccess('新增成功');
            if (this.language == 'zh') {
              this.$emit('refresh', row.data);
            } else {
              this.$emit('refresh');
            }
          });
        }
      });
    },

    submitWithdraw() {
      if (!this.formData.withdrawReason) {
        return this.$modal.msgError('撤回理由不能为空');
      }
      const obj = {
        productId: this.formData.productId,
        withdrawReason: this.formData.withdrawReason
      };
      wzfProductReleaseWithdraw(obj).then((response) => {
        this.$modal.msgSuccess('申请撤回成功');
        this.$emit('refresh');
      });
    },

    // 取消
    submitClose() {
      this.$modal
        .confirm('确定关闭表单？')
        .then(() => {
          this.$emit('cancel', '取消');
        })
        .catch(() => {});
    },

    // 翻译
    TranslationClick() {
      const arr = this.formData;
      arr.imageList = '';
      this.loading = true;
      translateEntity(arr).then((response) => {
        this.$modal.msgSuccess('翻译成功');
        this.formData = response.data;
        // this.formData.language = "en";
        this.loading = false;
      });
    },

    // 关闭预览
    picPreBeforeClose() {
      this.dialogImageUrl = '';
      this.picOpen = false;
    },
    // 点击预览
    handlePictureCardPreview(file) {
      console.log('预览图片', file);
      this.dialogImageUrl = file.url;
      this.picOpen = true;
    },
    // 删除图片
    handleDelete(file, fileList, type) {
      if (type == 'shop') {
        const findex = this.shopList.map((f) => f.path).indexOf(file.path);
        if (findex > -1) {
          this.shopList.splice(findex, 1);
        }
      } else if (type == 'shopWhite') {
        const findex = this.shopWhiteList.map((f) => f.path).indexOf(file.path);
        if (findex > -1) {
          this.shopWhiteList.splice(findex, 1);
        }
      } else if (type == 'shopInfo') {
        const findex = this.shopInfoList.map((f) => f.path).indexOf(file.path);
        if (findex > -1) {
          this.shopInfoList.splice(findex, 1);
        }
      } else if (type == 'trademarkImg') {
        const findex = this.trademarkList.map((f) => f.path).indexOf(file.path);
        if (findex > -1) {
          this.trademarkList.splice(findex, 1);
        }
      }
    },
    // 上传
    uploadFile(file, type) {
      const that = this;
      this.imgList.push(file.file);

      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      this.timer = setTimeout(function () {
        that.uploadedSuccessfully(type);
      }, 500);
    },
    // 上传结束处理
    uploadedSuccessfully(type) {
      const arr = this.imgList;
      const formData = new FormData();

      arr.forEach((v) => {
        formData.append(`files`, v);
      });

      uploadBatchImg(formData)
        .then((response) => {
          this.imgList = [];

          response.data.forEach((item, index) => {
            const crr = {
              url: this.baseUrl + item,
              // url: URL.createObjectURL(arr[index]),
              path: item
            };
            if (type == 'shop') {
              this.shopList.push(crr);
            } else if (type == 'shopWhite') {
              this.shopWhiteList = [crr];
            } else if (type == 'shopInfo') {
              this.shopInfoList.push(crr);
            } else if (type == 'trademarkImg') {
              this.trademarkList = [crr];
            }

            this.$modal.closeLoading();
          });
        })
        .catch(() => {
          this.imgList = [];
          this.$modal.closeLoading();
          this.$modal.msgError(res.msg);

          if (type == 'shop') {
            this.$refs.refShop.handleRemove(file);
          } else if (type == 'shopWhite') {
            this.$refs.refShopWhite.handleRemove(file);
          } else if (type == 'shopInfo') {
            this.$refs.refShopInfo.handleRemove(file);
          } else if (type == 'trademarkImg') {
            this.$refs.refTrademark.handleRemove(file);
          }
        });
    },
    // 文件个数超出
    handleExceed() {
      this.$modal.msgError(`上传文件数量不能超过 ${this.limit1} 个!`);
    },
    // 上传前loading加载
    handleBeforeUpload(file) {
      let isImg = false;
      if (this.fileType.length) {
        let fileExtension = '';
        if (file.name.lastIndexOf('.') > -1) {
          fileExtension = file.name.slice(file.name.lastIndexOf('.') + 1);
        }
        isImg = this.fileType.some((type) => {
          if (file.type.indexOf(type) > -1) return true;
          if (fileExtension && fileExtension.indexOf(type) > -1) return true;
          return false;
        });
      } else {
        isImg = file.type.indexOf('image') > -1;
      }

      if (!isImg) {
        this.$modal.msgError(`文件格式不正确, 请上传${this.fileType.join('/')}图片格式文件!`);
        return false;
      }
      if (this.fileSize) {
        const isLt = file.size / 1024 / 1024 < this.fileSize;
        if (!isLt) {
          this.$modal.msgError(`上传图片大小不能超过 ${this.fileSize} MB!`);
          return false;
        }
      }
      this.$modal.loading('正在上传图片，请稍候...');
    },
    // table新增
    addTableCell() {
      this.tableList.push({});
    },
    // table删除
    removeTableCell(index, row) {
      this.$confirm('您确定要删除该数据?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.tableList.splice(index, 1);
        })
        .catch(() => {});
    },

    // 初始化 其他属性转化
    attrListClick() {
      if (this.formData.attrList.length == 0) {
        return;
      }
      const brr = [];
      let tabnum = 0;
      let obj = {};

      this.formData.attrList.forEach((item) => {
        if (tabnum == 0) {
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

      if (tabnum == 1) {
        brr.push(obj);
        obj = {};
      }

      this.formData.attrList = brr;
      this.tableList = brr;
    },

    //初始化 图片镶套
    imgChange() {
      this.shopList = [];
      this.shopWhiteList = [];
      this.shopInfoList = [];
      this.trademarkList = [];

      // 商品主图
      if (this.formData.imagePathMain) {
        const arr = this.formData.imagePathMain;
        const aList = arr.includes(',') ? arr.split(',') : [arr];

        aList.forEach((e) => {
          const file = {
            url: this.baseUrl + e,
            path: e
          };
          this.shopList.push(file);
        });
      }

      // 白底图片
      if (this.formData.imagePathWhite) {
        const crr = {
          url: this.baseUrl + this.formData.imagePathWhite,
          path: this.formData.imagePathWhite
        };
        this.shopWhiteList.push(crr);
      }

      // 商品详情图
      if (this.formData.imagePathDetail) {
        const brr = this.formData.imagePathDetail;
        const bList = brr.includes(',') ? brr.split(',') : [brr];

        bList.forEach((e) => {
          const file = {
            url: this.baseUrl + e,
            path: e
          };
          this.shopInfoList.push(file);
        });
      }

      // 商标图片
      if (this.formData.trademarkImagePath) {
        const crr = {
          url: this.baseUrl + this.formData.trademarkImagePath,
          path: this.formData.trademarkImagePath
        };
        this.trademarkList.push(crr);
      }
    },

    // 其他属性优化   提交
    submitAttrList() {
      const brr = [];
      this.tableList.forEach((item) => {
        if (item.attrDescribeOne && item.attrNameOne) {
          brr.push({
            attrDescribe: item.attrDescribeOne || '',
            attrName: item.attrNameOne || '',
            id: !this.selID ? '' : item.idOne || '',
            refId: item.refIdOne || ''
          });
        }

        if (item.attrDescribeTwo && item.attrNameTwo) {
          brr.push({
            attrDescribe: item.attrDescribeTwo || '',
            attrName: item.attrNameTwo || '',
            id: !this.selID ? '' : item.idOne || '',
            refId: item.refIdTwo || ''
          });
        }
      });

      this.formData.attrList = brr;
      // console.log("其他属性", brr);
    },

    //上传图片优化   提交
    submitImg(newtiem) {
      const arr = [];
      // Logo图片
      const len1 = this.shopList.length;
      for (let i = 0; i < len1; i++) {
        arr.push({
          imageType: 'main',
          imagePath: this.shopList[i].path,
          createTime: newtiem,
          imageSn: i + 1
        });
      }

      // 白底图片
      const len2 = this.shopWhiteList.length;
      for (let i = 0; i < len2; i++) {
        arr.push({
          imageType: 'white',
          imagePath: this.shopWhiteList[i].path,
          createTime: newtiem,
          imageSn: i + 1
        });
      }

      // 详情图片
      const len3 = this.shopInfoList.length;
      for (let i = 0; i < len3; i++) {
        arr.push({
          imageType: 'detail',
          imagePath: this.shopInfoList[i].path,
          createTime: newtiem,
          imageSn: i + 1
        });
      }

      // 商标图片
      if (this.trademarkList.length > 0) {
        this.formData.trademarkImagePath = this.trademarkList[0].path;
      }

      this.formData.imageList = arr;
    },

    // 新增英文商品
    addProductsEn() {
      this.$modal.loading('正在进行翻译，请稍候...');
      wzfProductReleaseId(this.addEnProducts).then((response) => {
        const arr = response.data;
        this.formData = response.data;

        const attrobj = {};

        if (arr.attrList) {
          arr.attrList.forEach((e, index) => {
            const key = 'attrNameKey' + index;
            const value = 'attrDescribeValue' + index;
            attrobj[key] = e.attrName;
            attrobj[value] = e.attrDescribe;
          });
        }

        const brr = {
          ...attrobj,
          headline: arr.headline,
          productOrigin: arr.productOrigin, //产地
          deliveryTime: arr.deliveryTime, //发货期
          productDesc: arr.productDesc, //商品描述
          // 商品属性
          productName: arr.productName, //商品名称
          brand: arr.brand, //品牌
          artNo: arr.artNo, //货号
          productType: arr.productType, //产品型号
          applicableIndustry: arr.applicableIndustry || '', //适用行业
          uses: arr.uses || '', //用途

          applicationReason: arr.applicationReason || '', //申请理由

          trademarkName: arr.trademarkName, //商标名称
          certificationStandards: arr.certificationStandards //认证标准
        };

        translateEntity(brr).then((res) => {
          this.$modal.msgSuccess('翻译成功');

          if (arr.attrList) {
            const person = res.data;

            for (const key in person) {
              if (key.includes('attrNameKey')) {
                const num = key.slice(11);
                arr.attrList[num].attrName = person[key];
              }
              if (key.includes('attrDescribeValue')) {
                const num = key.slice(17);
                arr.attrList[num].attrDescribe = person[key];
              }
            }
          }

          this.formData = {
            ...res.data,
            language: 'en',
            type: arr.type,
            productSort: arr.productSort,
            price: arr.price,
            inventory: arr.inventory,

            productId: arr.productId,
            selfProduct: arr.selfProduct == 'true' ? true : false,
            trademarkOrNot: arr.trademarkOrNot == 'T' ? true : false,

            imagePathMain: arr.imagePathMain,
            imagePathWhite: arr.imagePathWhite,
            imagePathDetail: arr.imagePathDetail,
            trademarkImagePath: arr.trademarkImagePath,

            attrList: arr.attrList
          };
          this.attrListClick(); //其他属性进行 更改

          this.imgChange(); //图片镶套
          this.$modal.closeLoading();
        });
      });
    },

    // 关闭弹窗
    handleClose() {
      this.$emit('cancel');
    }
  },
  computed: {
    labelLanguage() {
      if (this.language == 'zh') {
        return 'catName';
      } else {
        return 'catNameEn';
      }
    }
  },
  watch: {}
};
</script>

<style lang="scss" scoped>
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
