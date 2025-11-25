<!--
  标题: EditDetails.vue
  功能: 违规记录详情页
  说明: 用于违规记录详情查看
  当前版本: 1.0
  开发信息: Created by 刘景彪 2025-11-13
-->
<template>
  <div class="supplier-edit-details">
    <el-form :model="formData">
      <FormHeader title="案件信息" />
      <el-row :gutter="20" class="detail-form">
        <el-col :span="12">
          <el-form-item label="举报类型：">
            <el-select v-model="reportTypeIdComputed" placeholder="请选择举报类型" disabled>
              <el-option v-for="dict in report_type_id" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="案件编号：">
            <el-input v-model="formData.caseCode" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="举报编号：">
            <el-input v-model="formData.reportCode" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="举报人：">
            <el-input v-model="formData.createByName" disabled />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="举报时间：">
            <el-input v-model="formData.createTime" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="被举报人：">
            <span style="color: #108c58" @click="openSupplierDialog">
              {{ formData.reporterName }}
            </span>
          </el-form-item>
        </el-col>
        <!-- 举报商品名称 -> 举报人联系电话 -->
        <el-col :span="12">
          <el-form-item label="举报人联系电话：">
            <el-input v-model="formData.phoneNumber" disabled />
          </el-form-item>
        </el-col>

        <!-- 被举报人用户类型 -> 被举报人联系电话 -->
        <el-col :span="12">
          <el-form-item label="被举报人联系电话：">
            <el-input v-model="formData.contactPhone" disabled />
          </el-form-item>
        </el-col>

        <el-col :span="24">
          <el-form-item label="举报描述：">
            <el-input v-model="formData.reportDescription" type="textarea" :rows="4" disabled autosize />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 举报材料 -->
      <FormHeader title="举报材料" />
      <el-row :gutter="20" class="detail-form">
        <el-col :span="24">
          <el-form-item label="举报图片：">
            <div class="evidence">
              <template v-if="reportImageList.length">
                <el-image
                  v-for="(img, idx) in reportImageList"
                  :key="img.url + idx"
                  :src="img.url"
                  :preview-src-list="reportImagePreviewUrls"
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
          <el-form-item label="举报视频：">
            <div class="evidence">
              <template v-if="reportVideoList.length">
                <div v-for="(v, idx) in reportVideoList" :key="v.url + idx" class="video-card">
                  <div class="size">{{ v.sizeText }}</div>

                  <el-image :key="v.url + idx" :src="v.url" :initial-index="idx" fit="cover" class="evidence-image-item" />
                  <div class="ops">
                    <el-button type="primary" link @click="downloadAttachment(v.name || 'video_' + (idx + 1), v.url)">下载原件</el-button>
                  </div>
                </div>
              </template>
              <span v-else class="evidence-empty">暂无视频</span>
            </div>
          </el-form-item>
        </el-col>
      </el-row>

      <FormHeader title="举报状态" />
      <!-- 保持原先展示 -->
      <template v-if="stepsList.length">
        <el-steps class="custom-steps" finish-status="success" style="margin: 0 100px" :active="stepsList.length">
          <el-step v-for="value in stepsList" :key="value.status" :title="getDictText(case_status, value.status)" :description="value.time" />
        </el-steps>
      </template>
      <template v-else>
        <div class="empty-steps" style="text-align: center; color: #909399; margin: 12px 0">暂无状态进度</div>
      </template>

      <FormHeader title="案件类型" />
      <el-table :data="formData.hnCase ? [formData.hnCase] : []" border>
        <el-table-column prop="caseTypeCode" label="案件类型编号" align="center" />
        <el-table-column prop="caseTypeId" label="案件类型名称" align="center">
          <template v-slot="scope">
            <dict-text :options="case_type" :value="scope.row.caseTypeId ?? ''" />
          </template>
        </el-table-column>
        <el-table-column prop="basisName" label="执法依据" align="center">
          <template v-slot="scope">
            <span
              style="color: #108c58"
              @click="downloadAttachment(scope.row.newBasisFile?.originalName || '', scope.row.newBasisFile?.ossInfo?.url || '')"
            >
              {{ scope.row.newBasisFile?.originalName || '' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="documentName" label="执法文书模板" align="center">
          <template v-slot="scope">
            <span
              style="color: #108c58"
              @click="downloadAttachment(scope.row.newDocumentFile?.originalName || '', scope.row.newDocumentFile?.ossInfo?.url || '')"
            >
              {{ scope.row.newDocumentFile?.originalName || '' }}
            </span>
          </template>
        </el-table-column>
      </el-table>

      <FormHeader title="申诉材料" />
      <el-row :gutter="20" class="detail-form">
        <el-col :span="24">
          <el-form-item label="申诉理由：">
            <el-input v-model="formData.newAppealFile.appealReason" type="textarea" :rows="4" disabled autosize />
          </el-form-item>
        </el-col>

        <el-col :span="24">
          <el-form-item label="申诉时间：">
            <el-input v-model="formData.newAppealFile.appealTime" disabled autosize />
          </el-form-item>
        </el-col>

        <el-col :span="24">
          <el-form-item label="申诉图片：">
            <div class="evidence">
              <template v-if="appealImageList.length">
                <el-image
                  v-for="(img, idx) in appealImageList"
                  :key="img.url + idx"
                  :src="img.url"
                  :preview-src-list="appealImagePreviewUrls"
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
              <template v-if="appealVideoList.length">
                <div v-for="(v, idx) in appealVideoList" :key="v.url + idx" class="video-card">
                  <div class="size">{{ v.sizeText }}</div>
                  <div class="icon">视频</div>
                  <div class="ops">
                    <el-button type="primary" link @click="downloadAttachment(v.name || 'video_' + (idx + 1), v.url)">下载原件</el-button>
                  </div>
                </div>
              </template>
              <span v-else class="evidence-empty">暂无视频</span>
            </div>
          </el-form-item>
        </el-col>

        <el-col :span="24">
          <el-form-item label="平台驳回申诉理由：">
            <el-input v-model="formData.newAppealFile.backAppealReason" type="textarea" :rows="4" disabled autosize />
          </el-form-item>
        </el-col>
      </el-row>
      <!--历史申诉材料  -->
      <div v-if="formData.historyAppealList && formData.historyAppealList.length > 0">
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

      <FormHeader title="处理反馈" />
      <el-row :gutter="20" class="detail-form">
        <el-col :span="24">
          <el-form-item label="供应商名称/企业名称：">
            <el-input v-model="formData.reporterName" disabled autosize />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="案件类型：">
            <el-input v-model="formData.hnCase.caseTypeName" disabled autosize />
            <!-- <dict-text :options="case_type" :value="formData.caseType ?? ''" /> -->
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="扣分分值：">
            <el-input v-model="formData.caseScore" disabled autosize />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="信用等级：">
            <el-select v-model="formData.creditLevel" placeholder="请选择信用等级" filterable clearable :disabled="true">
              <el-option v-for="dict in plat_credit_rating" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="信用分数：">
            <el-input v-model="formData.sore" disabled autosize />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="平台反馈处理结果：">
            <el-input v-model="formData.dealResult" type="textarea" :rows="4" disabled autosize />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 
      <div style="margin-top: 20px; text-align: center">
        <el-button v-throttle type="primary" @click="handleSave">返回</el-button>
      </div> -->

      <div style="height: 20px"></div>
    </el-form>

    <!-- 历史申诉材料弹窗 -->
    <el-dialog v-model="appealDialogVisible" title="历史申诉材料" width="70%" destroy-on-close append-to-body @close="closeAppealDialog">
      <div v-loading="appealDialogLoading">
        <el-row :gutter="20" class="detail-form">
          <el-col :span="24">
            <el-form-item label="申诉理由：">
              <el-input v-model="appealDetail.appealReason" disabled autosize />
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="申诉时间：">
              <el-input v-model="appealDetail.appealTime" disabled autosize />
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
                      <el-button type="primary" link @click="downloadAttachment(v.name || 'video_' + (idx + 1), v.url)">下载原件</el-button>
                    </div>
                  </div>
                </template>
                <span v-else class="evidence-empty">暂无视频</span>
              </div>
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="平台驳回申诉理由：">
              <el-input v-model="appealDetail.backAppealReason" type="textarea" :rows="4" disabled autosize />
            </el-form-item>
          </el-col>
        </el-row>
      </div>
    </el-dialog>

    <!-- 被举报人详情弹窗 -->
    <el-dialog v-model="supplierDialogVisible" title="供应商/企业信息" width="70%" append-to-body destroy-on-close>
      <supplierDetail :id="supplierDialogId" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, getCurrentInstance, toRefs, ComponentInternalInstance } from 'vue';
// 仅保留使用到的 API 与类型
import { getReportCaseFilingDetail, getlookDetail, FormData, FileViewItem } from '@/api/rightsPlatform/achiveManagement/credit/violationRecords';
import FormHeader from '@/components/FormHeader/index.vue';
import supplierDetail from './supplierDetail.vue';
import { string } from 'vue-types';
// 通过 props 接收父组件传参
const props = defineProps<{
  id: string | number;
}>();
// 子组件对外事件
const emit = defineEmits<{
  (e: 'cancel'): void;
}>();

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
// 仅保留使用到的字典项
const { plat_credit_rating, case_type, case_status, report_type_id } = toRefs<any>(
  proxy?.useDict('plat_credit_rating', 'case_type', 'case_status', 'report_type_id')
);

// 详情数据（与后端 HnReportCaseFilingVo 对齐）
const formData = ref<FormData>({
  id: undefined,
  caseCode: '',
  reportCode: '',
  reportDescription: '',
  // 人员信息
  reporterName: '',
  reportPersonId: undefined,
  reportId: undefined,
  reportType: undefined,
  // 状态与时间
  status: '',
  createBy: undefined,
  createByName: '',
  createDept: undefined,
  createTime: '',
  updateBy: undefined,
  updateTime: '',
  closeCaseTime: '',
  tenantId: '',
  // 案件相关
  caseType: '',
  hnCaseId: undefined,
  hnCase: {
    caseTypeName: ''
  },
  caseScore: undefined,
  // 信用相关
  creditLevel: '',
  sore: undefined,
  // 联系方式
  contactName: '',
  contactPhone: '',
  // 申诉/处理
  appealReason: '',
  rejectReason: '',
  dealResult: '',
  handleBack: '',
  rejectBack: '',
  // 历史与材料
  historyAppealList: [],
  newAppealFile: {
    appealReason: '',
    appealTime: '',
    backAppealReason: ''
  },
  reportFiles: [],
  statusAndDate: []
});

// 安全的步骤列表（防止后端未返回 statusAndDate 导致 undefined）
const stepsList = computed(() => {
  const list = (formData.value as any).statusAndDate;
  return Array.isArray(list) ? list : [];
});

const reportImageList = ref<FileViewItem[]>([]); // 举报图片列表
const reportImagePreviewUrls = ref<string[]>([]); // 举报图片预览 URL 列表
const reportVideoList = ref<FileViewItem[]>([]); // 举报视频列表

const appealImageList = ref<FileViewItem[]>([]); // 申诉图片列表
const appealImagePreviewUrls = ref<string[]>([]); // 申诉图片预览 URL 列表
const appealVideoList = ref<FileViewItem[]>([]); // 申诉视频列表

// 弹窗：历史申诉材料
const appealDialogVisible = ref(false);
const appealDialogLoading = ref(false);
const appealDetail = ref<{ appealReason: string; appealTime: string; backAppealReason: string }>({
  appealReason: '',
  appealTime: '',
  backAppealReason: ''
});
const histAppealImageList = ref<FileViewItem[]>([]); // 历史申诉图片列表
const histAppealImagePreviewUrls = ref<string[]>([]); // 历史申诉图片预览 URL 列表
const histAppealVideoList = ref<FileViewItem[]>([]); // 历史申诉视频列表

// 违规记录详情返回（保持原事件名以兼容父组件）
const handleSave = async () => {
  emit('cancel');
};
// 获取违规记录详情
const reportTypeIdComputed = computed(() => {
  return formData.value.reportTypeId ? String(formData.value.reportTypeId) : '';
});

// 新增: 状态字典缓存映射与通用取文本方法
const caseStatusLabelMap = computed(() => {
  const map = new Map<string, string>();
  const arr = Array.isArray(case_status?.value) ? case_status.value : Array.isArray(case_status) ? case_status : [];
  arr.forEach((d: any) => map.set(String(d.value), d.label));
  return map;
});
const getDictText = (dictRef: any, value: any) => {
  if (value === null || value === undefined) return '';
  // 优先使用状态缓存
  if (dictRef === case_status.value || dictRef?.value === case_status?.value) {
    const cached = caseStatusLabelMap.value.get(String(value));
    if (cached) return cached;
  }
  const arr = Array.isArray(dictRef?.value) ? dictRef.value : Array.isArray(dictRef) ? dictRef : [];
  const found = arr.find((d: any) => String(d.value) === String(value));
  return found?.label ?? String(value);
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
    // console.log('历史申诉详情数据:', data);

    // 文本信息
    appealDetail.value.appealReason = data.appealReason ?? '';
    appealDetail.value.appealTime = data.appealTime ?? '';
    appealDetail.value.backAppealReason = data.backAppealReason ?? '';

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
    appealDetail.value.backAppealReason = '';
  } finally {
    appealDialogLoading.value = false;
  }
  appealDialogVisible.value = true;
};

