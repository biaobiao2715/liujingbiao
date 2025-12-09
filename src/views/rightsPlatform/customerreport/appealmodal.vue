<!--
标题：		appealmodal.vue
功能：		举报申述
说明：
当前版本：	1.0
开发信息：	Created by 李政达 2025-11-18
修改人信息：	李政达 2025-11-18
修改内容：	举报申述
 -->
<template>
  <div class="content-edit-dialog" v-loading="loading">
    <div class="section-title">基本信息</div>
    <el-form ref="formRef" :model="formData" label-width="120px" disabled>
      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="举报类型" prop="reportTypeId">
            <dict-tag :options="report_type_id" :value="formData.reportTypeId" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="举报编号:" prop="reportCode">
            <!-- <el-input v-model="formData.reportCode" clearable /> -->
            {{ formData.reportCode }}
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="举报时间:" prop="createTime">
            <!-- <el-input v-model="formData.createTime" clearable /> -->
            {{ formData.createTime }}
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="案件编号:" prop="caseCode">
            <!-- <el-input v-model="formData.caseCode" clearable /> -->
            {{ formData.caseCode }}
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="举报描述" prop="reportDescription">
            <!-- <el-input v-model="formData.reportDescription" clearable /> -->
            {{ formData.reportDescription }}
          </el-form-item>
        </el-col>
      </el-row>
      <div class="section-title">所属状态:{{ statusText }}</div>
      <el-steps :space="200" :active="Number(formData.status)" finish-status="success">
        <el-step title="待处理">
          <template #description>
            <div v-if="hnReportHistoryList && hnReportHistoryList.find((item) => item.status === '0')">
              {{ hnReportHistoryList.find((item) => item.status === '0').time }}
            </div>
          </template>
        </el-step>

        <el-step
          v-if="(Number(formData.status) >= 1 && Number(formData.status) <= 3) || (Number(formData.status) === 4 && formData.caseCode)"
          title="处理中"
        >
          <template #description>
            <div v-if="hnReportHistoryList && hnReportHistoryList.find((item) => item.status === '1')">
              {{ hnReportHistoryList.find((item) => item.status === '1').time }}
            </div>
          </template>
        </el-step>

        <el-step v-if="Number(formData.status) === 2" title="已驳回">
          <template #description>
            <div v-if="hnReportHistoryList && hnReportHistoryList.find((item) => item.status === '2')">
              {{ hnReportHistoryList.find((item) => item.status === '2').time }}
            </div>
          </template>
        </el-step>

        <el-step v-if="Number(formData.status) === 3" title="已结案">
          <template #description>
            <div v-if="hnReportHistoryList && hnReportHistoryList.find((item) => item.status === '3')">
              {{ hnReportHistoryList.find((item) => item.status === '3').time }}
            </div>
          </template>
        </el-step>

        <el-step v-if="Number(formData.status) === 4" title="已撤回">
          <template #description>
            <div v-if="hnReportHistoryList && hnReportHistoryList.find((item) => item.status === '4')">
              {{ hnReportHistoryList.find((item) => item.status === '4').time }}
            </div>
          </template>
        </el-step>
      </el-steps>
    </el-form>
    <div class="section-title">案件类型</div>
    <el-table :data="casetableData" border v-loading="loading" style="table-layout: fixed">
      <!-- 案件类型编号 -->
      <el-table-column label="案件类型编号" align="center" prop="caseCode">
        <template #default="scope">
          <span>{{ scope.row.caseCode }}</span>
        </template>
      </el-table-column>
      <!-- 案件类型名称 -->
      <el-table-column label="案件类型名称" align="center" prop="caseTypeId">
        <template v-slot="scope">
          <dict-text :options="case_type" :value="scope.row.caseTypeId || ''" />
        </template>
      </el-table-column>

      <!-- 执法依据 -->
      <el-table-column label="执法依据" align="center">
        <template #default="scope">
          <el-link
            v-if="scope.row.newBasisFile && scope.row.newBasisFile.ossInfo && scope.row.newBasisFile.ossInfo.url"
            :href="scope.row.newBasisFile.ossInfo.url"
            target="_blank"
            type="primary"
            :underline="true"
            @click.stop
          >
            <span>{{ scope.row.newBasisFile.ossInfo.originalName }}</span>
          </el-link>
        </template>
      </el-table-column>

      <!-- 执法文书模板 -->
      <el-table-column label="执法文书模板" align="center" prop="collectCount">
        <template #default="scope">
          <el-link
            v-if="scope.row.newDocumentFile && scope.row.newDocumentFile.ossInfo && scope.row.newDocumentFile.ossInfo.url"
            :href="scope.row.newDocumentFile.ossInfo.url"
            target="_blank"
            type="primary"
            :underline="true"
            @click.stop
          >
            <span>{{ scope.row.newDocumentFile.ossInfo.originalName }}</span>
          </el-link>
        </template>
      </el-table-column>
    </el-table>

    <div class="section-title" v-if="Number(formData.status) === 2 || Number(formData.status) === 3">申诉时间:{{ formData.appealTime }}</div>
    <el-row :gutter="20" class="detail-form">
      <el-col :span="24" v-if="Number(formData.status) === 2">
        <el-form-item label="申诉驳回原因：">
          <el-input v-model="formData.backAppealReason" type="textarea" :rows="4" disabled autosize />
        </el-form-item>
      </el-col>
    </el-row>
    <div v-if="Number(formData.status) === 2 || Number(formData.status) === 3">
      <FormHeader title="历史申诉材料" />
      <el-table :data="formData.historyAppealList || []" border>
        <el-table-column type="index" min-width="55" label="序号" align="center" />
        <el-table-column prop="createTime" label="申诉时间" align="center"></el-table-column>
        <el-table-column label="操作" align="center">
          <template #default="scope">
            <el-button v-throttle text type="primary" @click="handlePreview(scope.row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="section-title" v-if="Number(formData.status) === 2 || Number(formData.status) === 1 || Number(formData.status) === 3">申诉材料</div>
    <!-- 附件上传区域 -->
    <div class="attachment-section" v-if="Number(formData.status) === 2 || Number(formData.status) === 1 || Number(formData.status) === 3">
      <el-upload
        v-if="props.type === 'appeal'"
        action="#"
        :auto-upload="false"
        accept=".png,.jpg,.MP4,.jpeg,.mov,.avi"
        :show-file-list="false"
        :before-upload="beforeUpload"
        :on-change="handleFileChange"
      >
        <el-button type="primary" plain>
          <el-icon class="el-icon--left">
            <Upload />
          </el-icon>
          添加附件
        </el-button>
        <template #tip>
          <div class="upload-tip">
            支持格式：图片(png/jpg/jpeg),视频(MP4,mov,avi),图片限制大小10MB,视频限制大小200MB
            <br />限制：最多6张图片，3个视频 <br />当前：{{ currentImageCount }}/6 张图片，{{ currentVideoCount }}/3 个视频
          </div>
        </template>
      </el-upload>
      <!-- 重新上传的隐藏输入框 -->
      <input ref="reuploadInputRef" type="file" :accept="acceptTypes" style="display: none" @change="handleReuploadChange" />
      <!-- 附件列表 -->
      <el-table v-if="attachmentList.length > 0" :data="attachmentList" stripe class="attachment-table">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="fileName" label="附件名称" align="left" :show-overflow-tooltip="true" />
        <el-table-column prop="fileSuffix" label="附件类型" align="left" :show-overflow-tooltip="true" />
        <el-table-column prop="fileSize" label="文件大小" align="center" />
        <el-table-column label="操作" width="200" align="center">
          <template #default="scope">
            <el-button type="primary" link @click="handleAgainFile(scope.row, scope.$index)">
              <el-icon>
                <Upload />
              </el-icon>
              重新上传
            </el-button>
            <el-button type="danger" link @click="handleRemoveFile(scope.row)">
              <el-icon>
                <Delete />
              </el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="section-title" v-if="Number(formData.status) === 2 || Number(formData.status) === 1">申诉理由</div>
    <div v-if="Number(formData.status) === 2 || Number(formData.status) === 1">
      <el-input type="textarea" maxlength="200" show-word-limit :rows="2" placeholder="请输入申诉理由" v-model="presentarguments"> </el-input>
    </div>
    <div class="form-actions">
      <el-button type="primary" @click="handleSubmit" :loading="saving">提交 </el-button>
      <el-button @click="emitCancel">取消</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance, toRefs, watch, computed } from 'vue';
