<!--
  标题: EditDetails.vue
  功能: 违规记录详情页
  说明: 用于违规记录详情查看
  当前版本: 1.0
  开发信息: Created by 邓和杰 2025-11-22
-->
<template>
  <div class="supplier-edit-details">
    <el-form :model="formData" v-loading="loading">
      <FormHeader title="案件信息" />
      <el-row :gutter="20" class="detail-form">
        <el-col :span="12">
          <el-form-item label="举报类型：">
            <dict-text :options="report_type_id" :value="String(formData.reportTypeId ?? '')" />
          </el-form-item>
        </el-col>
        <el-col :span="12" v-if="formData.caseCode">
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
                    <el-button type="primary" link @click="downloadAttachment(v.name || 'video_' + (idx + 1), v.url)">下载视频</el-button>
                  </div>
                </div>
              </template>
              <span v-else class="evidence-empty">暂无视频</span>
            </div>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 所属状态 -->
      <div class="status-section">
        <h3 class="section-title">所属状态: {{ currentScenario?.title }}</h3>

        <div class="status-timeline">
          <template v-for="stage in statusStages" :key="stage.id">
            <div v-if="stage.show" :class="{ 'timeline-item': true, 'active-connection': stage.active }">
              <div class="timeline-node" :class="{ 'active': stage.active }">
                <span class="icon-wrapper">✓</span>
              </div>

              <div class="timeline-content">
                <div class="stage-name">{{ stage.name }}</div>
                <div class="stage-time" v-if="stage.time">{{ stage.time }}</div>
              </div>
            </div>
          </template>
        </div>
      </div>
      <template v-if="formData.status == '2' && formData.newAppealFile?.appealFiles.length && caseCode">
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
                      <el-button type="primary" link @click="downloadAttachment(v.name || 'video_' + (idx + 1), v.url)">下载视频</el-button>
                    </div>
                  </div>
                </template>
                <span v-else class="evidence-empty">暂无视频</span>
              </div>
            </el-form-item>
          </el-col>
          <!-- 平台驳回申诉理由 -->
          <!-- <el-col :span="24" v-if="isRejected"> -->
          <el-col :span="24">
            <el-form-item label="平台驳回申诉理由：">
              <el-input v-model="formData.newAppealFile.appealReason" type="textarea" :rows="4" disabled autosize />
            </el-form-item>
          </el-col>
        </el-row>
      </template>

      <!-- 待处理状态：显示处理反馈 -->
      <template v-if="formData.status === '0'">
        <!-- <div v-show="isPending"> -->
        <div>
          <FormHeader title="处理反馈" />
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="处理反馈：" required>
                <el-radio-group v-model="processFeedback.handleBack">
                  <el-radio value="0">举报驳回</el-radio>
                  <el-radio value="1">平台受理</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>

            <!-- 选择举报驳回：显示驳回原因输入框 -->
            <el-col v-if="processFeedback.handleBack === '0'" :span="24">
              <el-form-item label="驳回原因：" required>
                <el-input
                  v-model="processFeedback.rejectReason"
                  type="textarea"
                  :rows="4"
                  placeholder="请输入驳回原因,最多输入200个汉字"
                  maxlength="200"
                  show-word-limit
                />
                <!-- <div v-if="!processFeedback.rejectReason" style="color: #f56c6c; font-size: 12px; margin-top: 4px">请填写驳回原因</div> -->
              </el-form-item>
            </el-col>

            <!-- 选择平台受理：显示案件类型下拉框 -->
            <template v-if="processFeedback.handleBack === '1'">
              <el-col :span="24">
                <el-form-item label="案件类型：" required>
                  <el-select
                    v-model="processFeedback.id"
                    placeholder="请选择"
                    filterable
                    clearable
                    style="width: 100%"
                    @change="handleCaseTypeChange(processFeedback.id)"
                  >
                    <el-option v-for="item in caseTypeOptions" :key="item.id" :label="item.label" :value="item.id" />
                  </el-select>
                  <div v-if="!processFeedback.id" style="color: #f56c6c; font-size: 12px; margin-top: 4px">请选择案件类型</div>
                </el-form-item>
              </el-col>

              <!-- 案件类型详情列表 -->
              <el-col v-if="caseTypeDetail" :span="24">
                <el-table :data="caseTypeDetail ? [caseTypeDetail] : []" border>
                  <el-table-column prop="caseTypeCode" label="案件类型编号" align="center" />
                  <el-table-column prop="caseTypeId" label="案件类型名称" align="center">
                    <template v-slot="scope">
                      <dict-text :options="case_type" :value="scope.row.caseTypeId ?? ''" />
                    </template>
                  </el-table-column>
                  <el-table-column label="执法依据" align="center">
                    <template v-slot="scope">
                      <span
                        style="color: #108c58; cursor: pointer"
                        @click="downloadAttachment(scope.row.newBasisFile?.originalName || '', scope.row.newBasisFile?.ossInfo?.url || '')"
                      >
                        {{ scope.row.newBasisFile?.originalName || '' }}
                      </span>
                    </template>
                  </el-table-column>
                  <el-table-column label="执法文书模版" align="center">
                    <template v-slot="scope">
                      <span
                        style="color: #108c58; cursor: pointer"
                        @click="downloadAttachment(scope.row.newDocumentFile?.originalName || '', scope.row.newDocumentFile?.ossInfo?.url || '')"
                      >
                        {{ scope.row.newDocumentFile?.originalName || '' }}
                      </span>
                    </template>
                  </el-table-column>
                </el-table>
              </el-col>
            </template>
          </el-row>
        </div>
      </template>

      <!-- 非已驳回状态：显示案件类型 -->
      <!-- <template v-if="!isRejected && !isPending && !isWithdrawnPending"> -->
      <template v-if="formData.status != '2' && formData.status != '0' && caseCode">
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

        <!-- 非已驳回状态：显示申诉材料 -->
        <template v-if="!hideProcessingViewSection && !isWithdrawnPending">
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
                        <el-button type="primary" link @click="downloadAttachment(v.name || 'video_' + (idx + 1), v.url)">下载视频</el-button>
                      </div>
                    </div>
                  </template>
                  <span v-else class="evidence-empty">暂无视频</span>
                </div>
              </el-form-item>
            </el-col>
            <!-- 平台驳回申诉理由 -->
            <!-- <el-col :span="24" v-if="isRejected"> -->
            <el-col :span="24">
              <el-form-item label="平台驳回申诉理由：">
                <el-input v-model="formData.backReason" type="textarea" :rows="4" disabled autosize />
              </el-form-item>
            </el-col>
          </el-row>
        </template>
      </template>

      <!--历史申诉材料  -->
      <!-- <div v-if="!hideProcessingViewSection && !isWithdrawnPending && (isProcessing || (!isRejected && !isPending))"> -->
      <!-- {{ formData.newAppealFile }} -->
      <div v-if="formData.historyAppealList">
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
      <!-- 已驳回状态：显示驳回原因 -->
      <!-- <template v-if="isRejected"> -->
      <template v-if="formData.status === '2'">
        <FormHeader title="驳回供应商/企业原因" v-if="!!formData.caseCode" />
        <el-row :gutter="20" class="detail-form" v-if="!!formData.caseCode">
          <el-col :span="24">
            <el-form-item label="驳回原因：">
              <el-input v-model="formData.backAppealReason" type="textarea" :rows="4" disabled autosize />
            </el-form-item>
          </el-col>
        </el-row>
        <FormHeader title="驳回举报人原因" v-if="!formData.caseCode" />
        <el-row :gutter="20" class="detail-form" v-if="!formData.caseCode">
          <el-col :span="24">
            <el-form-item label="驳回原因：">
              <el-input v-model="formData.rejectReason" type="textarea" :rows="4" disabled autosize />
            </el-form-item>
          </el-col>
        </el-row>
      </template>
      <template v-if="isWithdrawn">
        <FormHeader title="举报人撤回原因" />
        <el-row :gutter="20" class="detail-form">
          <el-col :span="24">
            <el-form-item label="撤回原因：">
              <el-input :model-value="withdrawReasonText || '暂无撤回原因'" type="textarea" :rows="4" disabled autosize />
            </el-form-item>
          </el-col>
        </el-row>
      </template>

      <!-- 处理中状态：显示新的处理反馈 -->
      <div v-show="isProcessing && !hideProcessingViewSection">
        <FormHeader title="处理反馈" />
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="处理反馈：" required>
              <el-cascader
                v-model="processingFeedback.feedbackCascader"
                :options="processingFeedbackCascaderOptions || []"
                placeholder="请选择"
                filterable
                clearable
                style="width: 100%"
                @change="handleProcessingFeedbackChange"
              />
              <div
                v-if="!processingFeedback.feedbackCascader || processingFeedback.feedbackCascader.length === 0"
                style="color: #f56c6c; font-size: 12px; margin-top: 4px"
              >
                请选择处理反馈
              </div>
            </el-form-item>
          </el-col>
          <!-- 选择驳回申诉：显示驳回申诉原因 -->
          <el-col v-if="processingFeedback.rejectBack === '0'" :span="24">
            <el-form-item label="驳回申诉原因：" required>
              <el-input
                v-model="processingFeedback.appealReason"
                type="textarea"
                :rows="4"
                placeholder="请输入驳回申诉原因,最多输入200个汉字"
                maxlength="200"
                show-word-limit
              />
              <div v-if="!processingFeedback.appealReason" style="color: #f56c6c; font-size: 12px; margin-top: 4px">请填写驳回申诉原因</div>
            </el-form-item>
          </el-col>

          <!-- 选择平台结案：显示案件扣分信息和平台反馈处理结果 -->
          <template v-if="processingFeedback.rejectBack === '1'">
            <el-col :span="24">
              <FormHeader title="案件扣分" />
            </el-col>
            <el-col :span="12">
              <el-form-item label="供应商名称/企业名称：">
                <el-input v-model="formData.reporterName" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="案件类型：">
                <dict-text :options="case_type" :value="formData.hnCase.caseTypeId ?? ''" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="扣分：">
                <el-input
                  :model-value="
                    formData.caseScore !== undefined && formData.caseScore !== null ? '-' + String(formData.caseScore) : formData.caseScore
                  "
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="信用等级：">
                <dict-text :options="plat_credit_rating" :value="formData.creditLevel ?? ''" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="剩余信用积分：">
                <el-input
                  :model-value="formData.sore !== undefined && formData.sore !== null ? String(formData.sore) + '分' : formData.sore"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="平台反馈处理结果：" required>
                <el-input
                  v-model="processingFeedback.dealResult"
                  type="textarea"
                  :rows="4"
                  placeholder="请输入平台反馈处理结果,最多输入200个汉字"
                  maxlength="200"
                  show-word-limit
                />
                <div v-if="!processingFeedback.dealResult" style="color: #f56c6c; font-size: 12px; margin-top: 4px">请填写平台反馈处理原因</div>
              </el-form-item>
            </el-col>
          </template>

          <!-- 选择申诉成功：显示平台反馈处理结果 -->
          <el-col v-if="processingFeedback.rejectBack === '2'" :span="24">
            <el-form-item label="平台反馈处理结果：" required>
              <el-input
                v-model="processingFeedback.dealResult"
                type="textarea"
                :rows="4"
                placeholder="请输入平台反馈处理结果,最多输入200个汉字"
                maxlength="200"
                show-word-limit
              />
              <div v-if="!processingFeedback.dealResult" style="color: #f56c6c; font-size: 12px; margin-top: 4px">请填写平台反馈处理原因</div>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 非已驳回且非待处理且非处理中状态：显示处理反馈（只读） -->
      <template v-if="!isRejected && !isPending && !isProcessing && !isWithdrawn">
        <FormHeader title="处理反馈" />
        <el-row :gutter="20" class="detail-form">
          <el-col :span="24">
            <el-form-item label="处理反馈：">
              <span>{{ rejectBackLabel }}</span>
            </el-form-item>
          </el-col>
          <template v-if="formData.rejectBack === '1'">
            <el-col :span="12">
              <el-form-item label="供应商名称/企业名称：">
                <el-input v-model="formData.reporterName" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="案件类型：">
                <el-input :model-value="formData.hnCase?.caseTypeName || ''" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="扣分：">
                <el-input
                  :model-value="
                    formData.caseScore !== undefined && formData.caseScore !== null ? '-' + String(formData.caseScore) : formData.caseScore
                  "
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="信用等级：">
                <dict-text :options="plat_credit_rating" :value="formData.creditLevel ?? ''" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="剩余信用积分：">
                <el-input
                  :model-value="formData.sore !== undefined && formData.sore !== null ? String(formData.sore) + '分' : formData.sore"
                  disabled
                />
              </el-form-item>
            </el-col>
          </template>
          <el-col :span="24">
            <el-form-item label="平台反馈处理结果：">
              <el-input v-model="formData.dealResult" type="textarea" :rows="4" disabled autosize />
            </el-form-item>
          </el-col>
        </el-row>
      </template>

      <!-- 按钮区域 -->
      <div style="margin-top: 20px; text-align: right">
        <template v-if="isViewMode">
          <el-button v-throttle type="primary" @click="handleSave">返回</el-button>
        </template>
        <template v-else>
          <!-- 待处理状态：显示提交和返回按钮 -->
          <template v-if="isPending">
            <el-button v-throttle @click="handleSave">返回</el-button>
            <el-button v-throttle type="primary" :loading="submitLoading" @click="handleConfirm">提交</el-button>
          </template>
          <!-- 处理中状态：显示确认按钮 -->
          <template v-else-if="formData.status === '1'">
            <el-button v-throttle @click="handleSave">取消</el-button>
            <el-button v-throttle type="primary" :loading="submitLoading" @click="handleConfirm">确认</el-button>
          </template>
          <!-- 其他状态：显示返回按钮 -->
          <template v-else>
            <el-button v-throttle type="primary" @click="handleSave">返回</el-button>
          </template>
        </template>
      </div>
      <div style="height: 20px"></div>
    </el-form>

    <!-- 历史申诉材料弹窗 -->
    <el-dialog v-model="appealDialogVisible" title="历史申诉材料" width="50%" destroy-on-close append-to-body @close="closeAppealDialog">
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

          <el-col :span="24">
            <el-form-item label="平台驳回申诉理由：">
              <el-input v-model="appealDetail.backReason" type="textarea" :rows="4" disabled autosize />
            </el-form-item>
          </el-col>
        </el-row>
      </div>
    </el-dialog>

    <!-- 被举报人详情弹窗 -->
    <el-dialog v-model="supplierDialogVisible" title="供应商/企业信息" width="50%" append-to-body destroy-on-close>
      <supplierDetail :id="supplierDialogId" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, reactive, getCurrentInstance, toRefs, ComponentInternalInstance } from 'vue';
