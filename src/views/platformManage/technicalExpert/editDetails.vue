<!--
  标题: EditDetails.vue
  功能: 技术专家编辑详情页
  说明: 用于技术专家编辑自己的详细信息
  当前版本: 1.0
  开发信息: Created by 李春雷 2025-10-15
-->
<template>
  <div>
    <div :class="['supplier-edit-details', 'detail-form']">
      <!-- 基础信息 -->
      <el-form :model="formData.supplierInfo" label-width="140px" :disabled="true">
        <FormHeader title="供应商基础信息" />
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="供应商编码">
              <el-input v-model="formData.supplierInfo.code" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="审核状态">
              <el-input v-model="formData.supplierInfo.auditStatus" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="供应商名称">
              <el-input v-model="formData.supplierInfo.name" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="社会统一信用代码">
              <el-input v-model="formData.supplierInfo.creditCode" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="注册资本">
              <el-input v-model="formData.supplierInfo.registeredCapital"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="注册日期">
              <el-input v-model="formData.supplierInfo.registrationDate" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="注册地址">
              <el-input v-model="formData.supplierInfo.registrationAddress"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="营业执照">
              <img :src="formData.supplierInfo.license" width="200" />
              <!-- <imageUpload v-model="formData.supplierInfo.license" /> -->
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="办公地址">
              <el-input v-model="formData.supplierInfo.officeAddress"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="企业经营范围">
              <el-input v-model="formData.supplierInfo.businessScope" type="textarea"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 法人信息 -->
        <FormHeader title="法人信息" />
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="法人姓名">
              <el-input v-model="formData.legalPerson.name"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="证件号码">
              <el-input v-model="formData.legalPerson.idNumber"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="证件类型">
              <el-input v-model="formData.legalPerson.idType"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话">
              <el-input v-model="formData.legalPerson.phone"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 联系人信息 -->
        <FormHeader title="联系人信息" />
        <el-row :gutter="20" v-for="(contact, index) in formData.contacts" :key="index">
          <el-col :span="12">
            <el-form-item :label="'联系人' + (index + 1)">
              <el-input v-model="contact.name"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话">
              <el-input v-model="contact.phone"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 账户信息 -->
        <FormHeader title="账户信息" />
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="账户名">
              <el-input v-model="formData.accountInfo.accountName"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="注册手机号">
              <el-input v-model="formData.accountInfo.phoneNumber"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <div :class="['supplier-edit-details', operateMode === 'view' ? 'detail-form' : '']">
      <!-- 供应商信息 -->
      <el-form :model="formData.supplierRating" label-width="140px" :disabled="operateMode === 'view'">
        <FormHeader title="供应商信息" />
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="资质等级">
              <el-select v-model="formData.supplierRating.qualificationLevel">
                <el-option label="一级认证" value="一级认证"></el-option>
                <el-option label="二级认证" value="二级认证"></el-option>
                <el-option label="三级认证" value="三级认证"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="信用等级">
              <el-select v-model="formData.supplierRating.creditLevel">
                <el-option label="优秀" value="优秀"></el-option>
                <el-option label="良好" value="良好"></el-option>
                <el-option label="差" value="差"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <!-- 资料清单 -->
      <el-form :model="formData.attachments" label-width="140px">
        <FormHeader title="资料清单" />
        <el-table :data="formData.attachments" border>
          <el-table-column prop="index" label="序号" width="100"></el-table-column>
          <el-table-column prop="name" label="附件名"></el-table-column>
          <el-table-column prop="remark" label="备注"></el-table-column>
          <el-table-column label="操作">
            <template #default="scope">
              <el-button type="primary" @click="previewAttachment(scope.row)">预览</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form>

      <!-- 审核意见 -->
      <el-form :model="formData.auditOpinion" label-width="140px" :disabled="operateMode === 'view'" v-if="operateMode !== 'edit'">
        <FormHeader title="审核意见" />
        <el-form-item label="审核意见">
          <el-input v-model="formData.auditOpinion.content" type="textarea" maxlength="200" :rows="3"></el-input>
        </el-form-item>
      </el-form>

      <!-- 操作日志 -->
      <el-form label-width="140px" v-if="operateMode === 'view'">
        <FormHeader title="操作日志" />
        <el-table :data="formData.operationLogs" border>
          <el-table-column prop="operation" label="操作" width="200"></el-table-column>
          <el-table-column prop="operator" label="操作人" width="200"></el-table-column>
          <el-table-column prop="operationTime" label="操作时间" width="200"></el-table-column>
          <el-table-column prop="description" label="操作说明"></el-table-column>
        </el-table>
      </el-form>

      <!-- 操作按钮 -->
      <div style="margin-top: 20px; text-align: center" v-if="operateMode === 'audit'">
        <el-button type="danger" @click="saveChanges">审核退回</el-button>
        <el-button type="success" @click="cancelEdit">审核通过</el-button>
      </div>
      <div style="margin-top: 20px; text-align: center" v-if="operateMode === 'edit'">
        <el-button type="primary" @click="enterEditMode">保存</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import FormHeader from '@/components/FormHeader/index.vue';

// 获取router路由参数
import { useRoute } from 'vue-router';

const route = useRoute();
const { id, type } = route.query;

const operateMode = ref(type);

const formData = ref({
  supplierInfo: {
    code: 'GYS202509300001',
    auditStatus: '待审核',
    name: '史丹利复合肥有限公司',
    creditCode: 'B1440300C604861117',
    registeredCapital: '100000万',
    registrationDate: '2025年9月30日',
    registrationAddress: '浙江省台州市玉环市',
    officeAddress: '浙江省台州市玉环市',
    license: 'xxxxxx',
    businessScope: '农资店的经营范围包括农药原药、化肥、种子等'
  },
  legalPerson: {
    name: '胡杰',
    idNumber: '04010419900311375X',
    idType: '身份证',
    phone: '16274728649'
  },
  contacts: [
    { name: '张三', phone: '15629657690' },
    { name: '李四', phone: '15629657691' }
  ],
  accountInfo: {
    accountName: 'xxxxxxxxxx',
    phoneNumber: 'xxxxxxxxxx'
  },
  supplierRating: {
    qualificationLevel: '一级认证',
    creditLevel: '优秀'
  },
  attachments: [
    { index: 1, name: 'xxx', remark: '许可证' },
    { index: 2, name: 'xxx', remark: '许可证' }
  ],
  auditOpinion: {
    content: ''
  },
  operationLogs: [
    { operation: '创建', operator: '张三', operationTime: '2025-10-01 10:00:00', description: '创建供应商' },
    { operation: '修改', operator: '李四', operationTime: '2025-10-02 12:00:00', description: '修改供应商信息' }
  ]
});

const enterEditMode = () => {
  console.log('进入编辑模式');
};

const saveChanges = () => {
  console.log('保存修改', formData.value);
};

const cancelEdit = () => {
  console.log('取消编辑');
};

const previewAttachment = (attachment) => {
  console.log('预览附件', attachment);
};
</script>

<style scoped lang="scss">
.supplier-edit-details {
  padding: 24px;
}
</style>