import type { ComponentInternalInstance } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Upload, View, Delete, Document, Plus } from '@element-plus/icons-vue';
import { getcourseCultivatequeryDetail, courseCultivateadd, courseCultivateupdate, courseAppeal } from '@/api/system/courseCultivate';
import { getreportdetail, reportback, reportappeal } from '@/api/rightsPlatform/customerreport';
import { ossUploadImage } from '@/api/expertServicePlatform/knowledgeBaseManage/index';
import { getReportCaseFilingDetail, getlookDetail, FormData, FileViewItem } from '@/api/rightsPlatform/achiveManagement/credit/violationRecords';

const props = defineProps<{
  id?: string | number | null;
  type: 'appeal' | 'view';
  status: '';
}>();

const emit = defineEmits<{
  (e: 'success'): void;
  (e: 'cancel'): void;
}>();
const tocSidebarRef = ref();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const casetableData = ref([]); //案件类型list
const hnReportHistoryList = ref([]); //案件类型list
const count = ref(0);
// 使用字典数据
const { report_status, report_type_id, case_type } = toRefs<any>((proxy as any)?.useDict('report_status', 'report_type_id', 'case_type'));
/* 申述理由 */
const presentarguments = ref();
// 表单引用
const formRef = ref();
// 保存状态
const saving = ref(false);
// 加载状态
const loading = ref(false);
/* 缩略图弹窗 */
const dialogVisible = ref(false);
/* 查看上传图片的url */
const dialogImageUrl = ref('');
// 表单数据
const formData = ref({
  id: undefined as number | undefined,
  reportTypeId: null, //举报类别
  reportCode: '', //举报编号
  createTime: '', //举报时间
  caseCode: '', //案件编号
  reportDescription: '', //举报描述
  backAppealReason: '',
  historyAppealList: [],
  appealTime: '',
  status: '' //订单状态
});
const reuploadIndex = ref(-1); // 记录当前重新上传的索引
/* 主图图片 */
const fileList = ref([]);
// 附件列表
const attachmentList = ref<
  Array<{
    ossId?: number;
    fileName: string;
    originalName: string;
    fileSuffix: string;
    url: string;
    fileSize?: string;
    uid?: string;
  }>