// 仅保留使用到的 API 与类型
import { getReportCaseFilingDetail, getlookDetail, FormData, FileViewItem } from '@/api/rightsPlatform/achiveManagement/credit/violationRecords';
import {
  getReportCaseFilingDetail as getSafeguardReportCaseFilingDetail,
  getPendingReportCaseFilingDetail,
  editReportCaseFiling,
  editAppealReportCaseFiling
} from '@/api/safeguard/reportCaseFiling';
import { fetchCaseTypeOptions, getCaseTypeDetail } from '@/api/safeguard/case';

import { ElMessage } from 'element-plus';
import FormHeader from '@/components/FormHeader/index.vue';
import supplierDetail from './supplierDetail.vue';
const loading = ref(true);
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { case_type, plat_credit_rating, report_type_id } = toRefs<any>(proxy?.useDict('case_type', 'plat_credit_rating', 'report_type_id'));
// 通过 props 接收父组件传参
const props = defineProps<{
  id: string | number;
  status?: string; // 当前行的状态，用于判断调用哪个 API
  type?: 'view' | 'process';
  appealTime?: string;
  caseCode?: string;
}>();
// 子组件对外事件
const emit = defineEmits<{
  (e: 'cancel'): void;
  (e: 'success'): void;
}>();

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
  hnCase: undefined as any,
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
  newAppealFile: undefined as any,
  reportFiles: [],
  statusAndDate: []
});

