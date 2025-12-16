<!--
标题: legalExpertEditDetails.vue
功能: 法务专家编辑详情页
说明: 用于法务专家编辑自己的详细信息
开发信息: Create by 李刘超 2025-10-18 17:05:13
当前版本: 1.0
-->

<template>
  <el-dialog
    :title="operateMode === 'edit' ? '法务专家编辑' : operateMode === 'audit' ? '法务专家审核' : '法务专家详情'"
    v-model="dialogVisible"
    width="50%"
  >
    <div v-loading="loading">
      <div :class="['supplier-edit-details', 'detail-form']">
        <!-- 基础信息 -->
        <el-form :model="formData" label-width="180px" :disabled="true">
          <FormHeader title="法务专家基础信息" />
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="专家编号">
                <el-input v-model="formData.expertNumber" disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="执业机构">
                <el-input v-model="formData.practiceInstitution" disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="性别">
                <el-input :value="getSexLabel(formData.sex)" disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="执业证类别">
                <el-input v-model="formData.practiceCertificateType" disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="持证人">
                <el-input v-model="formData.expertName" disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="发证机关">
                <el-input v-model="formData.issuingAuthority" disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="身份证号">
                <el-input v-model="formData.idCard" disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="发证日期">
                <el-input v-model="formData.issueDate" disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="执业证号">
                <el-input v-model="formData.practiceCertificateNumber" disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="法律职业资格或资格证号">
                <el-input v-model="formData.legalPracticeQualification" type="textarea"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="联系电话">
                <el-input v-model="formData.phoneNumber" type="textarea"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="照片">
                <!-- <el-input v-model="formData.issueDate" type="textarea"></el-input> -->
                <el-image
                  style="width: 100px; height: 100px"
                  :src="formData.licenseImage"
                  :preview-src-list="[formData.licenseImage]"
                  show-progress
                  fit="cover"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="专业技术资格名称">
                <el-input v-model="formData.technicalQualification" type="textarea"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="专家简介">
                <el-input v-model="formData.professionalSummary" type="textarea"></el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <FormHeader title="账号信息" />
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="账户名">
                <el-input v-model="formData.expertName"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="注册手机号">
                <el-input v-model="formData.phoneNumber"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <div :class="['supplier-edit-details', operateMode === 'view' ? 'detail-form' : '']">
        <!-- 资料清单 -->
        <el-form :model="formData" label-width="140px">
          <FormHeader title="资料清单" />
          <el-table :data="formData.hnBaseRegisterFolderVoList">
            <el-table-column label="序号" width="100">
              <template #default="scope">
                <span>{{ scope.$index + 1 }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="folderName" label="文件夹名称">
              <template #default="scope">
                {{ scope.row.ossInfo?.originalName }}
              </template>
            </el-table-column>
            <el-table-column prop="remark" label="备注"></el-table-column>
            <el-table-column label="操作">
              <template #default="scope">
                <el-button v-throttle link type="primary" @click="downloadAttachment(scope.row.ossInfo?.originalName, scope.row.ossInfo?.url)"
                  >下载</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-form>

        <!-- 审核意见 -->
        <el-form :model="formData" label-width="140px" :disabled="operateMode === 'view'" v-if="operateMode !== 'edit'">
          <FormHeader title="审核意见" />
          <el-form-item label="审核意见">
            <el-input v-model="formData.reviewRemark" type="textarea" maxlength="200" :rows="3"></el-input>
          </el-form-item>
        </el-form>

        <!-- 操作按钮 -->
        <div style="margin-top: 20px; display: flex; justify-content: end; align-items: end" v-if="operateMode === 'audit'">
          <el-button v-throttle type="danger" @click="handleAudit('99')">审核退回</el-button>
          <el-button v-throttle style="background: #108c58; color: #fff" @click="handleAudit('1')">审核通过</el-button>
        </div>
        <!-- <div style="margin-top: 20px; display: flex; justify-content: end; align-items: end" v-if="operateMode === 'edit'">
          <el-button v-throttle style="background: #108c58; color: #fff" @click="handleSave">保存</el-button>
        </div> -->
      </div>
    </div></el-dialog
  >
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import FormHeader from '@/components/FormHeader/index.vue';
import { useRoute } from 'vue-router';
import { getLegalExpertDetail, legalUpdateOrSaveData } from '@/api/platform/legalExpert';
import { LegalExpertList } from '@/api/platform/legalExpert/types';
// 子组件对外事件
const emit = defineEmits<{
  (e: 'refresh'): void;
  (e: 'cancel'): void;
}>();

const route = useRoute();
const { id, type } = route.query;

const operateMode = ref(type);
const dialogVisible = ref(false);

const loading = ref(false);

const formData = ref<LegalExpertList & { licenseImage?: string }>({} as LegalExpertList & { licenseImage?: string });
// 性别字典映射
const sexMap = {
  '0': '男',
  '1': '女'
};
// 获取性别显示文本
const getSexLabel = (sex: string) => {
  return sexMap[sex] || sex;
};

const getDetail = async (id: string) => {
  if (id && !Array.isArray(id)) {
    loading.value = true;
    try {
      const res = await getLegalExpertDetail(id);
      if (res.code === 200 && res.data) {
        formData.value = res.data;
        formData.value.licenseImage = formData.value.hnBaseRegisterFolderVoList?.find((folder) => folder.fileType === '2')?.ossInfo?.url || '';
      }
    } catch (error) {
      console.log('获取技术专家详情失败', error);
    } finally {
      loading.value = false;
    }
  }
};

// 保存按钮事件 和详情接口返回的的数据结构略有区别
// const handleSave = async () => {
//   try {
//     loading.value = true;
//     const response = await legalUpdateOrSaveData({
//       // @ts-ignore
//       hnBaseLegalExpertInfoBo: {
//         ...formData.value,
//         folder: formData.value.hnBaseRegisterFolderVoList?.map((item) => ({
//           ...item,
//           ...(item.ossInfo || {})
//         }))
//       },
//       optType: '2'
//     });
//     if (response.code === 200) {
//       ElMessage.success('保存成功');
//       emit('refresh');
//       dialogVisible.value = false;
//     }
//   } catch (error) {
//     console.error('保存失败', error);
//   } finally {
//     loading.value = false;
//   }
// };

const handleAudit = async (status: '99' | '1') => {
  if (!formData.value.reviewRemark) {
    ElMessage.error('请输入审核意见');
    return;
  }
  try {
    loading.value = true;
    const { id, reviewRemark } = formData.value || {};
    const hnBaseLegalExpertInfoBo = status === '1' ? { ...formData.value, reviewStatus: status } : { id, reviewRemark, reviewStatus: status };
    const payload = {
      hnBaseLegalExpertInfoBo,
      optType: '3'
    };
    const res = await legalUpdateOrSaveData(payload);
    if (res.code === 200) {
      ElMessage.success(status === '99' ? '审核退回成功' : '审核通过成功');
      operateMode.value = 'view';
      emit('refresh');
      dialogVisible.value = false;
    }
  } catch (error) {
    ElMessage.error('审核失败');
  } finally {
    loading.value = false;
  }
};

const downloadAttachment = async (fileName: string, url: string) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName; // 设置文件名
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href); // 释放 URL 对象
  } catch (error) {
    console.error('下载失败', error);
  }
};
// 打开/关闭弹窗
const handleOpenDialog = (id: string, type: 'view' | 'edit' | 'audit') => {
  operateMode.value = type;
  dialogVisible.value = true;
  getDetail(id);
};

defineExpose({
  handleOpenDialog
});
</script>

<style scoped lang="scss">
.supplier-edit-details {
  padding: 24px;
}
</style>
