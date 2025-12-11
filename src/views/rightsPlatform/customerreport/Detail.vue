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
          <el-form-item label="举报编号" prop="reportCode">
            <!-- <el-input v-model="formData.reportCode" clearable /> -->
            {{ formData.reportCode }}
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="举报时间" prop="createTime">
            <!-- <el-input v-model="formData.createTime" clearable /> -->
            {{ formData.createTime }}
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="案件编号" prop="caseCode">
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
      <el-col :span="12">
        <div v-if="formData.enterpriseType == '0'" class="detail-form-title">供应商申诉:</div>
        <div v-else class="detail-form-title">企业申诉:</div>
      </el-col>
      <el-col :span="24">
        <el-form-item label="申诉描述：">
          <el-input v-model="formData.appealReason" type="textarea" :rows="4" disabled autosize />
        </el-form-item>
      </el-col>

      <el-col :span="24">
        <el-form-item label="申诉图片：">
          <div class="evidence">
            <template v-if="histAppealImageList.length">
              <el-image
                v-for="(img, idx) in histAppealImageList"
                :key="img.url + idx"
                :src="img.url"
                :preview-src-list="histAppealImagePreviewUrls"
                :initial-index="idx"
                fit="cover"
                class="evidence-image-item"
              />
            </template>
            <span v-else class="evidence-empty">暂无图片</span>
          </div>
        </el-form-item>
      </el-col>

      <el-col :span="24">
        <el-form-item label="申诉视频：">
          <div class="evidence">
            <template v-if="histAppealVideoList.length">
              <div v-for="(v, idx) in histAppealVideoList" :key="v.url + idx" class="video-card">
                <div class="size">{{ v.sizeText }}</div>
                <div class="icon">视频</div>
                <div class="ops">
                  <el-button type="primary" link @click="downloadAttachment(v.name || 'video_' + (idx + 1), v.url)">下载视频</el-button>
                </div>
              </div>
            </template>
            <span v-else class="evidence-empty">暂无视频</span>
          </div>
        </el-form-item>
      </el-col>
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
            <el-button v-throttle text type="primary" v-hasPermi="['safeguard:report:query']" @click="handlePreview(scope.row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="section-title" v-if="Number(formData.status) === 3 ">平台处理结果:</div>
    <el-row :gutter="20" class="detail-form" v-if="Number(formData.status) === 3 && Number(formData.rejectBack) === 1">
      <el-col :span="24">
        <el-form-item label="信用等级：">
          <!-- <el-input v-model="formData.creditLevel" type="textarea" :rows="4" disabled autosize /> -->
          <dict-text :options="plat_credit_rating" :value="formData.creditLevel" />
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item label="扣分：">
          <!-- <el-input v-model="formData.caseScore" type="textarea" :rows="4" disabled autosize /> -->
          <div style="color: red">{{ -formData.caseScore }}</div>
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item label="评分：">
          <!-- <el-input v-model="formData.creditLevel" type="textarea" :rows="4" disabled autosize /> -->
          {{ formData.sore }}分
        </el-form-item>
      </el-col>
    </el-row>

    <div v-if="Number(formData.rejectBack) === 2"> 平台处理/申诉成功</div>

    <div class="section-title" v-if="Number(formData.status) === 4">举报人撤回原因</div>
    <div class="section-title-che" style="font-size: 18px; margin-left: 15px" v-if="Number(formData.status) === 4">
      {{ formData.withdrawCause }}
    </div>

    <div class="form-actions">
      <el-button @click="emitCancel">返回</el-button>
    </div>
  </div>
  <!-- 历史申诉材料弹窗 -->
  <el-dialog v-model="appealDialogVisible" title="历史申诉材料" width="50%" destroy-on-close append-to-body>
    <div v-loading="appealDialogLoading">
      <el-row :gutter="20" class="detail-form">
        <el-col :span="24">
          <el-form-item label="申诉理由：">
            <el-input v-model="appealDetail.appealReason" type="textarea" :rows="4" disabled autosize />
          </el-form-item>
        </el-col>

        <el-col :span="24">
          <el-form-item label="申诉时间：">
            <el-input v-model="appealDetail.appealTime" type="textarea" :rows="4" disabled autosize />
          </el-form-item>
        </el-col>

        <el-col :span="24">
          <el-form-item label="申诉图片：">
            <div class="evidence">
              <template v-if="histAppealImageList2.length">
                <el-image
                  v-for="(img, idx) in histAppealImageList2"
                  :key="img.url + idx"
                  :src="img.url"
                  :preview-src-list="histAppealImagePreviewUrls2"
                  :initial-index="idx"
                  fit="cover"
                  class="evidence-image-item"
                />
              </template>
              <span v-else class="evidence-empty">暂无图片</span>
            </div>
          </el-form-item>
        </el-col>

        <el-col :span="24">
          <el-form-item label="申诉视频：">
            <div class="evidence">
              <template v-if="histAppealVideoList2.length">
                <div v-for="(v, idx) in histAppealVideoList2" :key="v.url + idx" class="video-card">
                  <div class="size">{{ v.sizeText }}</div>
                  <div class="icon">视频</div>
                  <div class="ops">
                    <el-button type="primary" link @click="downloadAttachment(v.name || 'video_' + (idx + 1), v.url)">下载视频</el-button>
                  </div>
                </div>
              </template>
              <span v-else class="evidence-empty">暂无视频</span>
            </div>
          </el-form-item>
        </el-col>

        <el-col :span="24">
          <el-form-item label="平台驳回申诉理由：">
            <el-input v-model="appealDetail.backReason" type="textarea" :rows="4" disabled autosize />
          </el-form-item>
        </el-col>
      </el-row>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance, toRefs, watch, computed } from 'vue';