// 判断是否是已驳回状态
const isRejected = computed(() => {
  return formData.value?.status === '2';
});

// 判断是否可以编辑（待处理或处理中状态）
const canEdit = computed(() => {
  const status = formData.value?.status;
  return status === '0' || status === '1';
});

// 判断是否是待处理状态
const isPending = computed(() => {
  return formData.value?.status === '0';
});

// 判断是否是处理中状态
const isProcessing = computed(() => {
  return formData.value?.status === '1';
});

const isWithdrawn = computed(() => formData.value?.status === '4');
const isWithdrawnPending = computed(() => isWithdrawn.value && !formData.value?.caseCode);
const isWithdrawnProcessing = computed(() => isWithdrawn.value && !!formData.value?.caseCode);
const withdrawReasonText = computed(() => {
  return formData.value?.withdrawCause ?? formData.value?.withdrawReason ?? formData.value?.revokeReason ?? '';
});
const rejectBackLabel = computed(() => {
  const map: Record<string, string> = {
    '0': '驳回申诉',
    '1': '平台结案',
    '2': '申诉成功'
  };
  const val = formData.value?.rejectBack;
  return map[String(val)] ?? '-';
});

const dialogMode = computed(() => props.type ?? 'view');
const isViewMode = computed(() => dialogMode.value === 'view');
const hideProcessingViewSection = computed(() => isProcessing.value && dialogMode.value === 'view');

