<template>
  <!-- 专家咨询 -->
  <div class="consultation-container">
    <div class="title">热门专家</div>
    <div class="content-box">
      <div class="flex-center-between">
        <div class="flex-center gap-12">
          <!-- <div class="title">专家咨询</div> -->
          <!-- <el-segmented v-model="activeTab" :options="options" @change="handleChange" :disabled="expertLoading" /> -->

          <el-button :type="activeTab === 'technology' ? 'primary' : 'text'" plain round
            @click="handleChange('technology')" :disabled="expertLoading">技术专家</el-button>
          <el-button :type="activeTab === 'legal' ? 'primary' : 'text'" plain round @click="handleChange('legal')"
            :disabled="expertLoading">法务专家</el-button>
        </div>
        <div type="text" :class="{ 'rotate-180': isExpanded }" @click="toggleExpand">
          <img src="@/assets/mall/expert-expand-icon.png" width="18" />
        </div>
      </div>

      <div class="content flex gap-12" :class="{ expanded: isExpanded }" v-loading="expertLoading">
        <el-row :gutter="24" style="width: 100%">
          <el-col :span="6" v-for="(expert, index) in expertList" :key="expert.id">
            <el-card class="expert-item" v-show="isExpanded || index < 4">
              <div class="title-info flex-center-center gap-12">
                <div class="avatar-container flex-center-center">
                  <el-avatar :src="getAvatarUrl(expert.hnBaseRegisterFolderVoList)" />
                </div>
                <div class="name">{{ expert.expertName }}</div>
                <div class="qualification">{{ expert.technicalQualification }}</div>
                <div class="description">
                  专家简介：
                  <span>
                    {{ expert.expertInfo || expert.professionalSummary || '暂无简介' }}
                  </span>
                </div>
              </div>
              <div class="flex-center-center gap-12 mt-12">
                <div class="flex-center-center statistic-item">
                  <div class="number">{{ expert.questionCount }}</div>
                  <div class="label">咨询量</div>
                </div>
                <div class="divider"></div>
                <div class="flex-center-center statistic-item">
                  <div class="number">{{ expert.answerCount }}</div>
                  <div class="label">回复量</div>
                </div>
              </div>
              <div class="detail-btn flex-center-center" @click="handleDetail(expert.id)">
                <img src="@/assets/mall/expert-detail-icon.png" width="18" />
                <div>详情</div>
              </div>
              <div @click="handleConsultation(expert)" class="consultation-btn flex-center-center">咨询专家</div>
            </el-card>
          </el-col>
        </el-row>

        <el-empty v-if="expertList.length === 0" description="暂无专家入驻，请耐心等待"></el-empty>
      </div>
    </div>
    <!-- 咨询专家弹窗 -->
    <AskExpertComponent ref="askExpertRef" @submitSuccess="handleChange"></AskExpertComponent>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AskExpertComponent from './AskExpertComponent.vue';
import { technologyExpertList, legalExpertList } from '@/api/mall/expert';

const emit = defineEmits(['detailChange']);

const activeTab = ref('technology');

const isExpanded = ref(false);

const askExpertRef = ref(null);

const expertList = ref([]);

const expertLoading = ref(false);

onMounted(() => {
  getTechnologyExpertList();
});

const handleChange = async (tab) => {
  activeTab.value = tab;
  expertLoading.value = true;
  activeTab.value === 'technology' ? await getTechnologyExpertList() : await getLegalExpertList();
  expertLoading.value = false;
  console.log(activeTab.value);
};

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};

// 技术专家列表（无租户）
const getTechnologyExpertList = async () => {
  const res = await technologyExpertList({ storageStatus: '1', startStopStatus: '1' });
  if (res.code === 200) {
    expertList.value = res.rows;
  }
};

// 法律专家列表（无租户）
const getLegalExpertList = async () => {
  const res = await legalExpertList({ storageStatus: '1', startStopStatus: '1' });
  if (res.code === 200) {
    expertList.value = res.rows;
  }
};

// 获取头像url
const getAvatarUrl = (imgList) => {
  return imgList.filter((img) => img.fileType === '0')[0]?.ossInfo?.url;
};

// 处理立即咨询按钮点击
const handleConsultation = (expert) => {
  // 处理咨询逻辑，例如跳转到咨询页面并传递专家信息
  askExpertRef.value?.openDialog(expert.id, activeTab.value === 'technology' ? '1' : '2');
};

// 处理查看详情按钮点击
const handleDetail = (id: string) => {
  emit('detailChange', { id, type: 'expertDetail', expertType: activeTab.value, expertId: id });
};
</script>

<style scoped lang="scss">
.consultation-container {
  .title {
    color: #3d3d3d;
    font-size: 20px;
    font-weight: bold;
    border-left: 4px solid #108c58;
    padding-left: 8px;
    line-height: 16px;
    margin-bottom: 16px;
  }

  .content-box {
    background: #ffffff;
    border-radius: 8px;
    padding: 20px;
  }

  .content {
    margin-top: 16px;

    &.expanded {
      max-height: none;
    }

    .expert-item {
      margin-bottom: 10px;
      cursor: pointer;
      border-radius: 8px;
      position: relative;

      .title-info {
        font-size: 16px;
        margin-bottom: 5px;
        padding: 20px 16px;
        background-color: rgba(16, 140, 88, 0.05);
        border-radius: 8px;
        flex-direction: column;

        .avatar-container {
          width: 74px;
          height: 74px;
          border-radius: 50%;
          padding: 4px;
          border: 1px solid #108c58;
        }

        .el-avatar {
          width: 70px;
          height: 70px;
          border-radius: 50%;
        }

        .name {
          font-size: 16px;
          font-weight: bold;
          color: #333;
        }

        .qualification {
          font-size: 16px;
          font-weight: bold;
          color: var(--color-main);
        }

        .description {
          width: 100%;
          font-size: 16px;
          font-weight: bold;
          color: #333;
          height: 40px;
          overflow: hidden;
          /* 修改为隐藏超出内容 */
          text-overflow: ellipsis;
          // 超出展示省略号
          display: -webkit-box;
          /* 添加多行省略号支持 */
          -webkit-line-clamp: 2;
          /* 限制显示的行数 */
          -webkit-box-orient: vertical;

          /* 设置盒子方向为垂直 */
          span {
            font-size: 14px;
            color: #333;
            font-weight: 500;
          }
        }
      }

      .statistic-item {
        flex-direction: column;

        .number {
          font-size: 24px;
          font-weight: bold;
          color: var(--color-main);
          font-family: YouSheBiaoTiYuan, YouSheBiaoTiYuan;
        }

        .label {
          font-size: 14px;
          font-weight: 500;
          color: #3d3d3d;
          font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
        }
      }

      .divider {
        width: 1px;
        height: 24px;
        margin: 0 24px;
        border-left: 1px dashed #d8d8d8;
      }

      .consultation-btn {
        width: 163px;
        height: 40px;
        background: rgba(16, 140, 88, 0.1);
        border-radius: 20px;
        border: 1px solid #108c58;
        cursor: pointer;
        font-size: 14px;
        font-weight: bold;
        color: var(--color-main);
        margin: 20px auto 0 auto;

        &:hover {
          opacity: 0.8;
        }
      }

      .detail-btn {
        position: absolute;
        gap: 6px;
        top: 28px;
        right: 36px;
        color: var(--color-main);
        font-size: 16px;
        font-weight: bold;
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

      .rotate-180 {
        transform: rotate(180deg);
      }
    }
  }
}

::v-deep.el-tabs__nav-wrap:after {
  display: none !important;
}
</style>