>([]);
const reuploadInputRef = ref<HTMLInputElement>(); // 重新上传的input引用
const currentReuploadIndex = ref<number>(-1); // 当前重新上传的附件索引
const acceptTypes = '.png,.jpg,.mp4,.mov,.avi,.pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.txt';
// 文章目录列表
const tocList = ref<
  Array<{
    id: string;
    text: string;
    tag: string;
    level: number;
  }>
>([]);
// 计算状态文本
const statusText = computed(() => {
  const statusMap: Record<string, string> = {
    '0': '待处理',
    '1': '处理中',
    '2': '已驳回',
    '3': '已结案',
    '4': '已撤回'
  };
  return statusMap[props.status] || '未知状态';
});
// 添加这两个计算属性用于附件计数显示
const currentImageCount = computed(() => {
  return attachmentList.value.filter((item) => {
    // 同时检查文件后缀和MIME类型
    const suffix = (item.fileSuffix || '').toLowerCase();
    const isImageSuffix = ['.jpg', '.jpeg', '.png'].includes(suffix);

    // 检查MIME类型
    const mimeType = (item.fileSuffix || '').toLowerCase();
    const isImageMime = mimeType.startsWith('image/') && ['image/jpeg', 'image/png', 'image/jpg'].includes(mimeType);

    return isImageSuffix || isImageMime;
  }).length;
});