// 提交加载状态
const submitLoading = ref(false);

// 待处理状态的处理反馈表单数据
const processFeedback = reactive({
  handleBack: '0', // '0' 举报驳回 | '1' 平台受理
  rejectReason: '', // 驳回原因
  caseTypeId: '', // 案件类型ID（用于显示和选择）
  id: '' // 案件类型的列表ID
});

// 处理中状态的处理反馈表单数据
const processingFeedback = reactive({
  feedbackCascader: [] as string[], // 级联菜单的值，如 ['0']、['1', '1']、['1', '2']
  rejectBack: '', // '0' 驳回申诉 | '1' 平台结案 | '2' 申诉成功
  appealReason: '', // 驳回申诉原因（仅当rejectBack为'0'时使用）
  dealResult: '' // 平台反馈处理结果（仅当rejectBack为'1'或'2'时使用）
});

// 处理反馈级联菜单选项（待处理状态使用）
const feedbackCascaderOptions = [
  {
    value: '0',
    label: '举报驳回',
    leaf: false
  },
  {
    value: '1',
    label: '平台受理',
    children: [
      {
        value: '1',
        label: '平台结案',
        leaf: true
      },
      {
        value: '2',
        label: '申诉成功',
        leaf: true
      }
    ]
  }
];

// 处理中状态的处理反馈级联菜单选项
let processingFeedbackCascaderOptions = reactive<any[]>([
  {
    value: '0',
    label: '驳回申诉',
    leaf: true,
    disabled: false
  },
  {
    value: '1',
    label: '平台处理',
    children: [
      {
        value: '1',
        label: '平台结案',
        leaf: true,
        disabled: false
      },
      {
        value: '2',
        label: '申诉成功',
        leaf: true,
        disabled: false
      }
    ]
  }
]);

