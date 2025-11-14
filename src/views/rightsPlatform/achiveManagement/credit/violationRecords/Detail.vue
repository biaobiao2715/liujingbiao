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
            <!-- 使用字典展示举报类型ID（只读） -->
            <dict-tag :options="plat_credit_rating" :value="formData.reportTypeId" />
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
            <el-input v-model="formData.createBy" disabled />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="举报时间：">
            <el-input v-model="formData.createTime" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="被举报人：">
            <el-link type="primary" :underline="false">
              {{ formData.reportPersonName }}
            </el-link>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="被举报人用户类型：">
            <el-input v-model="formData.userType" disabled />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="被举报商品名称：">
            <el-input v-model="formData.reportGoodsName" disabled />
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
      </el-row>

      <FormHeader title="举报状态" />
      <!-- 保持原先展示 -->
      <el-steps finish-status="success" style="margin: 0 100px" :active="2">
        <el-step title="待处理" description="2025-11-13 10:00:00" />
        <el-step title="处理中" description="2025-11-14 10:00:00" />
        <el-step title="已申诉" description="2025-11-15 10:00:00" />
      </el-steps>

      <FormHeader title="案件类型" />
      <el-table :data="formData.folders" border>
        <el-table-column prop="caseTypeCode" label="案件类型编号" align="center"> </el-table-column>
        <el-table-column prop="caseTypeName" label="案件类型名称" align="center">
          <template v-slot="scope">
            <dict-tag :options="plat_credit_rating" :value="scope.row.caseTypeName" />
          </template>
        </el-table-column>
        <el-table-column prop="caseSource" label="案件来源" align="center"></el-table-column>
        <el-table-column prop="enforcementBasis" label="执法依据" align="center"></el-table-column>
        <el-table-column prop="enforcementTemplate" label="执法文书模板" align="center"></el-table-column>
      </el-table>

      <FormHeader title="申诉材料" />
      <el-row :gutter="20" class="detail-form">
        <el-col :span="24">
          <el-form-item label="申诉理由：">
            <el-input v-model="formData.appealReason" type="textarea" :rows="4" disabled autosize />
          </el-form-item>
        </el-col>

        <el-col :span="24">
          <el-form-item label="申诉时间：">
            <el-input v-model="formData.updateTime" type="textarea" :rows="4" disabled autosize />
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
            <el-input v-model="formData.rejectReason" type="textarea" :rows="4" disabled autosize />
          </el-form-item>
        </el-col>
      </el-row>

      <FormHeader title="历史申诉材料" />
      <el-table :data="formData.hnReportHistoryList || []" border>
        <el-table-column type="index" label="序号" align="center" />
        <el-table-column prop="status" label="状态" align="center"></el-table-column>
        <el-table-column prop="reportDescription" label="申诉/说明" align="center"></el-table-column>
        <el-table-column prop="rejectReason" label="驳回原因" align="center"></el-table-column>
        <el-table-column label="操作" align="center">
          <template #default="scope">
            <el-button v-throttle text type="primary" @click="handlePreview(scope.row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>

      <FormHeader title="处理反馈" />
      <el-row :gutter="20" class="detail-form">
        <el-col :span="24">
          <el-form-item label="供应商名称/企业名称：">
            <el-input v-model="formData.reportPersonName" type="textarea" :rows="4" disabled autosize />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="案件类型：">
            <el-select v-model="formData.hnCaseId" placeholder="请选择案件类型" filterable clearable :disabled="true">
              <el-option v-for="dict in plat_credit_rating" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="扣分分值：">
            <el-input v-model="formData.reportGoodsCode" type="textarea" :rows="4" disabled autosize />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="信用等级：">
            <el-select v-model="formData.hnCaseId" placeholder="请选择信用等级" filterable clearable :disabled="true">
              <el-option v-for="dict in plat_credit_rating" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="剩余信用积分：">
            <el-input v-model="formData.reportGoodsName" type="textarea" :rows="4" disabled autosize />
          </el-form-item>
        </el-col>

        <el-col :span="24">
          <el-form-item label="平台反馈处理结果：">
            <el-input v-model="formData.dealResult" type="textarea" :rows="4" disabled autosize />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 操作按钮 -->
      <div style="margin-top: 20px; text-align: center">
        <el-button v-throttle type="primary" @click="handleSave">返回</el-button>
      </div>

      <div style="height: 20px"></div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, getCurrentInstance, toRefs, ComponentInternalInstance } from 'vue';
