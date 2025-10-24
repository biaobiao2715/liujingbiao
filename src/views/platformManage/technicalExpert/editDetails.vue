<!--
  标题: EditDetails.vue
  功能: 供应商编辑详情页
  说明: 用于供应商编辑自己的详细信息
  当前版本: 1.0
  开发信息: Created by 李春雷 2025-10-15
-->
<template>
  <div v-loading="loading">
    <div :class="['supplier-edit-details', 'detail-form']">
      <!-- 基础信息 -->
      <el-form :model="formData" label-width="140px" :disabled="true">
        <FormHeader title="技术专家基础信息" />
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="专家姓名">
              <el-input v-model="formData.expertName" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别">
              <el-input :value="sexMap[formData.sex]" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="出生年月">
              <el-input v-model="formData.birthDate" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="入学日期">
              <el-input v-model="formData.enrollmentDate" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="专业">
              <el-input v-model="formData.major" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="学历">
              <el-input v-model="formData.education" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="毕业日期">
              <el-input v-model="formData.graduationDate" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="身份证号">
              <el-input v-model="formData.idCard"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="学位">
              <el-input v-model="formData.degree" type="textarea"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="专业技术资格名称">
              <el-input v-model="formData.technicalQualification" type="textarea"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="毕业证书编号">
              <el-input v-model="formData.graduationCertNo" type="textarea"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话">
              <el-input v-model="formData.contactPhone" type="textarea"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="照片">
              <!-- <el-input v-model="formData.photo" type="textarea"></el-input> -->
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="专家简介">
              <el-input v-model="formData.expertInfo" type="textarea"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 法人信息 -->
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
      <!-- 供应商信息 -->
      <!-- <el-form :model="formData" label-width="140px" :disabled="operateMode === 'view'">
        <FormHeader title="供应商信息" />
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="资质等级">
              <el-select v-model="formData.credentialLevel">
                <el-option label="一级认证" value="0"></el-option>
                <el-option label="二级认证" value="1"></el-option>
                <el-option label="三级认证" value="2"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="信用等级">
              <el-select v-model="formData.creditLevel">
                <el-option label="优秀" value="0"></el-option>
                <el-option label="良好" value="1"></el-option>
                <el-option label="一般" value="2"></el-option>
                <el-option label="一般一下" value="3"></el-option>
                <el-option label="差" value="99"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form> -->

      <!-- 资料清单 -->
      <el-form :model="formData" label-width="140px">
        <FormHeader title="资料清单" />
        <el-table :data="formData.hnBaseRegisterFolderVoList" border>
          <el-table-column label="序号" width="100">
            <template #default="scope">
              {{ scope.$index + 1 }}
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
              <el-button v-throttle  type="primary" @click="previewAttachment(scope.row.ossInfo?.url)">预览</el-button>
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
      <div style="margin-top: 20px; text-align: center" v-if="operateMode === 'audit'">
        <el-button v-throttle  type="danger" @click="handleAudit('99')">审核退回</el-button>
        <el-button v-throttle  type="success" @click="handleAudit('1')">审核通过</el-button>
      </div>
      <div style="margin-top: 20px; text-align: center" v-if="operateMode === 'edit'">
        <el-button v-throttle  type="primary" @click="handleSave">保存</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import FormHeader from '@/components/FormHeader/index.vue';
import { useRoute } from 'vue-router';
import { getTechnicalExpertDetail, techUpdateOrSaveData } from '@/api/platform/technicalExpert';
import { TechnicalExpertList } from '@/api/platform/technicalExpert/types';

const route = useRoute();
const { id, type } = route.query;

const operateMode = ref(type);

const loading = ref(false);

const formData = ref<TechnicalExpertList>({} as TechnicalExpertList);

const sexMap = {
  '0': '男',
  '1': '女'
};


onMounted(() => {
  getDetail();
});

const getDetail = async () => {
  if (id && !Array.isArray(id)) {
    loading.value = true;
    try {
      const res = await getTechnicalExpertDetail(id);
      if (res.code === 200 && res.data) {
        formData.value = res.data;
      }
    } catch (error) {
      console.log('获取技术专家详情失败', error);
    } finally {
      loading.value = false;
    }
  }
};

// 保存按钮事件 和详情接口返回的的数据结构略有区别
const handleSave = async () => {
  try {
    loading.value = true;
    const response = await techUpdateOrSaveData({
      // @ts-ignore
      hnBaseTechExpertInfoBo: {
        ...formData.value
      }
    });
    if (response.code === 200) {
      ElMessage.success('保存成功');
    }
  } catch (error) {
    console.error('保存失败', error);
  } finally {
    loading.value = false;
  }
};

const handleAudit = async (status: '99' | '1') => {
  try {
    loading.value = true;
    const res = await techUpdateOrSaveData({
      // @ts-ignore
      hnBaseTechExpertInfoBo: {
        ...formData.value,
        reviewStatus: status
      },
      folder: formData.value.hnBaseRegisterFolderVoList,
      optType: status
    });
    if (res.code === 200) {
      ElMessage.success(status === '99' ? '审核退回成功' : '审核通过成功');
      operateMode.value = 'view';
    }
  } catch (error) {
    ElMessage.error('审核失败');
  } finally {
    loading.value = false;
  }
};

const previewAttachment = (attachment: any) => {
  console.log('预览附件', attachment);
  // 用element组件预览图片
  if (attachment) {
    // ElImagePreview({
    //   urls: [attachment],
    //   visible: true
    // });
  }
};
</script>

<style scoped lang="scss">
.supplier-edit-details {
  padding: 24px;
}
</style>