// 案件类型选项列表
const caseTypeOptions = ref<{ value: string | number; label: string }[]>([]);

// 案件类型详情数据
const caseTypeDetail = ref<any>(null);
const caseTypeDetailLoading = ref(false);

// 状态场景模板配置
const getStatusScenarios = (): Record<string, any> => ({
  // 待处理状态 '0'
  '0': {
    title: '待处理',
    stages: [
      { id: 1, name: '待处理', time: '', active: true, show: true },
      { id: 2, name: '处理中', time: '', active: false, show: true },
      { id: 3, name: '已结案', time: '', active: false, show: true }
    ],
    currentStageId: 1
  },
  // 处理中状态 '1'
  '1': {
    title: '处理中',
    appealTime: '',
    stages: [
      { id: 1, name: '待处理', time: '', active: true, show: true },
      { id: 2, name: '处理中', time: '', active: true, show: true },
      { id: 3, name: '已驳回', time: '', active: false, show: true }
    ],
    stagesOther: [
      { id: 1, name: '待处理', time: '', active: true, show: true },
      { id: 2, name: '处理中', time: '', active: true, show: true },
      { id: 3, name: '已结案', time: '', active: false, show: true }
    ],
    currentStageId: 2
  },
  // 已驳回状态 '2'
  '2': {
    title: '已驳回',
    stages: [
      { id: 1, name: '待处理', time: '', active: true, show: true },
      { id: 2, name: '已驳回', time: '', active: true, show: true }
    ],
    stagesOther: [
      { id: 1, name: '待处理', time: '', active: true, show: true },
      { id: 2, name: '处理中', time: '', active: true, show: true },
      { id: 3, name: '已驳回', time: '', active: true, show: true }
    ],
    currentStageId: 2
  },
  // 已结案状态 '3'
  '3': {
    title: '已结案',
    stages: [
      { id: 1, name: '待处理', time: '', active: true, show: true },
      { id: 2, name: '处理中', time: '', active: true, show: true },
      { id: 3, name: '已结案', time: '', active: true, show: true }
    ],
    currentStageId: 3
  },
  // 已撤回状态 '4'
  '4': {
    title: '已撤回',
    caseCode: '',
    stages: [
      { id: 1, name: '待处理', time: '', active: true, show: true },
      { id: 2, name: '处理中', time: '', active: true, show: true },
      { id: 3, name: '已撤回', time: '', active: true, show: true }
    ],
    stagesOther: [
      { id: 1, name: '待处理', time: '', active: true, show: true },
      { id: 2, name: '已撤回', time: '', active: true, show: true }
    ],
    currentStageId: 2
  }
});

// 当前状态场景
const currentScenario = computed(() => {
  const status = String(props.status ?? formData.value?.status ?? '0');
  const statusScenarios = getStatusScenarios();
  const template = statusScenarios[status] || statusScenarios['0'];
  const appealTime = (formData.value as any)?.appealTime ?? props.appealTime;
  const caseCode = (formData.value as any)?.caseCode;
  let baseStages = template.stages;
  if (status === '1' && template.stagesOther) {
    baseStages = appealTime ? template.stages : template.stagesOther;
  } else if (status === '4' && template.stagesOther) {
    baseStages = caseCode ? template.stages : template.stagesOther;
  }
  // 有caseCode，但是已驳回
  if (status === '2' && template.stagesOther) {
    baseStages = caseCode ? template.stagesOther : template.stages;
  }
  const scenario = {
    title: template.title,
    currentStageId: template.currentStageId,
    stages: baseStages.map((stage: any) => ({ ...stage }))
  };

  if (status === '4' && isWithdrawnProcessing.value) {
    scenario.stages = [
      { id: 1, name: '待处理', time: '', active: true, show: true },
      { id: 2, name: '处理中', time: '', active: true, show: true },
      { id: 3, name: '已撤回', time: '', active: true, show: true }
    ];
    scenario.currentStageId = 3;
  }

  // 如果有 statusAndDate，使用它来更新时间和状态
  const statusAndDate = (formData.value as any)?.statusAndDate || [];
  if (Array.isArray(statusAndDate) && statusAndDate.length > 0) {
    scenario.stages = scenario.stages.map((stage: any) => {
      const statusItem = statusAndDate.find((item: any) => {
        const stageStatus = String(item.status || item.key || '');
        if (stage.id === 1) return stageStatus === '0';
        if (stage.id === 2) {
          if (status === '2') {
            if (statusAndDate.length <= 2) return stageStatus === '2';
            return stageStatus === '1';
          }
          if (status === '4') {
            if (isWithdrawnProcessing.value) return stageStatus === '1';
            // return stageStatus === '4';
          }
          return stageStatus === '1';
        }
        if (stage.id === 3) {
          if (status === '2') return stageStatus === '2';
          if (status === '3') return stageStatus === '3';
          if (status === '4') return stageStatus === '4';
        }
        return false;
      });
      if (statusItem) {
        stage.time = statusItem.time || statusItem.date || '';
        stage.active = true;
      }
      console.log(stage);
      return stage;
    });
  } else {
    // 如果没有 statusAndDate，使用默认逻辑
    scenario.stages = scenario.stages.map((stage: any) => {
      if (stage.id === 1 && !stage.time) {
        stage.time = formData.value?.createTime || '';
      } else if (stage.id === 2 && !stage.time && status !== '0') {
        stage.time = formData.value?.updateTime || formData.value?.createTime || '';
      } else if (stage.id === 3 && !stage.time && (status === '3' || status === '4')) {
        stage.time = formData.value?.closeCaseTime || formData.value?.updateTime || '';
      }
      return stage;
    });
  }
  // console.log(scenario.stages);

  return scenario;
});