/** 关闭弹窗并重置数据 */
const closeAppealDialog = () => {
  appealDialogVisible.value = false;
  appealDetail.value = { appealReason: '', appealTime: '', backAppealReason: '' };
  histAppealImageList.value = [];
  histAppealImagePreviewUrls.value = [];
  histAppealVideoList.value = [];
};

// 被举报人详情弹窗
const supplierDialogVisible = ref(false);
const supplierDialogId = ref<string | number | undefined>(undefined);
const openSupplierDialog = () => {
  // 若弹窗已开启则直接返回，避免重复创建多个对话框实例
  if (supplierDialogVisible.value) return;
  supplierDialogId.value = formData.value?.reportPersonId || formData.value?.reportId || formData.value?.id;
  supplierDialogVisible.value = true;
};

// 工具方法：安全数组
const safeArray = (arr: any) => (Array.isArray(arr) ? arr : []);

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
 * 获取违规记录详情
 */
const fetchDetail = async () => {
  try {
    const res = await getReportCaseFilingDetail(String(props.id));
    formData.value = res.data;

    // 使用统一方法构建举报材料
    const reportFiles = safeArray(res?.data?.reportFiles);
    const r = splitFiles(reportFiles);
    reportImageList.value = r.images;
    reportImagePreviewUrls.value = buildPreviewUrls(r.images);
    reportVideoList.value = r.videos;

    // 使用统一方法构建申诉材料
    const appealFiles = safeArray(res?.data?.newAppealFile?.appealFiles);
    const a = splitFiles(appealFiles);
    appealImageList.value = a.images;
    appealImagePreviewUrls.value = buildPreviewUrls(a.images);
    appealVideoList.value = a.videos;
  } catch (error) {
    console.error('获取违规记录详情失败:', error);
  }
};

