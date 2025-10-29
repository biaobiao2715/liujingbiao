<template>
  <!-- 专家咨询 -->
  <div class="consultation-container">
    <el-card>
      <template #header>
        <div class="header">
          <div class="title">专家咨询</div>
          <el-button type="text" @click="toggleExpand">
            <span v-if="isExpanded">▲</span>
            <span v-else>▼</span>
          </el-button>
        </div>

        <el-tabs v-model="activeTab" @tab-change="switchTab">
          <el-tab-pane v-for="tab in tabs" :key="tab" :label="tab" :name="tab"></el-tab-pane>
        </el-tabs>
      </template>

      <div class="content flex gap-12" :class="{ expanded: isExpanded }">
        <el-card v-for="expert in filteredExperts" :key="expert.id" class="expert-item">
          <div class="title-info flex-center">
            <!-- <img :src="expert.avatar" alt="专家头像" class="avatar" /> -->
            <div class="avatar flex-center">
              <el-icon size="32"><User /></el-icon>
            </div>
            <div class="name">{{ expert.name }} · {{ expert.specialty }}</div>
          </div>
          <div class="hot flex gap-12">
            <div class="hot-tag flex-center">
              <div>1120</div>
              <div>咨询量</div>
            </div>
            <div class="hot-tag flex-center">
              <div>2102</div>
              <div>回复量</div>
            </div>
          </div>
          <div class="description">{{ expert.description }}</div>
          <div class="flex-center-center">
            <el-button @click="handleConsultation(expert)">立即咨询</el-button>
          </div>
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const tabs = ['热门专家', '技术专家', '法务专家'];
const activeTab = ref(tabs[0]);
const isExpanded = ref(false);

const experts = ref([
  {
    id: 1,
    name: '张三',
    specialty: '热门专家',
    description:
      '专家简介XXX，男，出生于XXXX年，湖北省高级农艺师，毕业于XXXXXX，XX学历，XXXX年参加工作，从业年限XXXX年，目前就职于XXXXXX。主要从事全县XXXXX推广工作',
    avatar: 'path/to/avatar1.jpg'
  },
  {
    id: 2,
    name: '李四',
    specialty: '技术专家',
    description:
      '专家简介XXX，男，出生于XXXX年，湖北省高级农艺师，毕业于XXXXXX，XX学历，XXXX年参加工作，从业年限XXXX年，目前就职于XXXXXX。主要从事全县XXXXX推广工作',
    avatar: 'path/to/avatar1.jpg'
  }
]);

const filteredExperts = ref(experts.value);

const switchTab = (tab: string) => {
  activeTab.value = tab;
  // 根据 tab 切换专家数据
  filteredExperts.value = experts.value.filter((expert) => expert.specialty.includes(tab));
};

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};

// 处理立即咨询按钮点击
const handleConsultation = (expert) => {
  // 处理咨询逻辑，例如跳转到咨询页面并传递专家信息
  console.log('咨询专家:', expert);
};
</script>

<style scoped lang="scss">
.consultation-container {
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
    .title {
      font-size: 20px;
      font-weight: bold;
    }
    .el-tabs {
      flex-grow: 1;
      margin-left: 10px;
    }

    .el-button {
      font-size: 16px;
      padding: 0;
    }
  }

  .content {
    transition: max-height 0.3s ease;

    &.expanded {
      max-height: none;
    }

    .expert-item {
      width: calc(25% - 8px);
      border-radius: 8px;
      border: 1px solid #ddd;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      margin-bottom: 10px;

      .title-info {
        display: flex;
        align-items: center;
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