const statusStages = computed(() => currentScenario.value.stages);

const reportImageList = ref<FileViewItem[]>([]); // 举报图片列表
const reportImagePreviewUrls = ref<string[]>([]); // 举报图片预览 URL 列表
const reportVideoList = ref<FileViewItem[]>([]); // 举报视频列表

const appealImageList = ref<FileViewItem[]>([]); // 申诉图片列表
const appealImagePreviewUrls = ref<string[]>([]); // 申诉图片预览 URL 列表
const appealVideoList = ref<FileViewItem[]>([]); // 申诉视频列表

// 弹窗：历史申诉材料
const appealDialogVisible = ref(false);
const appealDialogLoading = ref(false);
const appealDetail = ref<{ appealReason: string; appealTime: string; backReason: string }>({
  appealReason: '',
  appealTime: '',
  backReason: ''
});
const histAppealImageList = ref<FileViewItem[]>([]); // 历史申诉图片列表
const histAppealImagePreviewUrls = ref<string[]>([]); // 历史申诉图片预览 URL 列表
const histAppealVideoList = ref<FileViewItem[]>([]); // 历史申诉视频列表

// 违规记录详情返回（保持原事件名以兼容父组件）
const handleSave = async () => {
  emit('cancel');
};

// 加载案件类型选项
const loadCaseTypeOptions = async () => {
  try {
    const res = await fetchCaseTypeOptions({ status: 0 });
    const list: any[] = res?.data || res || [];
    caseTypeOptions.value = (Array.isArray(list) ? list : []).map((item: any) => ({
      value: item.id ?? item.caseTypeId ?? item.value ?? '',
      label: item.caseTypeName ?? item.label ?? '',
      caseTypeId: item.caseTypeId, // 保存 caseTypeId 用于显示
      id: item.id
    }));
  } catch (error) {
    console.error('获取案件类型列表失败:', error);
    ElMessage.error('获取案件类型列表失败');
  }
};

// 处理中状态处理反馈选择变化处理
const handleProcessingFeedbackChange = (value: string[]) => {
  // 清空处理结果
  processingFeedback.appealReason = '';
  processingFeedback.dealResult = '';

  if (!value || value.length === 0) {
    // 清空选择
    processingFeedback.rejectBack = '';
    return;
  }

  // 根据级联菜单的值设置 rejectBack
  // 选择 ['0'] -> rejectBack = '0' (驳回申诉)
  // 选择 ['1', '1'] -> rejectBack = '1' (平台处理 -> 平台结案)
  // 选择 ['1', '2'] -> rejectBack = '2' (平台处理 -> 申诉成功)
  if (value[0] === '0') {
    // 选择驳回申诉（一级选项）
    processingFeedback.rejectBack = '0';
  } else if (value[0] === '1' && value.length === 2) {
    // 选择平台处理，并选择了二级选项
    processingFeedback.rejectBack = value[1]; // '1' 或 '2'
  } else {
    // 只选择了平台处理，还未选择第二级
    processingFeedback.rejectBack = '';
  }
};

// 案件类型选择变化处理
const handleCaseTypeChange = async (id: string | number) => {
  if (!id) {
    caseTypeDetail.value = null;
    return;
  }

  caseTypeDetailLoading.value = true;
  try {
    const res = await getCaseTypeDetail(String(id));
    if (res && res.code === 200) {
      caseTypeDetail.value = res.data || {};
    } else {
      console.error('获取案件类型详情失败:', res?.msg);
      caseTypeDetail.value = null;
    }
  } catch (error) {
    console.error('获取案件类型详情失败:', error);
    ElMessage.error('获取案件类型详情失败');
    caseTypeDetail.value = null;
  } finally {
    caseTypeDetailLoading.value = false;
  }
};