import type { ComponentInternalInstance } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Upload, View, Delete, Document, Plus } from '@element-plus/icons-vue';
import { getcourseCultivatequeryDetail, courseCultivateadd, courseCultivateupdate } from '@/api/system/courseCultivate';
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
const withdrawCause = ref(''); //原因
const count = ref(0);
const histAppealImagePreviewUrls = ref<string[]>([]); // 历史申诉图片预览 URL 列表
const buildPreviewUrls = (imgs: FileViewItem[]) => imgs.map((i) => i.url!);

// 使用字典数据
const { report_status, report_type_id, case_type, plat_credit_rating } = toRefs<any>(
  (proxy as any)?.useDict('report_status', 'report_type_id', 'case_type', 'plat_credit_rating')
);
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
  withdrawCause:'',
  rejectBack:'',
  status: '', //订单状态
  appealTime: '', //申诉时间
  enterpriseType: '', //0供应商 1企业
  appealReason: '', //申诉描述
  NewAppealFile: '', //申诉材料
  backAppealReason: '', //申诉驳回原因
  historyAppealList: [], //历史申诉材料
  caseScore: undefined, //扣分
  sore: undefined, //信用分
  creditLevel: '' //信用等级
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
    if (String(item?.fileType) === '1') {
      const size = Number(info?.fileSize);
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
/**
 * 附件下载
 * @param fileName 保存文件名
 * @param url 对象存储直链
 */
const downloadAttachment = async (fileName: string, url?: string) => {
  try {
    if (!url) {
      console.warn('下载地址为空');
      return;
    }
    const response = await fetch(url);
    if (!response.ok) throw new Error(`下载失败: ${response.status}`);
    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error('下载失败', error);
  }
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
const safeArray = (arr: any) => (Array.isArray(arr) ? arr : []);
const histAppealImageList = ref<FileViewItem[]>([]); // 历史申诉图片列表
// const histAppealImagePreviewUrls = ref<string[]>([]); // 历史申诉图片预览 URL 列表
const histAppealVideoList = ref<FileViewItem[]>([]); // 历史申诉视频列表

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
      const files =
        safeArray(data.appealFiles) ||
        safeArray(data?.newAppealFile?.appealFiles) ||
        safeArray(data.files) ||
        safeArray(data?.appealFiles) ||
        safeArray(data?.files);

      const s = splitFiles(files);
      histAppealImageList.value = s.images;
      histAppealImagePreviewUrls.value = buildPreviewUrls(s.images);
      histAppealVideoList.value = s.videos;

      // 将接口返回的数据赋值给表单
      formData.value = {
        id: data.id,
        reportTypeId: data.reportTypeId || '',
        reportCode: data.reportCode || '',
        createTime: data.createTime || '',
        caseCode: data.caseCode || '',
        reportDescription: data.reportDescription || '',
        withdrawCause: data.withdrawCause || '',
        rejectBack: data.rejectBack || '',
        status: data.status || '',
        appealTime: data.appealTime || '',
        enterpriseType: data.enterpriseType || '', //0供应商 1企业
        appealReason: data.appealReason || '', //申诉描述
        NewAppealFile: data.NewAppealFile || '', //申诉材料
        backAppealReason: data.backAppealReason || '', //申诉驳回原因
        historyAppealList: data.historyAppealList || [], //历史申诉材料
        caseScore: data.caseScore || undefined, //扣分
        sore: data.sore || undefined, //信用分
        creditLevel: data.creditLevel || '' //信用等级
      };
      withdrawCause.value = data.withdrawCause;
      hnReportHistoryList.value = data.statusAndDate || [];
      casetableData.value = data.reportCaseFiling || [];
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
const load = () => {
  count.value += 2;
};
/** 提交表单 */
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    saving.value = true;
    const submitData = {
      id: formData.value.id,
      reportTypeId: formData.value.reportTypeId,
      reportCode: formData.value.reportCode,
      createTime: formData.value.createTime,
      caseCode: formData.value.caseCode,
      reportDescription: formData.value.reportDescription,
 
      status: formData.value.status,
      withdrawCause: formData.value.withdrawCause,
      rejectBack: formData.value.rejectBack
    };
    console.log('submitData提交的数据', submitData);
    return;
    // 调用对应的接口
    const api = props.type === 'add' ? courseCultivateadd : courseCultivateupdate;
    const response: any = await api(submitData);

    if (response && response.code === 200) {
      ElMessage.success(props.type === 'add' ? '培训课程发布成功' : '培训课程修改成功');
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
let appealDialogVisible = ref(false);
let appealDialogLoading = ref(false);
let appealDetail = reactive<any>({});
const histAppealImageList2 = ref();
const histAppealImagePreviewUrls2 = ref();
const histAppealVideoList2 = ref();
// 获取历史申诉详情  打开弹窗
const handlePreview = async (row: any) => {
  // 避免重复打开导致多个实例/遮罩叠加
  if (appealDialogVisible.value) return;
  const id = row?.id;
  appealDialogLoading.value = true;
  try {
    // 等接口切换后，获取违规记录详情
    // const res = await getlookDetail(String(id)); //获取违规记录详情
    // const data: any = res?.data ?? {};
    const data = row;
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
    histAppealImageList2.value = s.images;
    histAppealImagePreviewUrls2.value = buildPreviewUrls(s.images);
    histAppealVideoList2.value = s.videos;
  } catch (e) {
    console.error('获取申诉详情失败:', e);
    histAppealImageList2.value = [];
    histAppealImagePreviewUrls2.value = [];
    histAppealVideoList2.value = [];
    appealDetail.value.appealReason = '';
    appealDetail.value.appealTime = '';
    appealDetail.value.backReason = '';
  } finally {
    appealDialogLoading.value = false;
  }
  appealDialogVisible.value = true;
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

/** 处理文件上传 */
const handleFileChange = async (file: any) => {
  console.log('正常上传的文件', file);

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
  console.log('4515545451');
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
.evidence {
  display: flex;
  flex-wrap: nowrap;
  gap: 16px;
  width: 100%;
}
.evidence-image-item {
  flex: 0 0 calc((100% - 80px) / 6);
  aspect-ratio: 4 / 3;
  border: 2px solid #d7d7d7;
  border-radius: 4px;
  overflow: hidden;
  background: #f6f6f6;
}
.evidence-empty {
  color: #909399;
  font-size: 13px;
}
.detail-form-title {
  font-size: 17px;
  font-weight: 600;
  padding-bottom: 10px;
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
.video-card {
  position: relative;
  width: 160px;
  height: 120px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: #fafafa;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.video-card .size {
  position: absolute;
  top: 6px;
  right: 8px;
  font-size: 12px;
  color: #909399;
}
.video-card .icon {
  font-size: 18px;
  color: #1989fa;
  margin-bottom: 8px;
}
.video-card .ops {
  position: absolute;
  bottom: 6px;
}
</style>