// 仅保留使用到的 API 与类型
import { baseEnterpriseInfoId, FormData } from '@/api/rightsPlatform/achiveManagement/credit/violationRecords';
import FormHeader from '@/components/FormHeader/index.vue';

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
const { plat_credit_rating } = toRefs<any>(proxy?.useDict('plat_credit_rating'));

// 详情数据（与后端 HnReportVo 对齐）
const formData = ref<FormData>({
  id: undefined,
  caseCode: '',
  reportCode: '',
  reportDescription: '',
  reportGoodsCode: '',
  reportGoodsName: '',
  reportPersonId: undefined,
  reportPersonName: '',
  reportTypeId: undefined,
  status: '',
  createBy: undefined,
  createDept: undefined,
  createTime: '',
  updateBy: undefined,
  updateTime: '',
  hnCaseId: undefined,
  appealReason: '',
  rejectReason: '',
  dealResult: '',
  userType: '',
  hnReportHistoryList: [],
  // 兼容附件字段
  folders: [],
  reportFolders: [],
  appealFolders: []
});

const handlePreview = (row: any) => {
  console.log('预览历史申诉记录:', row);
};

// 违规记录详情返回（保持原事件名以兼容父组件）
const handleSave = async () => {
  emit('cancel');
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

/**
 * 工具：判断是否为图片/视频
 * 优先使用 contentType，回退 URL 后缀或独立后缀(fileSuffix)
 */
const isImage = (u?: string, ct?: string, suffix?: string) => {
  const hasImgCt = /^image\//i.test(ct || '');
  const testUrl = u && /\.(png|jpe?g|gif|bmp|webp|svg)$/i.test(u);
  const testSuffix = suffix && /\.(png|jpe?g|gif|bmp|webp|svg)$/i.test('.' + suffix.replace(/^\./, ''));
  return !!u && (hasImgCt || testUrl || !!testSuffix);
};
const isVideo = (u?: string, ct?: string) => !!u && (/\.(mp4|mov|avi|mkv|webm|m4v)$/i.test(u) || /^video\//i.test(ct || ''));

/**
 * 工具：格式化文件大小
 */
const formatSize = (bytes?: number) => {
  if (!bytes && bytes !== 0) return '未知';
  const kb = 1024,
    mb = kb * 1024,
    gb = mb * 1024;
  if (bytes >= gb) return (bytes / gb).toFixed(0) + 'GB';
  if (bytes >= mb) return (bytes / mb).toFixed(0) + 'MB';
  if (bytes >= kb) return (bytes / kb).toFixed(0) + 'KB';
  return bytes + 'B';
};

/**
 * 兼容不同后端字段的材料分拣
 * 优先取专用字段（如 reportFolders/appealFolders），否则从 folders 里按 scene/bizType 等识别
 */
type Scene = 'REPORT' | 'APPEAL';
const sceneKeys = ['scene', 'stage', 'bizType', 'folderType', 'category', 'type', 'fileBizType', 'belongTo', 'sourceType'];
const sceneDict: Record<Scene, any[]> = {
  REPORT: [1, '1', 'REPORT', 'report', '举报'],
  APPEAL: [2, '2', 'APPEAL', 'appeal', '申诉']
};
const ensureArr = (v: any) => (Array.isArray(v) ? v : []);

const matchScene = (f: any, scene: Scene) => {
  const targets = sceneDict[scene];
  for (const k of sceneKeys) {
    const val = f?.[k];
    if (val === undefined || val === null) continue;
    const norm = typeof val === 'string' ? val.trim() : val;
    if (targets.some((t) => (typeof t === 'string' ? String(norm).toUpperCase() === t.toUpperCase() : norm === t))) {
      return true;
    }
  }
  return false;
};

const pickFolders = (scene: Scene) => {
  const fd: any = formData.value || {};
  // 显式字段优先
  const explicit =
    scene === 'REPORT'
      ? fd.reportFolders || fd.reportAttachList || fd.reportFiles || fd.reportMaterials || fd.reportList || fd.reportEvidence
      : fd.appealFolders || fd.appealAttachList || fd.appealFiles || fd.appealMaterials || fd.appealList || fd.appealEvidence;
  const exArr = ensureArr(explicit);
  if (exArr.length) return exArr;
  // 从 folders 智能识别
  return ensureArr(fd.folders).filter((f: any) => matchScene(f, scene));
};

const mapImageList = (list: any[]) =>
  ensureArr(list)
    .filter((f: any) => f?.fileType === 2 || isImage(f?.ossInfo?.url, f?.ossInfo?.contentType))
    .map((f: any) => ({ url: f?.ossInfo?.url, name: f?.ossInfo?.originalName }))
    .filter((i: any) => i.url);

const mapVideoList = (list: any[]) =>
  ensureArr(list)
    .filter((f: any) => f?.fileType === 3 || isVideo(f?.ossInfo?.url, f?.ossInfo?.contentType))
    .map((f: any) => {
      const size = f?.ossInfo?.size ?? f?.size;
      return {
        url: f?.ossInfo?.url,
        name: f?.ossInfo?.originalName,
        sizeText: size ? formatSize(size) : '200MB'
      };
    })
    .filter((v: any) => v.url);

// 新增：从 sysOssLists 等远端图片列表映射为前端图片项
const mapRemoteFilesToImages = (list: any[]) =>
  ensureArr(list)
    .filter((f: any) => isImage(f?.url, undefined, f?.fileSuffix))
    .map((f: any) => ({ url: f?.url, name: f?.originalName || f?.name }))
    .filter((i: any) => i.url);

// 新增：优先取分场景远端图片，REPORT 再回退到 sysOssLists
const pickRemoteImages = (scene: Scene) => {
  const fd: any = formData.value || {};
  const explicit =
    scene === 'REPORT' ? fd.reportSysOssLists || fd.reportImages || fd.reportPics : fd.appealSysOssLists || fd.appealImages || fd.appealPics;
  const exArr = ensureArr(explicit);
  if (exArr.length) return exArr;
  return scene === 'REPORT' ? ensureArr(fd.sysOssLists) : [];
};

// 新增：按 url 去重
const uniqueByUrl = (arr: Array<{ url: string; [k: string]: any }>) => {
  const set = new Set<string>();
  return arr.filter((i) => {
    if (!i?.url || set.has(i.url)) return false;
    set.add(i.url);
    return true;
  });
};

/** 举报材料 */
const reportImageList = computed(() => uniqueByUrl([...mapImageList(pickFolders('REPORT')), ...mapRemoteFilesToImages(pickRemoteImages('REPORT'))]));
const reportImagePreviewUrls = computed(() => reportImageList.value.map((i) => i.url));
const reportVideoList = computed(() => mapVideoList(pickFolders('REPORT')));

/** 申诉材料 */
const appealImageList = computed(() => uniqueByUrl([...mapImageList(pickFolders('APPEAL')), ...mapRemoteFilesToImages(pickRemoteImages('APPEAL'))]));
const appealImagePreviewUrls = computed(() => appealImageList.value.map((i) => i.url));
const appealVideoList = computed(() => mapVideoList(pickFolders('APPEAL')));

/**
 * 获取违规记录详情
 */
const fetchDetail = async () => {
  try {
    const res = await baseEnterpriseInfoId(String(props.id));
    formData.value = res.data;
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
</style>