// 确认按钮处理
const handleConfirm = async () => {
  if (!formData.value?.id) {
    ElMessage.error('数据异常，无法提交');
    return;
  }

  const status = formData.value?.status;
  submitLoading.value = true;

  try {
    // 待处理状态：验证处理反馈
    if (status === '0') {
      if (processFeedback.handleBack === '' || processFeedback.handleBack === undefined || processFeedback.handleBack === null) {
        ElMessage.error('请选择处理反馈类型');
        submitLoading.value = false;
        return;
      }

      if (processFeedback.handleBack === '0') {
        // 举报驳回：验证驳回原因
        if (!processFeedback.rejectReason || !processFeedback.rejectReason.trim()) {
          ElMessage.error('请填写驳回原因');
          submitLoading.value = false;
          return;
        }
      } else if (processFeedback.handleBack === '1') {
        // 平台受理：验证案件类型
        if (!processFeedback.id) {
          ElMessage.error('请选择案件类型');
          submitLoading.value = false;
          return;
        }
      }
    }

    // 处理中状态：验证处理反馈
    if (status === '1') {
      if (!processingFeedback.feedbackCascader || processingFeedback.feedbackCascader.length === 0) {
        ElMessage.error('请选择处理反馈');
        submitLoading.value = false;
        return;
      }

      // 如果选择了平台处理，必须选择二级选项
      if (processingFeedback.feedbackCascader[0] === '1' && processingFeedback.feedbackCascader.length !== 2) {
        ElMessage.error('请选择平台处理类型');
        submitLoading.value = false;
        return;
      }

      // 如果选择的是驳回申诉，需要验证驳回申诉原因
      if (processingFeedback.rejectBack === '0') {
        if (!processingFeedback.appealReason || !processingFeedback.appealReason.trim()) {
          ElMessage.error('请填写驳回申诉原因');
          submitLoading.value = false;
          return;
        }
      }

      // 如果选择的是平台结案或申诉成功，需要验证平台反馈处理结果
      if (processingFeedback.rejectBack === '1' || processingFeedback.rejectBack === '2') {
        if (!processingFeedback.dealResult || !processingFeedback.dealResult.trim()) {
          ElMessage.error('请填写平台反馈处理结果');
          submitLoading.value = false;
          return;
        }
      }
    }

    console.log('processFeedback.id', processFeedback.id);
    // 构建提交数据
    const submitData = {
      // 先展开 formData，避免覆盖处理反馈数据
      ...formData.value,
      id: props.id ?? formData.value.id,
      // 待处理状态：添加处理反馈数据（放在最后，确保不被覆盖）
      ...(status === '0'
        ? {
            handleBack: processFeedback.handleBack,
            ...(processFeedback.handleBack === '0' ? { rejectReason: processFeedback.rejectReason } : {}),
            ...(processFeedback.handleBack === '1' ? { hnCaseId: processFeedback.caseTypeId } : {})
          }
        : {}),
      // 处理中状态：添加处理反馈数据（只需要传 rejectBack）
      ...(status === '1'
        ? {
            rejectBack: processingFeedback.rejectBack,
            ...(processingFeedback.rejectBack === '0' ? { appealReason: processingFeedback.appealReason } : {}),
            ...(processingFeedback.rejectBack === '1' || processingFeedback.rejectBack === '2' ? { dealResult: processingFeedback.dealResult } : {})
          }
        : {})
    };
    submitData.hnCaseId = processFeedback.id;

    if (status === '0') {
      // 待处理状态：调用 editReportCaseFiling
      await editReportCaseFiling(submitData);
      ElMessage.success('处理成功');
    } else if (status === '1') {
      // 处理中状态：调用 editAppealReportCaseFiling
      await editAppealReportCaseFiling(submitData);
      ElMessage.success('处理成功');
    } else {
      ElMessage.error('当前状态不支持此操作');
      return;
    }

    // 通知父组件刷新列表
    emit('success');
    emit('cancel');
  } catch (error: any) {
    console.error('提交失败:', error);
    ElMessage.error(error?.msg || error?.message || '提交失败，请稍后重试');
  } finally {
    submitLoading.value = false;
  }
};

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
    console.log('历史申诉详情数据:', data);

    // 文本信息
    appealDetail.value.appealReason = data.appealReason ?? '';
    appealDetail.value.appealTime = data.appealTime ?? '';
    appealDetail.value.backReason = data.backReason ?? '';

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