const currentVideoCount = computed(() => {
  return attachmentList.value.filter((item) => {
    // 同时检查文件后缀和MIME类型
    const suffix = (item.fileSuffix || '').toLowerCase();
    const isVideoSuffix = ['.mp4', '.mov', '.avi'].includes(suffix);

    // 检查MIME类型
    const mimeType = (item.fileSuffix || '').toLowerCase();
    const isVideoMime = mimeType.startsWith('video/') && ['video/mp4', 'video/quicktime', 'video/x-msvideo'].includes(mimeType);

    return isVideoSuffix || isVideoMime;
  }).length;
});
/** 获取内容详情 */
const fetchContentDetail = async () => {
  if (!props.id) return;

  loading.value = true;
  try {
    const response: any = await getreportdetail(props.id);
    console.log('response', response);

    if (response && response.code === 200) {
      const data = response.data;

      if (!data) {
        ElMessage.error('获取内容详情失败：数据为空');
        return;
      }

      // 将接口返回的数据赋值给表单
      formData.value = {
        id: data.id,
        reportTypeId: data.reportTypeId || '',
        reportCode: data.reportCode || '',
        createTime: data.createTime || '',
        caseCode: data.caseCode || '',
        reportDescription: data.reportDescription || '',
        backAppealReason: data.backAppealReason || '',
        historyAppealList: data.historyAppealList || [],
        appealTime: data.appealTime || '',
        status: data.status || ''
      };
      casetableData.value = data.reportCaseFiling || [];
      hnReportHistoryList.value = data.statusAndDate || [];
      presentarguments.value = data.appealReason;
      // 加载附件数据
      if (data.ossVoList && Array.isArray(data.ossVoList) && data.ossVoList.length > 0) {
        attachmentList.value = data.ossVoList.map((item: any) => {
          let fileSize = '--';

          // 解析 ext1 字段获取文件大小
          if (item.ext1) {
            try {
              const ext1Obj = JSON.parse(item.ext1);
              if (ext1Obj.fileSize) {
                fileSize = formatFileSize(ext1Obj.fileSize);
              }
            } catch (error) {
              console.error('解析 ext1 失败:', error);
              // 如果解析失败，可以尝试从其他字段获取或保持默认值
            }
          }

          return {
            ossId: item.ossId,
            fileName: item.fileName || item.originalName,
            originalName: item.originalName || item.fileName,
            fileSuffix: item.fileSuffix,
            url: item.url,
            fileSize: fileSize
          };
        });
      } else {
        attachmentList.value = [];
      }
    } else {
      ElMessage.error(response?.msg || '获取内容详情失败');
    }
  } catch (error) {
    console.error('获取内容详情失败:', error);
    ElMessage.error('获取内容详情失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};
let appealDialogVisible = ref(false);
let appealDialogLoading = ref(false);
let appealDetail = reactive<any>({});
const histAppealImageList = ref();
const histAppealImagePreviewUrls = ref();
const histAppealVideoList = ref();
// 工具方法：安全数组
const safeArray = (arr: any) => (Array.isArray(arr) ? arr : []);
// 工具方法：判断是否为视频文件
const isVideoFile = (item: any): boolean => {
  // 优先使用 fileType 字段判断
  const fileType = String(item?.fileType || item?.ossInfo?.fileType || '');
  if (fileType === '1') {
    return true;
  }
  // 如果 fileType 不存在或不是 '1'，则根据文件扩展名判断
  const url = item?.ossInfo?.url || item?.url || '';
  const originalName = item?.ossInfo?.originalName || item?.originalName || '';
  const fileName = originalName || url;
  if (!fileName) return false;
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  const videoExts = ['mp4', 'mov', 'avi', 'wmv', 'flv', 'mkv', 'webm', 'm4v'];
  return videoExts.includes(ext);
};
// 工具方法：字节大小转可读文本
const formatByteSize = (bytes?: number) => {
  const n = Number(bytes);
  if (!isFinite(n) || n <= 0) return '';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0,
    v = n;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  const fixed = v < 10 && i > 0 ? 1 : 0;
  return `${v.toFixed(fixed)}${units[i]}`;
};
// 工具方法：按 url 去重
const uniqueByUrl = <T extends { url?: string }>(list: T[]): T[] => {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const it of list) {
    const u = it?.url;
    if (!u || seen.has(u)) continue;
    seen.add(u);
    out.push(it);
  }
  return out;
};

// 工具方法：拆分图片/视频并格式化
const splitFiles = (files: any[]) => {
  const images: FileViewItem[] = [];
  const videos: FileViewItem[] = [];
  safeArray(files).forEach((item: any) => {
    const info = item?.ossInfo ?? {};
    const base = {
      url: info?.url,
      ossId: info?.ossId,
      originalName: info?.originalName,
      name: info?.originalName
    } as FileViewItem;
    if (!base.url) return;
    if (isVideoFile(item)) {
      const size = Number(info?.fileSize || item?.fileSize || 0);
      videos.push({ ...base, sizeText: formatByteSize(size) });
    } else {
      images.push(base);
    }
  });
  return {
    images: uniqueByUrl(images),
    videos: uniqueByUrl(videos)
  };
};
const buildPreviewUrls = (imgs: FileViewItem[]) => imgs.map((i) => i.url!);
// 获取历史申诉详情  打开弹窗
const handlePreview = async (row: any) => {
  // 避免重复打开导致多个实例/遮罩叠加
  if (appealDialogVisible.value) return;
  const id = row?.id;
  appealDialogLoading.value = true;
  try {
    // 等接口切换后，获取违规记录详情
    const res = await getlookDetail(String(id)); //获取违规记录详情
    const data: any = res?.data ?? {};
    console.log('历史申诉详情数据:', data);

    // 文本信息
    appealDetail.appealReason = data.appealReason ?? '';
    appealDetail.appealTime = data.appealTime ?? '';
    appealDetail.backReason = data.backReason ?? '';

    // 附件信息（兼容多种字段命名）
    const files =
      safeArray(data.appealFiles) ||
      safeArray(data?.newAppealFile?.appealFiles) ||
      safeArray(data.files) ||
      safeArray(row?.appealFiles) ||
      safeArray(row?.files);

    const s = splitFiles(files);
    histAppealImageList.value = s.images;
    histAppealImagePreviewUrls.value = buildPreviewUrls(s.images);
    histAppealVideoList.value = s.videos;
  } catch (e) {
    console.error('获取申诉详情失败:', e);
    histAppealImageList.value = [];
    histAppealImagePreviewUrls.value = [];
    histAppealVideoList.value = [];
    appealDetail.value.appealReason = '';
    appealDetail.value.appealTime = '';
    appealDetail.value.backReason = '';
  } finally {
    appealDialogLoading.value = false;
  }
  appealDialogVisible.value = true;
};
const load = () => {
  count.value += 2;
};
/** 提交表单 */
const handleSubmit = async () => {
  if (!formRef.value) return;
  // 添加校验逻辑
  if (!presentarguments.value || presentarguments.value.trim() === '') {
    ElMessage.warning('请输入申述理由');
    return;
  }

  if (!attachmentList.value || attachmentList.value.length === 0) {
    ElMessage.warning('请上传申述材料');
    return;
  }

  try {
    saving.value = true;
    const submitData = {
      id: formData.value.id,
      appealReason: presentarguments.value,
      ossList: attachmentList.value.map((item) => ({
        ossId: item.ossId,
        fileName: item.fileName,
        originalName: item.originalName,
        fileSuffix: item.fileSuffix,
        url: item.url
      }))
    };
    console.log('submitData提交的数据', submitData);

    // 调用对应的接口
    const api = props.type === 'appeal' ? courseAppeal : courseCultivateupdate;
    const response: any = await api(submitData);

    if (response && response.code === 200) {
      ElMessage.success('操作成功');
      emit('success');
    } else {
      ElMessage.error(response?.msg || '操作失败，请稍后重试');
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('操作失败:', error);
      ElMessage.error('操作失败，请稍后重试');
    }
  } finally {
    saving.value = false;
  }
};
/** 取消 */
const emitCancel = () => {
  emit('cancel');
};

/** 文件大小格式化 */
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/** 文件验证 */
const validateFile = (file: File): boolean => {
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  const imageExt = ['jpg', 'png', 'jpeg'];
  const videoExt = ['mp4', 'mov', 'avi'];
  const allExt = [...imageExt, ...videoExt];

  if (!allExt.includes(ext)) {
    ElMessage.error(`不支持 ${ext.toUpperCase()} 格式的文件`);
    return false;
  }

  const MB = 1024 * 1024;
  let limit: number;
  let typeName: string;

  // 根据文件类型设置不同的限制
  if (imageExt.includes(ext)) {
    limit = 10 * MB; // 图片限制10MB
    typeName = '图片';
  } else if (videoExt.includes(ext)) {
    limit = 200 * MB; // 视频限制500MB
    typeName = '视频';
  } else {
    limit = 100 * MB; // 文档限制100MB
    typeName = '文档';
  }

  // 检查文件大小
  if (file.size > limit) {
    const actualSize = (file.size / MB).toFixed(2);
    const maxSize = limit / MB;
    ElMessage.error(`${typeName}文件大小 ${actualSize}MB 超过限制，最大${maxSize}MB`);
    return false;
  }

  return true;
};
/* 主图验证 */
const valiImgFile = (file: File): boolean => {
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  const imageExt = ['jpg', 'gif', 'png'];
  const allExt = [...imageExt];

  if (!allExt.includes(ext)) {
    ElMessage.error(`不支持 ${ext.toUpperCase()} 格式的文件`);
    return false;
  }

  const MB = 1024 * 1024;
  const limit = imageExt.includes(ext) ? 10 * MB : 100 * MB;
  if (file.size > limit) {
    ElMessage.error(imageExt.includes(ext) ? '图片文件最大10MB' : '文档文件最大100MB');
    return false;
  }

  return true;
};
/** 上传前检查文件数量限制 */
const beforeUpload = (file: File): boolean => {
  const fileExtension = (file.name.split('.').pop() || '').toLowerCase();
  const fileMimeType = (file.type || '').toLowerCase();

  const isImage = ['jpg', 'jpeg', 'png'].includes(fileExtension) || ['image/jpeg', 'image/png', 'image/jpg'].includes(fileMimeType);

  const isVideo = ['mp4', 'mov', 'avi'].includes(fileExtension) || ['video/mp4', 'video/quicktime', 'video/x-msvideo'].includes(fileMimeType);

  if (isImage && currentImageCount.value >= 6) {
    ElMessage.warning('最多只能上传6张图片');
    return false;
  }

  if (isVideo && currentVideoCount.value >= 3) {
    ElMessage.warning('最多只能上传3个视频');
    return false;
  }

  return true;
};

/** 处理文件上传 */
const handleFileChange = async (file: any) => {
  console.log('正常上传的文件', file);

  // 先验证文件数量限制
  const fileExtension = (file.name.split('.').pop() || '').toLowerCase();
  const fileMimeType = (file.raw.type || '').toLowerCase();

  const isImage = ['jpg', 'jpeg', 'png'].includes(fileExtension) || ['image/jpeg', 'image/png', 'image/jpg'].includes(fileMimeType);

  const isVideo = ['mp4', 'mov', 'avi'].includes(fileExtension) || ['video/mp4', 'video/quicktime', 'video/x-msvideo'].includes(fileMimeType);

  if (isImage && currentImageCount.value >= 6) {
    ElMessage.warning('最多只能上传6张图片');
    return;
  }

  if (isVideo && currentVideoCount.value >= 3) {
    ElMessage.warning('最多只能上传3个视频');
    return;
  }

  if (!validateFile(file.raw)) return;

  (proxy as any)?.$modal?.loading('正在上传附件，请稍候...');

  try {
    const response = await ossUploadImage({ file: file.raw });

    if (response.code === 200 && response.data?.ossId) {
      attachmentList.value.push({
        ossId: response.data.ossId,
        fileName: response.data.fileName,
        originalName: file.raw.name,
        fileSuffix: file.raw.type,
        url: response.data.url,
        fileSize: formatFileSize(file.raw.size),
        uid: file.uid
      });
      ElMessage.success('附件上传成功');
    } else {
      ElMessage.error(response?.msg || '上传失败，请重试');
    }
  } catch (error) {
    console.error('附件上传失败:', error);
    ElMessage.error('上传失败，请重试');
  } finally {
    (proxy as any)?.$modal?.closeLoading();
  }
};
/* 处理超出限制 */
const handleExceed = (files: any, fileList: any) => {
  // 先清空现有文件
  console.log('替换files', files);

  const wrappedFile = {
    name: files[0].name,
    raw: files[0]
  };
  fileList.value = [];
  // 手动触发新文件的上传
  handleImgFileChange(wrappedFile);
};
/* 主图上传 */
const handleImgFileChange = async (file: any) => {
  console.log('file', file);

  if (!valiImgFile(file.raw)) return;

  (proxy as any)?.$modal?.loading('正在上传附件，请稍候...');

  try {
    const response = await ossUploadImage({ file: file.raw });
    console.log('response', response);

    // 直接替换而不是追加
    fileList.value = [
      {
        name: response.data.fileName,
        url: response.data.url,
        ossId: response.data.ossId,
        uid: file.uid
      }
    ];
  } catch (error) {
    console.error('附件上传失败:', error);
    ElMessage.error('上传失败，请重试');
  } finally {
    (proxy as any)?.$modal?.closeLoading();
  }
};
/* 主图删除的回调 */
const handleRemove = () => {
  fileList.value = [];
};
/** 重新上传 */
const handleAgainFile = async (file: any, index: number) => {
  console.log('重新上传文件:', file);
  console.log('索引:', index);

  // 记录当前重新上传的索引
  currentReuploadIndex.value = index;

  // 触发隐藏的文件输入框点击
  if (reuploadInputRef.value) {
    reuploadInputRef.value.click();
  }
};
/** 处理重新上传文件选择 */
const handleReuploadChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  console.log('target.files', target.files);

  if (!files || files.length === 0) {
    return;
  }

  const file = files[0];
  // 对于重新上传，我们需要特殊处理数量限制检查
  // 先获取原文件的类型（如果是重新上传的话）
  if (currentReuploadIndex.value >= 0) {
    const oldFile = attachmentList.value[currentReuploadIndex.value];
    const oldFileSuffix = (oldFile.fileSuffix || '').toLowerCase();
    const newFileExtension = (file.name.split('.').pop() || '').toLowerCase();

    const oldIsImage = ['.jpg', '.jpeg', '.png'].includes(oldFileSuffix);
    const oldIsVideo = ['.mp4', '.mov', '.avi'].includes(oldFileSuffix);
    const newIsImage = ['jpg', 'jpeg', 'png'].includes(newFileExtension);
    const newIsVideo = ['mp4', 'mov', 'avi'].includes(newFileExtension);

    // 如果原来是图片，现在要替换成视频，需要检查视频数量限制
    if (oldIsImage && newIsVideo && currentVideoCount.value >= 3) {
      ElMessage.warning('最多只能上传3个视频');
      target.value = '';
      return;
    }

    // 如果原来是视频，现在要替换成图片，需要检查图片数量限制
    if (oldIsVideo && newIsImage && currentImageCount.value >= 6) {
      ElMessage.warning('最多只能上传6张图片');
      target.value = '';
      return;
    }
  } else {
    // 这里是新增上传的情况
    const fileExtension = (file.name.split('.').pop() || '').toLowerCase();
    const isImage = ['jpg', 'jpeg', 'png'].includes(fileExtension);
    const isVideo = ['mp4', 'mov', 'avi'].includes(fileExtension);

    if (isImage && currentImageCount.value >= 6) {
      ElMessage.warning('最多只能上传6张图片');
      target.value = '';
      return;
    }

    if (isVideo && currentVideoCount.value >= 3) {
      ElMessage.warning('最多只能上传3个视频');
      target.value = '';
      return;
    }
  }

  // 验证文件
  if (!validateFile(file)) {
    // 清空input值，允许重新选择
    target.value = '';
    return;
  }

  // 上传文件
  uploadReplacementFile(file);

  // 清空input值，允许重新选择
  target.value = '';
};
/** 上传替换文件 */
const uploadReplacementFile = async (file: File) => {
  console.log('重新上传的文件', file);

  (proxy as any)?.$modal?.loading('正在重新上传附件，请稍候...');

  try {
    const response = await ossUploadImage({ file });

    if (response.code === 200 && response.data?.ossId) {
      // 替换指定索引的附件
      if (currentReuploadIndex.value >= 0) {
        attachmentList.value[currentReuploadIndex.value] = {
          ossId: response.data.ossId,
          fileName: response.data.fileName,
          originalName: file.name,
          fileSuffix: file.type,
          url: response.data.url,
          fileSize: formatFileSize(file.size),
          uid: Date.now().toString() // 生成新的uid
        };

        ElMessage.success('附件重新上传成功');
      }
    } else {
      ElMessage.error(response?.msg || '重新上传失败，请重试');
    }
  } catch (error) {
    console.error('附件重新上传失败:', error);
    ElMessage.error('重新上传失败，请重试');
  } finally {
    (proxy as any)?.$modal?.closeLoading();
    // 重置索引
    currentReuploadIndex.value = -1;
  }
};
/** 删除文件 */
const handleRemoveFile = (file: any) => {
  ElMessageBox.confirm('确定要删除该附件吗？', '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      const index = attachmentList.value.findIndex((item) => item.uid === file.uid || item.ossId === file.ossId);
      if (index !== -1) {
        attachmentList.value.splice(index, 1);
        ElMessage.success('附件删除成功');
      }
    })
    .catch(() => {
      // 用户取消删除
    });
};
/* 查看图片 */
const handlePictureCardPreview = (file) => {
  console.log('file', file);

  dialogImageUrl.value = file.url;
  dialogVisible.value = true;
};

