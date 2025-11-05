<template>
  <!-- 专家咨询 -->
  <div class="consultation-container">
    <el-card>
      <template #header>
        <div class="flex-center-between">
          <div class="flex-center gap-24">
            <div class="title">专家咨询</div>
            <el-segmented v-model="activeTab" :options="options" @change="handleChange" :disabled="expertLoading" />
          </div>
          <el-button type="text" @click="toggleExpand">
            <el-icon v-if="isExpanded" size="32"><ArrowUpBold /></el-icon>
            <el-icon v-else size="32"><ArrowDownBold /></el-icon>
          </el-button>
        </div>
      </template>

      <div class="content flex gap-12" :class="{ expanded: isExpanded }" v-loading="expertLoading">
        <el-card v-for="expert in expertList" :key="expert.id" class="expert-item" shadow="hover">
          <div class="title-info flex gap-12" @click="handleDetail(expert)">
            <el-avatar :src="getAvatarUrl(expert.hnBaseRegisterFolderVoList)" />
            <div>
              <div>{{ expert.expertName }} - {{ expert.technicalQualification }}</div>
              <div class="flex gap-24 mt-12">
                <el-statistic title="咨询量" :value="expert.questionCount" />
                <el-statistic title="回复量" :value="expert.answerCount" />
              </div>
            </div>
          </div>
          <div class="description">{{ expert.expertInfo }}</div>
          <div class="flex-center-center">
            <el-button @click="handleConsultation(expert)">立即咨询</el-button>
          </div>
        </el-card>
      </div>
    </el-card>
    <!-- 专家详情弹窗 -->
    <ExpertDetailComponent ref="expertDetailRef" @submitSuccess="handleChange"></ExpertDetailComponent>
    <!-- 咨询专家弹窗 -->
    <AskExpertComponent ref="askExpertRef"></AskExpertComponent>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AskExpertComponent from './AskExpertComponent.vue';
import ExpertDetailComponent from './ExpertDetailComponent.vue';
import { technologyExpertList, legalExpertList } from '@/api/mall/expert';

const options = [
  { label: '技术专家', value: 'technology' },
  { label: '法务专家', value: 'legal' }
];
const activeTab = ref('technology');

const isExpanded = ref(false);

const askExpertRef = ref(null);

const expertDetailRef = ref(null);

const expertList = ref([]);

const expertLoading = ref(false);

onMounted(() => {
  getTechnologyExpertList();
});

const handleChange = async () => {
  expertLoading.value = true;
  activeTab.value === 'technology' ? await getTechnologyExpertList() : await getLegalExpertList();
  expertLoading.value = false;
};

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};

// 技术专家列表（无租户）
const getTechnologyExpertList = async () => {
  const res = await technologyExpertList({});
  if (res.code === 200) {
    expertList.value = res.rows;
  }
};

// 法律专家列表（无租户）
const getLegalExpertList = async () => {
  const res = await legalExpertList({});
  if (res.code === 200) {
    expertList.value = res.rows;
  }
};

// 获取头像url
const getAvatarUrl = (imgList) => {
  return imgList.filter((img) => img.fileType === '0')[0]?.ossInfo.url;
};

// 处理立即咨询按钮点击
const handleConsultation = (expert) => {
  // 处理咨询逻辑，例如跳转到咨询页面并传递专家信息
  console.log('咨询专家:', expert, askExpertRef.value);
  askExpertRef.value?.openDialog(expert.id, activeTab.value === 'technology' ? '1' : '2');
};

// 处理查看详情按钮点击
const handleDetail = (expert) => {
  console.log('查看专家详情:', expert, expertDetailRef.value);
  expertDetailRef.value?.openDialog(expert.id, activeTab.value);
};
</script>

<style scoped lang="scss">
.consultation-container {
  .title {
    font-size: 20px;
    font-weight: bold;
  }

  .content {
    min-height: 200px;
    transition: max-height 0.3s ease;

    &.expanded {
      max-height: none;
    }

    .expert-item {
      width: calc(25% - 8px);
      margin-bottom: 10px;
      cursor: pointer;
      .title-info {
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 5px;

        .avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
        }

        .name {
          font-size: 14px;
          font-weight: normal;
          color: var(--color-main);
          cursor: pointer;
        }
      }
      .hot {
        .hot-tag {
          gap: 4px;
          div:first-child {
            color: red;
            font-weight: bold;
          }
          div:last-child {
            font-size: 12px;
            color: #666;
          }
        }
      }

      .description {
        width: 100%;
        height: 80px;
        margin: 12px 0;
        font-size: 12px;
        overflow: hidden; /* 修改为隐藏超出内容 */
        text-overflow: ellipsis;
        display: -webkit-box; /* 添加多行省略号支持 */
        -webkit-line-clamp: 3; /* 限制显示的行数 */
        -webkit-box-orient: vertical; /* 设置盒子方向为垂直 */
      }
    }
  }
}

::v-deep.el-tabs__nav-wrap:after {
  display: none !important;
}
</style>
