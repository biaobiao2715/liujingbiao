<!--
  标题: EditDetails.vue
  功能: 企业编辑详情页
  说明: 用于企业编辑自己的详细信息
  当前版本: 1.0
  开发信息: Created by 刘景彪 2025-10-15
-->
<template>
  <div class="supplier-edit-details">
    <!-- 基础信息 -->
    <el-form :model="formData" label-width="140px">
      <div class="detail-form-card">
        <div class="detail-form-card-header">
          <div class="card-title">企业基础信息</div>
          <div class="card-close">产品详情</div>
        </div>
        <el-row :gutter="20" class="detail-form">
          <el-col :span="12">
            <el-form-item label="企业编码">
              <el-input v-model="formData.enterpriseNumber" disabled></el-input>
            </el-form-item>

            <el-form-item label="企业名称">
              <el-input v-model="formData.companyName" disabled></el-input>
            </el-form-item>

            <el-form-item label="注册资本">
              <el-input v-model="formData.signUpCapital" disabled></el-input>
            </el-form-item>

            <el-form-item label="注册地址">
              <el-input v-model="formData.signUpAddress" disabled></el-input>
            </el-form-item>

            <el-form-item label="办公地址">
              <el-input v-model="formData.officeAddress" disabled></el-input>
            </el-form-item>

            <el-form-item label="资质等级">
              <el-select v-model="formData.credentialLevel" placeholder="资质等级" filterable clearable disabled>
                <el-option v-for="dict in plat_qualification_grade" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="信用等级">
              <el-select v-model="formData.creditLevel" placeholder="信用等级" filterable clearable disabled>
                <el-option v-for="dict in plat_credit_rating" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="审核状态">
              <el-select v-model="formData.reviewStatus" placeholder="审核状态" filterable clearable disabled>
                <el-option v-for="dict in review_status" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>

            <el-form-item label="社会统一信用代码">
              <el-input v-model="formData.licenseNumber" disabled></el-input>
            </el-form-item>

            <el-form-item label="注册日期">
              <el-input v-model="formData.signUpTime" disabled></el-input>
            </el-form-item>

            <el-form-item label="营业执照">
              <img :src="urlImage" height="200px" width="200px" alt="营业执照" />
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="企业经营范围">
              <el-input v-model="formData.businessScope" type="textarea" autosize disabled></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <div class="detail-form-card">
        <div class="detail-form-card-header">
          <div class="card-title">法人信息</div>
        </div>
        <el-row :gutter="20" class="detail-form">
          <el-col :span="12">
            <el-form-item label="法人姓名">
              <el-input v-model="contactF.contactUserName" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话">
              <el-input v-model="contactF.contactPhone" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="证件类型">
              <el-input v-model="idType" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="证件号码">
              <el-input v-model="contactF.contactIdCard" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="法人身份证明">
              <el-input v-model="contactF.contactIdCard" disabled></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <div class="detail-form-card">
        <div class="detail-form-card-header">
          <div class="card-title">申请人</div>
        </div>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="申请人">
              <el-input v-model="contactF.contactUserName"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话">
              <el-input v-model="contactF.contactPhone"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="个人身份证明">
              <el-input v-model="contactF.contactIdCard"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="授权文件">
              <el-input v-model="idType"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <div class="detail-form-card">
        <div class="detail-form-card-header">
          <div class="card-title">个人信息</div>
        </div>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="姓名">
              <el-input v-model="contactF.contactUserName" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="出生年月">
              <el-input v-model="contactF.contactIdCard"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="身份证号">
              <el-input v-model="idType"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号">
              <el-input v-model="contactF.contactPhone" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系地址">
              <el-input v-model="contactF.contactPhone"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <div class="detail-form-card">
        <div class="detail-form-card-header">
          <div class="card-title">贷款信息</div>
        </div>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="贷款金额">
              <el-input v-model="contactF.contactUserName"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="贷款周期">
              <el-input v-model="contactF.contactIdCard"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="还款方式">
              <el-input v-model="idType"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="收款卡银行">
              <el-input v-model="contactF.contactPhone"></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="银行卡号">
              <el-input v-model="idType"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12"></el-col>
          <el-col :span="12">
            <el-form-item label="银行卡正反面">
              <el-input v-model="contactF.contactPhone"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 操作按钮 -->
      <el-row type="flex" justify="center" :gutter="5" style="margin-top: 30px">
        <el-col :span="3"><el-button v-throttle type="primary">取消申请</el-button></el-col>
        <el-col :span="3"><el-button v-throttle type="primary" plain>返回</el-button></el-col>
      </el-row>

      <div style="height: 160px"></div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance, toRefs, onMounted, type ComponentInternalInstance } from 'vue';
import { baseEnterpriseInfoId } from '@/api/platform/enterprise/index';
import { getEnterpriseLoanInfo, getPersonalLoanInfo } from '@/api/financeFront/LoanProducts/index';
import { useUserStore } from '@/store/modules/user';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { review_status, plat_qualification_grade, plat_credit_rating } = toRefs<any>(
  proxy?.useDict('review_status', 'plat_qualification_grade', 'plat_credit_rating')
);
const userStore = useUserStore();
const loading = ref(false);
const formData = ref<any>({});
const contactF = ref<{ contactUserName?: string; contactIdCard?: string; contactPhone?: string }>({});
const idType = ref('身份证');
const urlImage = ref<string>('');

onMounted(async () => {
  // 采购商
  if (userStore.userType == '1') {
    const res = await getPersonalLoanInfo(userStore.userId);
    if (res.code === 200) {
      formData.value = res.data || {};
      urlImage.value = formData.value.licenseImageUrl || '';
      contactF.value = {
        contactUserName: formData.value.contactUserName,
        contactIdCard: formData.value.contactIdCard,
        contactPhone: formData.value.contactPhone
      };
    }
  }
  // 供应商/企业
  if (userStore.userType == '2' || userStore.userType == '3') {
    const res = await getEnterpriseLoanInfo(userStore.userId);
    console.log('res==', res);
    if (res.code === 200) {
      formData.value = res.data || {};
      urlImage.value = formData.value.licenseImageUrl || '';
      const legal = formData.value.contacts.find((c: any) => c.contactUserType === '1');
      if (legal) {
        contactF.value = {
          contactUserName: legal.contactUserName,
          contactIdCard: legal.contactIdCard,
          contactPhone: legal.contactPhone
        };
      }
    }
  }
});
</script>
<style scoped lang="scss">
.detail-form-card {
  width: 100%;
  padding: 10px 20px 20px 20px;
  background: #ffffff;
  border-radius: 8px 8px 8px 8px;
  margin-bottom: 20px;
}

.detail-form-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  padding-bottom: 9px;
  border-bottom: 1px dashed #d8d8d8;
}

.card-title {
  height: 30px;
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  font-weight: 500;
  font-size: 14px;
  color: #108c58;
  line-height: 30px;
}
.card-title::before {
  content: '';
  display: inline-block;
  margin-right: 4px;
  width: 2px;
  height: 10px;
  background: #108c58;
  border-radius: 4px 4px 4px 4px;
}

.card-close {
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  font-weight: 400;
  font-size: 14px;
  color: #ffffff;

  width: 86px;
  height: 30px;
  line-height: 30px;
  text-align: center;
  background: #108c58;
  border-radius: 4px 4px 4px 4px;
}
</style>
