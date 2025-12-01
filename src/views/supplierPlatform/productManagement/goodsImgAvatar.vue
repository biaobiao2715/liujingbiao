<template>
  <div class="user-info-goods">
    <el-row>
      <el-col :span="12" :style="{ height: '350px' }">
        <vue-cropper
          ref="cropper"
          :img="options.img"
          :info="false"
          :auto-crop="options.autoCrop"
          :auto-crop-width="options.autoCropWidth"
          :auto-crop-height="options.autoCropHeight"
          :fixed-box="options.fixedBox"
          :output-type="options.outputType"
          @real-time="realTime"
        />
      </el-col>
      <el-col :span="12" :style="{ height: '350px' }">
        <div class="goods-avatar-upload">
          <img :src="options.previews.url" :style="options.previews.img" />
        </div>
      </el-col>
    </el-row>
    <br />
    <el-row>
      <el-col :lg="{ span: 1, offset: 2 }" :md="2">
        <el-button v-throttle icon="Plus" @click="changeScale(1)"></el-button>
      </el-col>
      <el-col :lg="{ span: 1, offset: 1 }" :md="2">
        <el-button v-throttle icon="Minus" @click="changeScale(-1)"></el-button>
      </el-col>
      <el-col :lg="{ span: 1, offset: 1 }" :md="2">
        <el-button v-throttle icon="RefreshLeft" @click="rotateLeft()"></el-button>
      </el-col>
      <el-col :lg="{ span: 1, offset: 1 }" :md="2">
        <el-button v-throttle icon="RefreshRight" @click="rotateRight()"></el-button>
      </el-col>
      <el-col :lg="{ span: 2, offset: 6 }" :md="2">
        <el-button v-throttle type="primary" @click="uploadImg()">提 交</el-button>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import 'vue-cropper/dist/index.css';
import { VueCropper } from 'vue-cropper';
import { UploadRawFile } from 'element-plus';

interface Options {
  img: string | any; // 裁剪图片的地址
  autoCrop: boolean; // 是否默认生成截图框
  autoCropWidth: number; // 默认生成截图框宽度
  autoCropHeight: number; // 默认生成截图框高度
  fixedBox: boolean; // 固定截图框大小 不允许改变
  fileName: string;
  previews: any; // 预览数据
  outputType: string;
  visible: boolean;
}

const props = defineProps<{ urlData?: UploadRawFile | string | null }>();

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const emit = defineEmits<{ (e: 'success', payload: { blob: Blob; fileName: string }): void }>();

const cropper = ref<any>({});
// 图片裁剪数据
const options = reactive<Options>({
  img: '',
  autoCrop: true,
  autoCropWidth: 200,
  autoCropHeight: 200,
  fixedBox: true,
  outputType: 'png',
  fileName: '',
  previews: {},
  visible: false
});

/** 向左旋转 */
const rotateLeft = () => {
  cropper.value.rotateLeft();
};
/** 向右旋转 */
const rotateRight = () => {
  cropper.value.rotateRight();
};
/** 图片缩放 */
const changeScale = (num: number) => {
  num = num || 1;
  cropper.value.changeScale(num);
};
/** 提交裁剪：返回裁剪后的 Blob 和文件名，由父组件上传 */
const uploadImg = async () => {
  cropper.value.getCropBlob(async (data: any) => {
    try {
      const resizedBlob = await resizeTo800(data);
      emit('success', { blob: resizedBlob, fileName: options.fileName || 'crop.png' });
      options.visible = false;
    } catch (e: any) {
      proxy?.$modal.msgError(e?.message || '裁剪失败');
    }
  });
};
// 将裁剪结果强制缩放到 800x800
const resizeTo800 = (blob: Blob): Promise<Blob> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 800;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas 不可用'));
      ctx.clearRect(0, 0, 800, 800);
      ctx.drawImage(img, 0, 0, 800, 800);
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('导出失败'))), 'image/png');
    };
    img.onerror = () => reject(new Error('图片加载失败'));
    img.src = URL.createObjectURL(blob);
  });

/** 实时预览 */
const realTime = (data: any) => {
  options.previews = data;
};

// 监听父组件传入的文件或数据URL，打开裁剪
watch(
  () => props.urlData,
  (val) => {
    if (!val) return;
    if (typeof val === 'string') {
      options.img = val;
      options.fileName = 'crop.png';
      options.visible = true;
      return;
    }
    const file = val as UploadRawFile;
    if (file && file.type.indexOf('image/') > -1) {
      const reader = new FileReader();
      reader.onload = () => {
        options.img = reader.result as string;
        options.fileName = file.name;
        options.visible = true;
      };
      reader.readAsDataURL(file);
    } else {
      proxy?.$modal.msgError('文件格式错误，请上传图片类型');
    }
  },
  { immediate: true }
);
</script>

<style lang="scss" scoped>
.user-info-head {
  position: relative;
  display: inline-block;
  height: 120px;
}

.user-info-head:hover:after {
  content: '+';
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  color: #eee;
  background: rgba(0, 0, 0, 0.5);
  font-size: 24px;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  cursor: pointer;
  line-height: 110px;
  border-radius: 50%;
}

.goods-avatar-upload {
  position: absolute;
  top: 50%;
  transform: translate(50%, -50%);
  width: 200px;
  height: 200px;
  box-shadow: 0 0 4px #ccc;
  overflow: hidden;
}
</style>