onMounted(fetchDetail);
</script>

<style scoped lang="scss">
.supplier-edit-details {
  padding: 0 24px;
}

// 去掉表单的默认样式
::v-deep .el-input__wrapper {
  box-shadow: none !important;
  background-color: transparent !important;
  cursor: default !important;
  resize: none !important;
}

::v-deep .el-input__inner {
  cursor: default !important;
}

// 去除 el-date-picker 的样式
::v-deep .el-date-editor {
  border: none;
  background-color: transparent;
  pointer-events: none;
  color: #333;
}

.textarea-item {
  ::v-deep .el-textarea__inner {
    box-shadow: none !important;
    background-color: transparent !important;
    cursor: default !important;
    resize: none !important;
  }
}

/* 举报材料容器：单行展示 */
.evidence {
  display: flex;
  flex-wrap: nowrap;
  gap: 16px;
  width: 100%;
}
/* 图片项：等分 6 列，保持 4:3 比例 */
.evidence-image-item {
  flex: 0 0 calc((100% - 80px) / 6);
  aspect-ratio: 4 / 3;
  border: 2px solid #d7d7d7;
  border-radius: 4px;
  overflow: hidden;
  background: #f6f6f6;
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
.evidence-empty {
  color: #909399;
  font-size: 13px;
}

::v-deep .el-step__head.is-success {
  color: #108c58 !important;
}
::v-deep .el-step__title.is-success {
  color: #108c58 !important;
}
::v-deep .el-step__description.is-success {
  color: #108c58 !important;
}
</style>
