<!--
  标题: Purchaser.vue
  功能: 品种识别
  说明: 用于查看我的品种识别订单。
  当前版本: 1.0
  开发信息: Created by 刘景彪 2025-11-18
-->
<template>
  <div class="orders">
    <!-- 页面标题 -->
    <!-- <div class="menu-title">新增作物</div> -->
    <div class="pading20">
      <div class="upload-box-container">
        <el-upload
          ref="uploadRef"
          class="upload-box"
          accept=".jpg,.jpeg,.png,.pdf"
          action="#"
          drag
          :auto-upload="false"
          :show-file-list="false"
          :on-change="handleDiplomaChange"
        >
          <div class="upload-content" :class="{ error: uploadError }">
            <template v-if="diplomaUrl.url && !uploadError">
              <div v-if="diplomaUrl.type == 'pdf'" class="upload-pdf">{{ diplomaUrl.name }}</div>
              <img v-else :src="diplomaUrl.url" :alt="diplomaUrl.name" class="upload-image" />
            </template>
            <template v-else>
              <div class="upload-placeholder">
                <img src="@/assets/images/mall/upload-img.png" class="step-icon" />
                <div class="upload-text">点击或将附件拖拽到这里上传</div>
                <div class="upload-tip">最大10M 支持：jpg jpeg png pdf</div>
              </div>
            </template>
          </div>
        </el-upload>
      </div>
      <!-- 错误提示定位容器，可通过 alertPosition 切换位置 -->
      <div :class="['alert-wrapper', 'pos-center']" v-if="uploadError">
        <el-alert center @close="closable">
          <div class="error-title">提示</div>
          <div class="error-icon">×</div>
          <div class="error-title-content">识别失败</div>
          <div class="error-tietle-copey">抱歉，无法识别您上传的图片</div>
          <div class="error-msg">可能原因：{{ uploadError }}</div>
        </el-alert>
      </div>

      <div style="height: 50px"></div>
      <!-- 操作按钮 -->
      <el-row type="flex" justify="center" :gutter="5">
        <div class="category-wrapper">
          <div class="category-label-box">选择大类</div>
          <el-select v-model="selectedCategory" placeholder="请选择" clearable filterable style="width: 220px">
            <el-option v-for="item in categories" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </div>
        <div style="width: 20px"></div>
        <el-button v-throttle type="primary" @click="submitForm">开始识别</el-button>
        <div style="width: 20px"></div>
        <el-button v-throttle @click="handcancel">历史记录</el-button>
      </el-row>
      <!-- 搜索条件 -->
      <el-form ref="formRef" :model="form" :label-width="130" v-show="formShow">
        <el-form-item label="品种名称：" prop="varietyType">
          {{ form.varietyType }}
        </el-form-item>

        <el-form-item label="品种类型：" prop="varietyType">
          <!-- <dict-text :options="varietyTypeOptions" :value="form.varietyType ?? ''" /> -->
          {{ form.varietyType }}
        </el-form-item>

        <el-form-item label="特征描述：" prop="varietyType">
          {{ form.varietyType }}
        </el-form-item>

        <el-form-item label="种植技术指导：" prop="varietyType">
          {{ form.varietyType }}
        </el-form-item>
        <el-form-item label="注意事项：" prop="varietyType">
          {{ form.varietyType }}
        </el-form-item>
        <el-form-item label="置信度评分：" prop="varietyType">
          {{ form.varietyType }}
        </el-form-item>
        <el-form-item label="识别状态：" prop="varietyType">
          <img :src="form.skeleton_URL" alt="" style="width: 100px; height: 100px" />
        </el-form-item>

        <div class="flex-center-end">
          <el-button v-throttle type="primary" @click="handleSubmit">确定</el-button>
          <el-button v-throttle @click="handcancel">取消</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance, toRefs, type ComponentInternalInstance } from 'vue';
import {} from '@/api/register'; // 图片上传接口
import { ossUploadImage, varietyRecognizeIdentify } from '@/api/mall/personalCenter/varietyIdentification';