/** 关闭弹窗并重置数据 */
const closeAppealDialog = () => {
  appealDialogVisible.value = false;
  appealDetail.value = { appealReason: '', appealTime: '', backReason: '' };
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

/**
 * 获取违规记录详情
 */
const fetchDetail = async () => {
  if (!props.id) return;
  try {
    loading.value = true;
    // 根据状态调用不同的 API
    // 待处理/已撤回/已驳回状态调用 getPendingReportCaseFilingDetail，其它状态调用正式详情
    // const shouldUsePendingApi = props.status === '0' || props.status === '2' || props.status === '4';
    const shouldUsePendingApi = props.caseCode;//有案件号一律使用 /reportCaseFiling/
    const res = shouldUsePendingApi
      ? await getSafeguardReportCaseFilingDetail(String(props.id))
      : await getPendingReportCaseFilingDetail(String(props.id));
    loading.value = false;
    if (res && res.code === 200) {
      formData.value = res.data || {};
      if (res.data.historyAppealList && res.data.historyAppealList.length >= 2) {
        processingFeedbackCascaderOptions[0].disabled = true;
      } else {
        processingFeedbackCascaderOptions[0].disabled = false;
      }
    } else {
      console.error('获取详情失败:', res?.msg);
      return;
    }

    // 使用统一方法构建举报材料
    const reportFiles = safeArray(formData.value?.reportFiles || []);
    const r = splitFiles(reportFiles);
    reportImageList.value = r.images;
    reportImagePreviewUrls.value = buildPreviewUrls(r.images);
    reportVideoList.value = r.videos;

    // 使用统一方法构建申诉材料
    const appealFiles = safeArray(formData.value?.newAppealFile?.appealFiles || []);
    const a = splitFiles(appealFiles);
    console.log('a', a);
    appealImageList.value = a.images;
    appealImagePreviewUrls.value = buildPreviewUrls(a.images);
    appealVideoList.value = a.videos;
  } catch (error) {
    console.error('获取违规记录详情失败:', error);
    loading.value = false;
  }
};

// 重置处理反馈表单的函数
const resetProcessFeedback = () => {
  processFeedback.handleBack = '0';
  processFeedback.rejectReason = '';
  processFeedback.caseTypeId = '';
  processFeedback.id = '';
  caseTypeDetail.value = null;
  // 重置处理中状态的处理反馈
  processingFeedback.feedbackCascader = [];
  processingFeedback.rejectBack = '';
  processingFeedback.appealReason = '';
  processingFeedback.dealResult = '';
};

onMounted(() => {
  resetProcessFeedback();
  fetchDetail();
  // 如果是待处理状态，加载案件类型选项
  if (isPending.value) {
    loadCaseTypeOptions();
  }
});

// 监听状态变化，如果是待处理状态则加载案件类型选项
watch(
  () => formData.value?.status,
  (newStatus, oldStatus) => {
    if (newStatus === '0') {
      loadCaseTypeOptions();
    }
    // 只有在状态从非待处理变为待处理时，才重置表单（避免初始化时重置）
    if (newStatus === '0' && oldStatus !== undefined && oldStatus !== '0') {
      // resetProcessFeedback();
    }
  }
);

// 监听 id 变化，重置表单
watch(
  () => props.id,
  (newId, oldId) => {
    // 只有在 id 真正变化时才重置表单
    if (newId && newId !== oldId) {
      // resetProcessFeedback();
    }
  }
);
</script>

<style scoped lang="scss">
:deep(.el-button) {
  border-radius: 4px !important;
}

.supplier-edit-details {
  padding: 0 24px;
}

// 去掉表单的默认样式
// ::v-deep .el-input__wrapper {
//   box-shadow: none !important;
//   background-color: transparent !important;
//   cursor: default !important;
//   resize: none !important;
// }

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

/* 状态部分样式 */
.status-section {
  margin-top: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 20px;
  color: #333;
}

.status-timeline {
  display: flex;
  position: relative;
  padding: 20px 0;
}

.timeline-item {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1;
}

.timeline-node {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid #dcdfe6;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  margin-bottom: 10px;
  transition: all 0.3s;
  position: relative;
}

.timeline-node.active {
  border: 1px solid #409eff;
}

.icon-wrapper {
  font-size: 18px;
  font-weight: bold;
  color: #dcdfe6;
  line-height: 1;
  text-align: center;
}

.timeline-node.active .icon-wrapper {
  color: #409eff;
}

.timeline-content {
  text-align: center;
}

.stage-name {
  font-size: 14px;
  color: #333;
  margin-bottom: 5px;
}

.stage-time {
  font-size: 12px;
  color: #909399;
}

/* 基础连接线样式 */
.timeline-item:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 12px;
  left: calc(50% + 12px);
  width: calc(100% - 24px);
  height: 2px;
  background: #dcdfe6;
  z-index: 0;
}

/* 激活状态的连接线样式 */
.timeline-item.active-connection:not(:last-child)::after {
  background: #409eff;
}

/* 激活状态的文本样式 */
.timeline-item.active-connection .stage-name,
.timeline-item.active-connection .stage-time {
  color: #409eff;
}
</style>