// 页面加载时的处理
onMounted(() => {
  fetchContentDetail();
});
</script>

<style scoped lang="scss">
.section-title {
  position: relative;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  padding: 12px 0 12px 16px;
  margin: 20px 0 16px 0;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 20px;
    background: linear-gradient(135deg, #409eff, #66b1ff);
    border-radius: 2px;
  }
}
// 表单操作按钮
.form-actions {
  display: flex;
  padding-top: 24px;
  border-top: 1px solid #e4e7ed;
  gap: 12px;
  margin-top: 20px;
  justify-content: end;
  align-items: end;

  .el-button {
    min-width: 100px;
  }
}

// 附件上传区域
.attachment-section {
  margin: 32px 0;
  padding: 20px;
  background-color: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e4e7ed;

  .attachment-title {
    font-size: 16px;
    font-weight: 600;
    color: #333333;
    margin-bottom: 16px;
    position: relative;
    padding-left: 12px;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 16px;
      background-color: #409eff;
      border-radius: 2px;
    }
  }

  .upload-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 8px;
    line-height: 1.6;
  }

  .attachment-table {
    margin-top: 20px;

    :deep(.el-button) {
      padding: 4px 8px;

      .el-icon {
        margin-right: 4px;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .editor-container {
    flex-direction: column;
  }

  .toc-sidebar {
    width: 100%;
    min-width: 100%;
    max-height: 300px;

    .toc-list {
      max-height: 200px;
    }
  }

  .form-actions {
    .el-button {
      width: 100%;
    }
  }

  .attachment-section {
    .attachment-table {
      :deep(.el-table__body-wrapper) {
        overflow-x: auto;
      }
    }
  }
}

// 中等屏幕优化
@media (min-width: 769px) and (max-width: 1024px) {
  .toc-sidebar {
    width: 200px;
    min-width: 200px;
    padding: 16px;
  }

  .editor-container {
    gap: 16px;
  }
}
</style>