import type { UploadFile } from 'element-plus';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { review_status } = toRefs<any>(proxy?.useDict('review_status'));
const emit = defineEmits<{
  (e: 'refresh'): void;
  (e: 'cancel'): void;
}>();
// 搜索表单数据
const form = ref({
  pageNum: 1,
  pageSize: 10,
  varietyType: '',
  skeleton_URL: '',
  identifyTime: [] as string[] | []
});
// 大类选择
const categories = [
  { label: '大豆', value: 'IR_maize_zili_type' },
  { label: '小麦', value: 'IR_maize_zili_type' },
  { label: '油菜', value: 'IR_maize_zili_type' },
  { label: '玉米', value: 'IR_maize_zili_type' },
  { label: '水稻', value: 'IR_maize_zili_type' }
];
const selectedCategory = ref<string>('');
const formRef = ref();
const formShow = ref(false);
// 上传文件信息
const diplomaUrl = ref<any>({ url: null, name: '', fileType: '1', remark: '', ossId: undefined, ossInfo: {} });
// 上传过程与错误状态
const uploading = ref(false);
const uploadError = ref<string | null>(null);
const uploadRef = ref();
const sizeLimit = 10 * 1024 * 1024; // 10M
const allowExt = ['jpg', 'jpeg', 'png', 'pdf'];
const allowMime = ['image/jpeg', 'image/png', 'application/pdf'];

// 提交按钮操作
const handleSubmit = () => {
  emit('refresh');
};
/** 取消按钮操作 */
const handcancel = () => {
  emit('cancel');
};

const submitForm = () => {
  if (!selectedCategory.value) {
    ElMessage.warning('请先选择大类');
    return;
  }
  if (!diplomaUrl.value.ossId) {
    ElMessage.warning('请上传图片后再进行识别');
    return;
  }
  proxy?.$modal.loading('正在识别中，请稍候...');
  varietyRecognizeIdentify({ imageUrl: diplomaUrl.value.url, modelName: selectedCategory.value })
    .then((res) => {
      ElMessage.success('识别成功');
      console.log('识别结果：', res);
      formShow.value = true;
      form.value = res.data || {};
    })
    .catch((error) => {
      console.error('识别过程出错：', error);
      ElMessage.error('识别失败，请重试');
    })
    .finally(() => {
      proxy?.$modal.closeLoading();
    });
};
/** 文件上传成功处理 */
const handleDiplomaChange = (file: UploadFile) => {
  uploadError.value = null;
  if (!file || !file.raw) return;

  // 类型校验
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (!ext || !allowExt.includes(ext) || !allowMime.includes(file.raw.type)) {
    uploadError.value = '格式不支持，请上传 jpg / jpeg / png / pdf';
    return;
  }
  // 大小校验
  if (file.raw.size > sizeLimit) {
    uploadError.value = '文件超出 10M，请压缩后重新上传';
    return;
  }

  uploading.value = true;
  proxy?.$modal.loading('正在上传，请稍候...');
  ossUploadImage({ file: file.raw })
    .then((res) => {
      if (res.data?.ossId) {
        diplomaUrl.value = {
          name: res.data.fileName || file.name || '品种识别图片',
          remark: '品种识别图片',
          url: res.data.url,
          fileType: '1',
          type: ext,
          ossId: res.data.ossId,
          ossInfo: {}
        };
        ElMessage.success('上传成功');
      } else {
        uploadError.value = '上传返回数据异常，请重试';
      }
    })
    .catch((error) => {
      console.error('上传过程出错：', error);
      uploadError.value = '上传失败，可能是网络问题，请稍后再试';
    })
    .finally(() => {
      uploading.value = false;
      proxy?.$modal.closeLoading();
    });
};
/** 关闭错误提示弹窗 */
const closable = () => {
  uploadError.value = null;
};
</script>

<style scoped>
/* 页面布局样式 */
.menu-title {
  display: flex;
  align-items: center;
  height: 60px;
  padding-left: 20px;
  font-size: 20px;
  font-weight: 500;
  color: #333333;
  background: #fff;
  position: relative;
  border-bottom: 2px solid #d8d8d8;
  border-radius: 8px 8px 0 0;
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
}
.menu-title::before {
  content: '';
  display: inline-block;
  width: 26px;
  height: 26px;
  background: #108c58;
  border-radius: 4px 4px 4px 4px;
  margin-right: 12px;
}
.pading20 {
  padding: 20px;
  background: #ffffff;
  border-radius: 0 0 8px 8px;
}

.upload-box-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.upload-box {
  width: 700px;

  .upload-content {
    width: 700px;
    height: 276px;
    background: rgba(16, 140, 88, 0.05);
    border-radius: 8px 8px 8px 8px;
    border: 1px dashed #108c58;
    position: relative;
    overflow: hidden;
    transition: border-color 0.25s;

    &.error {
      border-color: #f56c6c;
      background: rgba(255, 0, 0, 0.03);
    }

    .upload-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .upload-image {
      width: 100%;
      height: 276px;
    }
    .upload-pdf {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .step-icon {
      width: 57px;
      height: 52px;
      margin: 100px 0 20px 0;
    }

    .upload-text {
      height: 21px;
      font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
      font-weight: 500;
      font-size: 14px;
      color: #108c58;
      line-height: 21px;
      text-align: left;
      font-style: normal;
      text-transform: none;
      margin-bottom: 2px;
    }

    .upload-tip {
      height: 21px;
      font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
      font-weight: 400;
      font-size: 14px;
      color: #7a7a7a;
      line-height: 21px;
      text-align: left;
      font-style: normal;
      text-transform: none;
    }
  }
  .upload-image {
    width: 100%;
    height: 150px;
  }
}

/* 大类选择样式 */
.category-wrapper {
  display: flex;
  align-items: center;
}
.category-label {
  margin-right: 8px;
  color: #333333;
  font-size: 14px;
}
/* 绿色按钮风格的标签块 */
.category-label-box {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  background: #108c58;
  color: #ffffff;
  border-radius: 4px;
  font-size: 14px;
  margin-right: 12px;
  white-space: nowrap;
}

/* 使用深度选择器确保样式能够穿透到Element UI组件内部 */
.upload-box-container ::v-deep(.el-upload-dragger) {
  width: 100%;
  height: 100%;
  padding: 0;
  border-width: 0;
  border-radius: 0;
}

/* 错误提示弹窗样式 */
::v-deep.el-alert.el-alert--info.is-center.is-light {
  width: 487px;
  background: #ffffff;
  box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.3);
  border-radius: 4px 4px 4px 4px;

  .el-alert__content {
    width: 100%;
    .el-alert__description {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
  }
}
.alert-wrapper {
  position: fixed;
  z-index: 3000;
}
.alert-wrapper.pos-center {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.error-title {
  width: 100%;
  height: 34px;
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  font-weight: 500;
  font-size: 20px;
  color: #444444;
  line-height: 24px;
  text-align: center;
  font-style: normal;
  text-transform: none;
  padding-bottom: 10px;
  border-bottom: 1px solid #f1f1f1;
  margin-bottom: 35px;
}
.error-icon {
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f53f3f;
  font-size: 34px;
  margin-bottom: 16px;

  width: 45px;
  height: 45px;
  background: #ffece8;
}
.error-title-content {
  margin-bottom: 10px;
  height: 22px;
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  font-weight: 500;
  font-size: 14px;
  color: #1d2129;
  line-height: 22px;
  text-align: left;
  font-style: normal;
  text-transform: none;
}
.error-tietle-copey {
  height: 31px;
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  font-weight: 400;
  font-size: 14px;
  color: #333333;
  line-height: 22px;
  text-align: left;
  font-style: normal;
  text-transform: none;
}
.error-msg {
  height: 22px;
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  font-weight: 400;
  font-size: 14px;
  color: #4e5969;
  line-height: 22px;
  text-align: left;
  font-style: normal;
  text-transform: none;
  margin-bottom: 64px;
}
</style>
